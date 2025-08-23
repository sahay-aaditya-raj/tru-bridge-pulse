import os
import asyncio
import websockets
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Set your GROQ_API_KEY from environment variables
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    # It's better to raise an error at startup if the key is missing
    raise ValueError("GROQ_API_KEY environment variable not set")

# Initialize the LLM once globally
llm = ChatGroq(
    groq_api_key=groq_api_key,
    temperature=0.7,
    model_name="llama-3.1-8b-instant"
)

# Prompt template remains the same
template = """
You are a Socratic-based chatbot designed to conduct a routine medical checkup. 
Your role is to ask thoughtful, open-ended questions that encourage the user to share details about their health, lifestyle, and habits. 

### Guidelines:
- Begin with friendly, routine checkup questions (age, gender, sleep, diet, exercise, stress, medical history, current symptoms).
- For each answer, ask one clear and relevant follow-up question that digs deeper (e.g., if they mention stress, ask about its cause, frequency, or coping mechanisms).
- Keep your tone empathetic, conversational, and supportive. Avoid sounding like an interrogation.
- Do **not** give medical advice or diagnoses. Always remind the user that this conversation is for **informational purposes only**, and they should consult a doctor for medical advice.
- Continue asking until at least 6–8 key areas are covered (sleep, diet, exercise, stress, lifestyle habits, medical history, symptoms).
- Once you feel you have gathered enough information, stop asking questions. 
- Once you see that the questions are very similar or repeatitive you should only return the single word "EXIT"
- No repeated questions are allowed .The end of conversation should be a clear EXIT word .

### Formatting:
- If still in questioning mode, respond with a **single empathetic follow-up question** only.
- If ready to end, only return a single word **EXIT**

---

Current conversation history:
{chat_history}

User's latest message: {input}

Your response:
"""


summary_template = """
You are a medical assistant AI.
Summarize the following conversation between a patient and a health checkup bot
into a concise, structured report for a doctor to quickly review.

Conversation:
{chat_history}

Format the summary with these sections if available:
- Demographics (age, gender)
- Sleep
- Diet
- Exercise
- Stress
- Lifestyle habits
- Medical history
- Current symptoms
- Other observations

Keep it short, factual, and easy to scan.
"""

summary_prompt = PromptTemplate(input_variables=["chat_history"], template=summary_template)
summary_chain = LLMChain(llm=llm, prompt=summary_prompt)
prompt = PromptTemplate(input_variables=["chat_history", "input"], template=template)
# This is the core handler for each WebSocket connection
async def socratic_chatbot_handler(websocket):
    """
    Handles a single WebSocket connection, managing the chatbot conversation.
    `path` is the requested path from the client, e.g., '/'.
    """
    # path = websocket.path  # You can still access the path if needed
    # print(f"New connection from {websocket.remote_address} on path {path}")


    # Each new connection gets its own memory and chain to maintain
    # an independent conversation history.
    memory = ConversationBufferMemory(memory_key="chat_history")
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

    # Send the welcome message immediately upon connection
    welcome_msg = "Hello! I'm your agent for a routine health checkup. How can I help you today?"
    await websocket.send(welcome_msg)
    print(f"Sent welcome message to {websocket.remote_address}")

    # Main message-handling loop
    try:
        async for message in websocket:
            print(f"Received message from {websocket.remote_address}: {message}")

            if not message.strip():
                continue  # Ignore empty messages

            # Run the LLM chain to get a response. We use await because it's an async call.
            response = await chain.ainvoke({"input": message})
            
            # The response object contains the generated text
            response_text = response['text']
            print(f"Generated response: {response_text}")
            if "EXIT" in response_text.strip().upper():
                chat_history = memory.load_memory_variables({})["chat_history"]
                if chat_history:  # Only summarize if there was a conversation
                    summary = await summary_chain.ainvoke({"chat_history": chat_history})
                    summary_text = summary["text"]
                    await websocket.send(summary_text)
                await websocket.send("EXITING.....")
                print(f"Conversation ended for {websocket.remote_address}. Closing connection.")
                break
            # Send the response back to the client
            await websocket.send(response_text)
            print(f"Sent response to {websocket.remote_address}")
            
            # If the model signals the conversation is over, we can close the connection
            if response_text.strip().upper() == "EXIT":
                chat_history = memory.load_memory_variables({})["chat_history"]

                if chat_history:  # Only summarize if there was a conversation
                    summary = await summary_chain.ainvoke({"chat_history": chat_history})
                    summary_text = summary["text"]
                    await websocket.send(summary_text)
                print(f"Conversation ended for {websocket.remote_address}. Closing connection.")
                break # Exit the loop and close the connection
                
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed by client {websocket.remote_address}: {e}")
    except Exception as e:
        print(f"An error occurred with connection {websocket.remote_address}: {e}")
    finally:
        print(f"Connection to {websocket.remote_address} closed.")

# Main function to start the WebSocket server
async def main():
    """Starts the WebSocket server."""
    # Start the server on localhost, port 5001.
    # The handler function is the `socratic_chatbot_handler`.
    server = await websockets.serve(
        socratic_chatbot_handler, 
        "0.0.0.0", 
        5001
    )
    print("WebSocket server started on ws://0.0.0.0:5001")
    # This keeps the server running until it's manually stopped
    await server.wait_closed()

if __name__ == "__main__":
    # Run the main async function to start the server
    asyncio.run(main())