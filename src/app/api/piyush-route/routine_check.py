from fastapi import FastAPI
import uvicorn
import os
import asyncio
import websockets
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from summary_promt import summary_template
from session_prompt import template
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Initialize FastAPI app after loading env and LLM
app = FastAPI()

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

summary_prompt = PromptTemplate(input_variables=["chat_history"], template=summary_template)
summary_chain = LLMChain(llm=llm, prompt=summary_prompt)
prompt = PromptTemplate(input_variables=["chat_history", "input"], template=template)

# FastAPI placeholder route
@app.get("/ping")
async def ping():
    return {"message": "pong"}

# This is the core handler for each WebSocket connection
async def socratic_chatbot_handler(websocket):
    """
    Handles a single WebSocket connection, managing the chatbot conversation.
    `path` is the requested path from the client, e.g., '/'.
    """
    # Each new connection gets its own memory and chain to maintain
    # an independent conversation history.
    memory = ConversationBufferMemory(memory_key="chat_history")
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)
    await websocket.send("")
    # Main message-handling loop
    try:
        async for message in websocket:
            print(f"Received message from {websocket.remote_address}: {message}")
            if "EXIT" in message.strip().upper():
                chat_history = memory.load_memory_variables({})["chat_history"]
                print(f"Final chat history for {websocket.remote_address}:\n{chat_history}")
                if chat_history: 
                    pass # Only summarize if there was a conversation
                    summary = await summary_chain.ainvoke({"chat_history": chat_history})
                    summary_text = summary["text"]
                    await websocket.send(summary_text)
                await websocket.send("EXITING.....")
                print(f"Conversation ended for {websocket.remote_address}. Closing connection.")
                break
            if not message.strip():
                continue  # Ignore empty messages

            # Run the LLM chain to get a response. We use await because it's an async call.
            response = await chain.ainvoke({"input": message})

            # The response object contains the generated text
            response_text = response['text']
            print(f"Generated response: {response_text}")
            
            # Send the response back to the client
            await websocket.send(response_text)
            print(f"Sent response to {websocket.remote_address}")        
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed by client {websocket.remote_address}: {e}")
    except Exception as e:
        print(f"An error occurred with connection {websocket.remote_address}: {e}")
    finally:
        print(f"Connection to {websocket.remote_address} closed.")


# Helper async function to start the websocket server
async def start_websocket_server():
    server = await websockets.serve(
        socratic_chatbot_handler,
        "0.0.0.0",
        5001
    )
    print("WebSocket server started on ws://0.0.0.0:5001")
    await server.wait_closed()

# Helper async function to start FastAPI server
async def start_fastapi_server():
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

# Main function to run both servers concurrently
async def main():
    await asyncio.gather(
        start_websocket_server(),
        start_fastapi_server()
    )

if __name__ == "__main__":
    # Run the main async function to start the server
    asyncio.run(main())