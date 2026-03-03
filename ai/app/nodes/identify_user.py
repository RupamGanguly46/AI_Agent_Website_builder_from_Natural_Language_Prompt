def identify_user_type(state):
    user_input = input(
        "Are you a technical user (developer) or a non-technical user? "
    ).strip().lower()

    state["user_type"] = user_input
    return state