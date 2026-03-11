"""
tools.py — Custom research tools the ADK agent can call.
"""


def plan_research_subtopics(topic: str) -> dict:
    """
    Breaks a broad research topic into 4-5 focused subtopics.
    Call this FIRST when a user asks to research any topic.

    Args:
        topic: The main research topic the user wants to explore.

    Returns:
        A dictionary with planning instructions for the agent.
    """
    return {
        "status": "planned",
        "topic": topic,
        "instruction": (
            f"You are researching: '{topic}'. "
            "Break this into 4-5 clear subtopics covering fundamentals, "
            "current state, challenges, applications, and future directions. "
            "For each subtopic use google_search to find current information. "
            "Then synthesize everything into a clear spoken summary."
        ),
    }


def format_research_summary(
    topic: str,
    key_findings: list[str],
    top_resources: list[str],
    project_ideas: list[str],
) -> dict:
    """
    Formats a complete research summary ready to be spoken aloud.
    Call this AFTER gathering all information to deliver the final report.

    Args:
        topic: The research topic that was investigated.
        key_findings: List of 3-5 most important discoveries.
        top_resources: List of 3-4 recommended papers, courses, or tools.
        project_ideas: List of 2-3 hands-on project ideas.

    Returns:
        A structured summary dictionary.
    """
    return {
        "topic": topic,
        "key_findings": key_findings,
        "top_resources": top_resources,
        "project_ideas": project_ideas,
        "spoken_intro": (
            f"I've completed my research on {topic}. "
            "Here are the key findings, top resources, and project ideas."
        ),
    }


def suggest_followup_questions(topic: str, subtopics_covered: list[str]) -> dict:
    """
    Suggests follow-up questions the user might want to explore next.
    Call this at the END of every research session.

    Args:
        topic: The main topic that was researched.
        subtopics_covered: List of subtopics already discussed.

    Returns:
        A dictionary with follow-up suggestions.
    """
    return {
        "topic": topic,
        "covered": subtopics_covered,
        "suggestion": (
            f"Based on your research into {topic}, "
            "would you like to dive deeper into any specific area, "
            "explore related topics, or get more project ideas?"
        ),
    }