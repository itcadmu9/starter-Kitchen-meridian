"""Small FAQ assistant for common Meridian Kitchens staff questions."""

_FAQS = {
    "allergen": "Each menu item lists its allergens below the ingredients. Ask about a specific dish for more detail.",
    "vegetarian": "Check the ingredients and dietary details on each menu item, or ask about a specific dish.",
    "gluten-free": "Check the ingredients and allergen information shown on each menu item before ordering.",
    "dietary": "I can help with ingredients, allergens, and dietary options listed for menu items.",
}

_WELCOME = "I can help with menu items, ingredients, allergens, and dietary options. Try one of the FAQ questions below."
_OUT_OF_SCOPE = "I only answer questions about menu items, ingredients, allergens, and dietary options. Please use Inventory or Loyalty for operational questions."


def generate_response(prompt: str) -> str:
    if not prompt.strip():
        return _WELCOME
    question = prompt.lower()
    if any(keyword in question for keyword in ("inventory", "stock", "outlet", "loyalty", "reorder")):
        return _OUT_OF_SCOPE
    for keyword, answer in _FAQS.items():
        if keyword in question:
            return answer
    return _WELCOME
