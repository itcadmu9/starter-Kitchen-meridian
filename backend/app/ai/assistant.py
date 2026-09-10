"""Stub AI assistant — swap for a real LLM call (RAG over documents/, etc.) later."""

_CANNED_RESPONSE = (
    "I'm the Meridian Kitchens assistant stub. Ask me about inventory, "
    "loyalty, or reorders once I'm wired up to a real model."
)


def generate_response(prompt: str) -> str:
    if not prompt.strip():
        return "Please provide a question."
    return _CANNED_RESPONSE
