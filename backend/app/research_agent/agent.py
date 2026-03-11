import os
import sys
from google.adk.agents import Agent
from google.adk.tools import google_search

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from tools import plan_research_subtopics, format_research_summary, suggest_followup_questions

MODEL = os.getenv("DEMO_AGENT_MODEL", "gemini-2.0-flash-live-001")

root_agent = Agent(
    name="research_voice_agent",
    model=MODEL,
    description="A voice-powered AI research assistant.",
    instruction="""You are ResearchAI, a friendly voice research assistant.
When given a topic:
1. Call plan_research_subtopics() to break it into subtopics
2. Use google_search to find current info on each subtopic
3. Synthesize findings into a clear spoken summary
4. Call format_research_summary() to organise final output
5. Call suggest_followup_questions() to keep the conversation going
Speak naturally and clearly. Be enthusiastic and helpful.""",
    tools=[google_search, plan_research_subtopics, format_research_summary, suggest_followup_questions],
)