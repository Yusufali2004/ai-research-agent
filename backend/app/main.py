import os
import uuid
import json
import asyncio
import base64

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from google.adk.runners import Runner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.sessions import InMemorySessionService
from google.genai import types

from research_agent.agent import root_agent

app = FastAPI(title="AI Research Voice Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
APP_NAME = "research_voice_agent"


@app.get("/")
async def root():
    return {"status": "ok", "agent": "AI Research Voice Agent", "version": "1.0.0"}


@app.websocket("/ws/voice/{session_id}")
async def voice_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    internal_id = f"{session_id}_{uuid.uuid4().hex[:8]}"
    print(f"Connected | session={internal_id}")

    try:
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=session_id,
            session_id=internal_id,
        )
    except Exception as e:
        print(f"Session error: {e}")
        await websocket.close()
        return

    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
    live_request_queue = LiveRequestQueue()

    # response_modalities accepts list[str] per actual RunConfig source
    run_config = RunConfig(
        streaming_mode=StreamingMode.BIDI,
        response_modalities=["AUDIO"],
<<<<<<< HEAD
=======
        support_cfc=True,
>>>>>>> 7fb98f8e2e8a820ac14c660b055fb48b24730a16
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
            )
        ),
    )

    tool_active = asyncio.Event()

    async def agent_to_client():
        try:
            async for event in runner.run_live(
                session_id=internal_id,
                user_id=session_id,
                live_request_queue=live_request_queue,
                run_config=run_config,
            ):
                # Audio and text parts
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, "inline_data") and part.inline_data:
                            b64 = base64.b64encode(part.inline_data.data).decode()
                            await websocket.send_json({
                                "type": "audio",
                                "data": b64,
                                "mime_type": part.inline_data.mime_type,
                            })
                        if hasattr(part, "text") and part.text:
                            await websocket.send_json({
                                "type": "agent_transcript",
                                "text": part.text,
                            })

                # Tool call started — pause mic audio
                if event.get_function_calls():
                    tool_active.set()
                    for fn in event.get_function_calls():
                        print(f"Tool: {fn.name}")
                        await websocket.send_json({
                            "type": "tool_use",
                            "tool": fn.name,
                            "status": "calling",
                        })

                # Tool finished — resume mic audio
                if event.get_function_responses():
                    tool_active.clear()
                    await websocket.send_json({
                        "type": "tool_use",
                        "tool": "done",
                        "status": "done",
                    })

                # Turn complete — always resume
                if hasattr(event, "turn_complete") and event.turn_complete:
                    tool_active.clear()
                    await websocket.send_json({"type": "turn_complete"})

        except Exception as e:
            print(f"agent_to_client error: {e}")
            try:
                await websocket.send_json({"type": "error", "message": str(e)})
            except Exception:
                pass

    async def client_to_agent():
        try:
            while True:
                raw = await websocket.receive_text()
                msg = json.loads(raw)

                if msg["type"] == "audio":
                    # Drop audio while tool is running to avoid 1008
                    if tool_active.is_set():
                        continue
                    live_request_queue.send_realtime(
                        types.Blob(
                            data=base64.b64decode(msg["data"]),
                            mime_type="audio/pcm;rate=16000",
                        )
                    )
                elif msg["type"] == "text":
                    if not tool_active.is_set():
                        live_request_queue.send_content(
                            types.Content(role="user", parts=[types.Part(text=msg["text"])])
                        )
                elif msg["type"] == "end_turn":
                    live_request_queue.close()
                    break

        except WebSocketDisconnect:
            print(f"Disconnected | session={internal_id}")
            live_request_queue.close()
        except Exception as e:
            print(f"client_to_agent error: {e}")
            live_request_queue.close()

    try:
        await asyncio.gather(agent_to_client(), client_to_agent())
    except Exception as e:
        print(f"Session error: {e}")
    finally:
        print(f"Session ended | session={internal_id}")