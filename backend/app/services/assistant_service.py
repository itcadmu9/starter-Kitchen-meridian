"""Assistant service — thin wrapper so the router doesn't call app.ai directly."""

from app.ai.assistant import generate_response


def ask_assistant(prompt: str) -> str:
    return generate_response(prompt)
