def fresh_board() -> dict:
    """Returns the starting state of Rock Paper Scissors."""
    return {
        "choices": {},  # player_symbol -> choice ("rock", "paper", "scissors")
        "winner": None,
        "turn": "both",  # Special turn indicating either/both can play
        "choices_revealed": False,
        "round_result": None  # Descriptive text: e.g., "Rock beats Scissors"
    }

def make_move(state: dict, player_symbol: str, choice: str) -> dict:
    """Make a choice in Rock Paper Scissors.
    
    Returns {"valid": bool, "state": dict, "reason": str}
    """
    if choice not in ["rock", "paper", "scissors"]:
        return {"valid": False, "reason": "Invalid choice. Select rock, paper, or scissors.", "state": state}
    
    choices = state.get("choices", {})
    
    # If the player already chose, don't let them change it to prevent cheating
    if player_symbol in choices:
        return {"valid": False, "reason": "You have already made your choice.", "state": state}
    
    new_choices = choices.copy()
    new_choices[player_symbol] = choice
    
    new_state = state.copy()
    new_state["choices"] = new_choices
    
    # Check if both have chosen
    if len(new_choices) == 2:
        # Evaluate winner
        symbols = list(new_choices.keys())
        p1 = symbols[0]
        p2 = symbols[1]
        c1 = new_choices[p1]
        c2 = new_choices[p2]
        
        new_state["choices_revealed"] = True
        
        if c1 == c2:
            new_state["winner"] = "draw"
            new_state["round_result"] = f"Draw! Both chose {c1}."
        else:
            beats = {
                "rock": "scissors",
                "scissors": "paper",
                "paper": "rock"
            }
            if beats[c1] == c2:
                new_state["winner"] = p1
                new_state["round_result"] = f"{c1.capitalize()} beats {c2}. Player {p1} wins!"
            else:
                new_state["winner"] = p2
                new_state["round_result"] = f"{c2.capitalize()} beats {c1}. Player {p2} wins!"
                
        # Since round is complete, turn is None
        new_state["turn"] = None
    else:
        # Still waiting for the other player
        # Keep turn as "both" but we can check who is left
        new_state["turn"] = "both"
        new_state["winner"] = None
        new_state["round_result"] = "Waiting for partner..."
        
    return {"valid": True, "state": new_state}
