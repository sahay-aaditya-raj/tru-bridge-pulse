from fastapi import FastAPI
import uvicorn
import os
import asyncio
import websockets
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from summary_promt import summary_template
from session_prompt import template
from dotenv import load_dotenv
import json
from typing import Dict, Any
from pymongo import MongoClient
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client

# Setup MongoDB client (do this once globally)
MONGO_URI = os.getenv("MONGODB_URI", "mongodb+srv://aaditya:hello678@cluster0.6nnrnnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(MONGO_URI)
db = client["test"]        # database name
collection = db["summaries"]

load_dotenv()  # Load environment variables from .env file

# Initialize FastAPI app after loading env and LLM
app = FastAPI()


def handle_severity(summary_json):
    severity = summary_json.get("severity", "").lower()

    if severity == "severe":
        # make_missed_call_to_doctor()
        send_email_to_doctor(summary_json)
        return "Alert sent to doctor due to severe symptoms."
    
    elif severity == "moderate":
        return "You should consult the doctor."
    
    elif severity == "mild":
        return "You are going good! I will catch up with you tomorrow."
    else:
        return "Severity not specified."

def make_missed_call_to_doctor():
    # Twilio credentials from environment variables
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")  # Twilio number
    to_number = os.getenv("DOCTOR_PHONE_NUMBER")    # Doctor's number

    if not all([account_sid, auth_token, from_number, to_number]):
        print("Twilio environment variables not set. Cannot make call.")
        return

    client = Client(account_sid, auth_token)

    # Make a short call (missed call simulation)
    call = client.calls.create(
        to=to_number,
        from_=from_number,
        url="http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient",  # Just a placeholder URL
    )
    print(f"Initiated missed call to doctor, Call SID: {call.sid}")

def format_value(value):
    """
    Recursively format dicts and lists into HTML.
    """
    if isinstance(value, dict):
        inner_rows = "".join(
            f"<tr><td>{k}</td><td>{format_value(v)}</td></tr>" 
            for k, v in value.items()
        )
        return f"<table style='border:1px solid #ccc; margin:5px;'>{inner_rows}</table>"
    elif isinstance(value, list):
        items = "".join(f"<li>{format_value(v)}</li>" for v in value)
        return f"<ul>{items}</ul>"
    else:
        return str(value)

def send_email_to_doctor(summary_json):
    sender_email = "piyushkheria23@gmail.com"
    sender_password = "xsveuwyxubmyktfl"
    doctor_email = "aadityarajaashu@gmail.com"

    html_rows = "".join(
        f"<tr><td>{key}</td><td>{format_value(value)}</td></tr>"
        for key, value in summary_json.items() if key !='_id'
    )

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.5; }}
            h2 {{ color: #2E86C1; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
        </style>
    </head>
    <body>
        <h2>Patient Alert: Severe Symptoms Detected</h2>
        <p>The following patient has reported severe symptoms:</p>
        <table>
            <tr><th>Field</th><th>Value</th></tr>
            {html_rows}
        </table>
        <p>Please take necessary action immediately.</p>
    </body>
    </html>
    """
    msg = MIMEMultipart("alternative")
    msg['From'] = sender_email
    msg['To'] = doctor_email
    msg['Subject'] = "Patient Alert: Severe Symptoms Detected"
    msg.attach(MIMEText(html_content, 'html'))

    # Connect to SMTP server (like Nodemailer)
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)



# Set your Gemini API key from environment variables
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Initialize the Gemini LLM once globally
llm = ChatGoogleGenerativeAI(
    google_api_key=gemini_api_key,
    temperature=0.7,
    model="gemini-1.5-flash"
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
                        value = handle_severity(summary_json)
                        await websocket.send(value)
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
        "127.0.0.1",
        5001
    )
    print("WebSocket server started on ws://127.0.0.1:5001")
    await server.wait_closed()

# Helper async function to start FastAPI server
async def start_fastapi_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="info")
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