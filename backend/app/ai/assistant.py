"""Simple rule-based menu/allergen FAQ assistant (no external LLM call).

The kitchen vertical has no MenuItem table yet (Section 5.2 of the design doc),
so this answers from a small static reference list. Swap for a real RAG pipeline
over documents/ once that entity/table exists.
"""

_MENU_ITEMS = [
    {
        "name": "Nut-Free Garden Pasta",
        "ingredients": ["pasta", "tomato", "basil", "olive oil"],
        "allergens": [],
    },
    {
        "name": "Chocolate Almond Torte",
        "ingredients": ["chocolate", "almond", "flour", "egg"],
        "allergens": ["nuts", "egg", "gluten"],
    },
    {
        "name": "Grilled Salmon Bowl",
        "ingredients": ["salmon", "rice", "broccoli"],
        "allergens": ["fish"],
    },
    {
        "name": "Citrus Herb Salad",
        "ingredients": ["mixed greens", "citrus", "olive oil"],
        "allergens": [],
    },
    {
        "name": "Creamy Mushroom Risotto",
        "ingredients": ["rice", "mushroom", "butter", "parmesan"],
        "allergens": ["dairy"],
    },
]

_KNOWN_ALLERGENS = ["nuts", "gluten", "dairy", "egg", "fish", "shellfish"]


def _allergen_mentions(allergen: str) -> list[str]:
    """An allergen tag like "nuts" should also match singular phrasing like "nut-free"."""
    singular = allergen[:-1] if allergen.endswith("s") else allergen
    return [allergen, singular]


def _find_named_item(message: str):
    return next((item for item in _MENU_ITEMS if item["name"].lower() in message), None)


def generate_response(prompt: str) -> str:
    message = prompt.strip().lower()
    if not message:
        return "Please provide a question."

    named_item = _find_named_item(message)
    if named_item:
        allergen_text = (
            f"Contains: {', '.join(named_item['allergens'])}."
            if named_item["allergens"]
            else "No listed allergens."
        )
        return (
            f"{named_item['name']} is made with {', '.join(named_item['ingredients'])}. "
            f"{allergen_text}"
        )

    free_from = next(
        (
            a
            for a in _KNOWN_ALLERGENS
            if any(
                f"{m}-free" in message or f"without {m}" in message or f"no {m}" in message
                for m in _allergen_mentions(a)
            )
        ),
        None,
    )
    if free_from:
        matches = [item["name"] for item in _MENU_ITEMS if free_from not in item["allergens"]]
        if not matches:
            return f"We could not find any current menu items free of {free_from}."
        return f"These dishes do not list {free_from} as an allergen: {', '.join(matches)}."

    contains = next(
        (a for a in _KNOWN_ALLERGENS if any(m in message for m in _allergen_mentions(a))),
        None,
    )
    if contains:
        matches = [item["name"] for item in _MENU_ITEMS if contains in item["allergens"]]
        if not matches:
            return f"No current menu item lists {contains} as an allergen."
        return f"These dishes contain {contains}: {', '.join(matches)}."

    if "menu" in message or "dishes" in message or "food" in message:
        return f"Our current menu includes: {', '.join(item['name'] for item in _MENU_ITEMS)}."

    return (
        "I can only answer questions about our current menu items and their ingredients "
        "or allergens. I don't have enough information to answer that one."
    )

