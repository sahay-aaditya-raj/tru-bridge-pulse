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
import json
from typing import Dict, Any
from pymongo import MongoClient

# Setup MongoDB client (do this once globally)
MONGO_URI = os.getenv("MONGODB_URI", "mongodb+srv://aaditya:hello678@cluster0.6nnrnnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(MONGO_URI)
db = client["test"]        # database name
collection = db["summaries"]

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

async def socratic_chatbot_handler(websocket):
    """
    Handles a single WebSocket connection, managing the chatbot conversation.
    """
    memory = ConversationBufferMemory(memory_key="chat_history")
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

    user_info: Dict[str, Any] = {}

    # Step 1: Ask for user info by sending empty string
    await websocket.send("")

    try:
        async for message in websocket:
            print(f"Received message from {websocket.remote_address}: {message}")

            # --- Step 2: First message should be user info JSON ---
            if not user_info:
                try:
                    print("Parsing user info...")
                    user_info = json.loads(message)
                    required_keys = {"name", "username", "age", "gender"}
                    if not required_keys.issubset(user_info.keys()):
                        raise ValueError("Missing required user info fields")

                    # Store user info in memory
                    memory.chat_memory.add_user_message(
                        f"User Info: Name={user_info['name']}, Username={user_info['username']}, "
                        f"Age={user_info['age']}, Gender={user_info['gender']}"
                    )
                    print(f"Stored user info in memory: {user_info}")
                    first_response = await chain.ainvoke({"input": "Start a conversation based on user info"})
                    await websocket.send(first_response['text'])
                    continue
                except Exception as e:
                    print(f"⚠️ Failed to parse user info: {e}")
                    await websocket.send("Invalid user info JSON format.")
                    continue

            # --- Step 3: Handle EXIT ---
            if "EXIT" in message.strip().upper():
                chat_history = memory.load_memory_variables({})["chat_history"]
                print(f"Final chat history for {user_info.get('username','unknown')}:\n{chat_history}")

                if chat_history:
                    summary = await summary_chain.ainvoke({"chat_history": chat_history})
                    summary_text = summary["text"]

                    try:
                        summary_json: Dict[str, Any] = json.loads(summary_text)
                        summary_json["username"] = user_info.get("username", "unknown")

                        collection.insert_one(summary_json)
                        print("Summary inserted into MongoDB ✅")
                    except json.JSONDecodeError:
                        collection.insert_one({
                            "username": user_info.get("username", "unknown"),
                            "raw_summary": summary_text
                        })
                        print("⚠️ Stored raw summary with username")

                await websocket.send("EXITING.....")
                print(f"Conversation ended for {user_info.get('username','unknown')}. Closing connection.")
                break

            # --- Step 4: Normal conversation ---
            if not message.strip():
                continue

            response = await chain.ainvoke({"input": message})
            response_text = response['text']
            print(f"Generated response: {response_text}")

            await websocket.send(response_text)
            print(f"Sent response to {user_info.get('username','unknown')}")

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed by client {websocket.remote_address}: {e}")
    except Exception as e:
        print(f"An error occurred with connection {websocket.remote_address}: {e}")
    finally:
        print(f"Connection to {websocket.remote_address} closed.")
        memory.chat_memory.messages = []
        print(f"Cleared memory for {websocket.remote_address}")


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