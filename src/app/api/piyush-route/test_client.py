# testing.py
import asyncio
import websockets

async def test_chat():
    uri = "ws://localhost:5001"
    async with websockets.connect(uri) as websocket:
        # Print the welcome message
        welcome = await websocket.recv()
        print(f"🤖 Bot: {welcome}")

        # Interactive loop
        while True:
            user_input = input("🧑 You: ")
            if user_input.lower() in ["exit", "quit"]:
                print("👋 Ending chat...")
                break

            await websocket.send(user_input)

            try:
                response = await websocket.recv()
                print(f"🤖 Bot: {response}")
                if "EXIT" in response:
                    print("Exiting the chat....")
                    break
            except websockets.exceptions.ConnectionClosed:
                print("⚠️ Connection closed by server.")
                break

if __name__ == "__main__":
    asyncio.run(test_chat())