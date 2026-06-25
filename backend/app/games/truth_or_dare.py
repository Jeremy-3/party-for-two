import random

TRUTHS = [
    "What was your very first impression of me?",
    "If we could travel anywhere in the world right now, where would we go?",
    "What is a small habit of mine that always makes you smile?",
    "What is your favorite memory of us together?",
    "What is something you're too embarrassed to tell me but is actually sweet?",
    "What is the most romantic thing you think I've done for you?",
    "If you had to describe our relationship in three words, what would they be?",
    "What is your favorite way to spend a lazy Sunday with me?",
    "What is one thing about our future together that you are most excited about?",
    "What is a dream you've never shared with anyone else?",
    "When did you first realize you had feelings for me?",
    "What song always reminds you of me?"
]

DARES = [
    "Give your partner a gentle kiss on the forehead or cheek.",
    "Text your partner a sweet/romantic message right now.",
    "Whisper a sweet secret in your partner's ear.",
    "Sing a line of your favorite love song to your partner.",
    "Give your partner a 15-second back massage.",
    "Stare into your partner's eyes for 10 seconds without laughing.",
    "Give your partner a warm, tight hug for 10 seconds.",
    "Make a silly face and try to make your partner laugh.",
    "Do a 10-second dramatic dance for your partner.",
    "Tell your partner 3 specific things you appreciate about them right now.",
    "Give your partner a gentle hand massage.",
    "Compliment your partner in a foreign language or accent."
]

def fresh_board() -> dict:
    """Returns the starting state of Truth or Dare."""
    return {
        "current_card": None,
        "selected_type": None,  # "truth" or "dare"
        "turn": "player1",
        "winner": None,
        "history": []
    }

def draw_card(selected_type: str) -> dict:
    """Draw a random prompt of the selected type."""
    prompts = TRUTHS if selected_type == "truth" else DARES
    prompt = random.choice(prompts)
    return {
        "type": selected_type,
        "text": prompt
    }

def make_move(state: dict, player_symbol: str, move_data: dict) -> dict:
    """Make a choice/action in Truth or Dare.
    
    Returns {"valid": bool, "state": dict, "reason": str}
    """
    action = move_data.get("action")
    if action == "draw":
        # Draw a card
        card_type = move_data.get("card_type")
        if card_type not in ["truth", "dare"]:
            return {"valid": False, "reason": "Invalid card type", "state": state}
        card = draw_card(card_type)
        new_state = state.copy()
        new_state["current_card"] = card
        new_state["selected_type"] = card_type
        new_state["winner"] = None
        return {"valid": True, "state": new_state}
        
    elif action == "complete":
        if not state.get("current_card"):
            return {"valid": False, "reason": "No active card to complete", "state": state}
        # Player completes the challenge and wins a point
        new_state = state.copy()
        new_state["winner"] = player_symbol
        # Pass the turn to the other player for the next round
        new_state["turn"] = "player2" if player_symbol == "player1" else "player1"
        return {"valid": True, "state": new_state}
        
    elif action == "skip":
        if not state.get("current_card"):
            return {"valid": False, "reason": "No active card to skip", "state": state}
        # Skip the challenge, no points awarded, changes turn
        new_state = state.copy()
        new_state["current_card"] = None
        new_state["selected_type"] = None
        new_state["winner"] = None
        new_state["turn"] = "player2" if player_symbol == "player1" else "player1"
        return {"valid": True, "state": new_state}
        
    return {"valid": False, "reason": "Unknown action", "state": state}
