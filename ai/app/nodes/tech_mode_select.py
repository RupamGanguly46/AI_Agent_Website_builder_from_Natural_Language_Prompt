def select_tech_mode(state):
    print("\nChoose input mode:")
    print("1. Upload project files")
    print("2. Provide GitHub repository link")
    print("3. Start from scratch")

    choice = input("Enter option (1/2/3): ").strip()

    mapping = {
        "1": "upload",
        "2": "github",
        "3": "scratch",
    }

    state["tech_input_mode"] = mapping.get(choice, None)
    return state