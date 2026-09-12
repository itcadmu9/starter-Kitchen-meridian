"""Small FAQ assistant for common Meridian Kitchens staff questions."""

_FAQS = {
    "needs attention": "The items needing attention are the ingredients with zero stock. Open Inventory Stock and look for the Out of stock status.",
    "low stock": "Open Inventory Stock to see ingredients below their reorder threshold. Use the outlet filter to narrow the list.",
    "out of stock": "Items with zero quantity are marked Out of stock and appear in the inventory status summary.",
    "add stock": "Open Inventory Stock, select Add stock beside an ingredient, enter the quantity received, and submit.",
    "loyalty": "Loyalty Program shows the top members first, followed by the guest points balance list.",
    "outlet": "Inventory combines all cloud-kitchen outlets by default. Use the Outlet menu to view one kitchen at a time.",
}

_WELCOME = "I can help with inventory, outlets, stock updates, and loyalty. Try one of the FAQ questions below."


def generate_response(prompt: str) -> str:
    if not prompt.strip():
        return _WELCOME
    question = prompt.lower()
    for keyword, answer in _FAQS.items():
        if keyword in question:
            return answer
    return _WELCOME
