from fastapi import FastAPI, WebSocket
import os
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from summary_promt import summary_template
from session_prompt import template
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Initialize LLM
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")

llm = ChatGroq(
    groq_api_key=groq_api_key,
    temperature=0.7,
    model_name="llama-3.1-8b-instant"
)

summary_prompt = PromptTemplate(input_variables=["chat_history"], template=summary_template)
summary_chain = LLMChain(llm=llm, prompt=summary_prompt)
prompt = PromptTemplate(input_variables=["chat_history", "input"], template=template)


@app.get("/ping")
async def ping():
    return {"message": "pong"}


@app.websocket("/check")
async def websocket_endpoint(websocket: WebSocket):
    """Generic WebSocket handler for arbitrary routes."""
    await websocket.accept()
    memory = ConversationBufferMemory(memory_key="chat_history")
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

    welcome_msg = f"Hello! I'm your agent for a routine health checkup. How can I help you today?"
    await websocket.send_text(welcome_msg)

    try:
        while True:
            message = await websocket.receive_text()
            if not message.strip():
                continue

            if message.strip().upper() == "EXIT":
                chat_history = memory.load_memory_variables({}).get("chat_history")
                if chat_history:
                    summary = await summary_chain.ainvoke({"chat_history": chat_history})
                    await websocket.send_text(summary["text"])
                await websocket.send_text("EXITING...")
                break

            response = await chain.ainvoke({"input": message})
            await websocket.send_text(response["text"])

    except Exception as e:
        print(f"Error in WebSocket route : {e}")
    finally:
        await websocket.close()
        print(f"WebSocket connection closed for route '")