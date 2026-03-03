from datetime import datetime


def version_and_commit_changes(state):
    print("\n[GitHub Versioning] Preparing commit for applied changes...")

    plan = state.get("json_plan")

    # If plan is not valid dict (e.g., raw string), skip safely
    if not isinstance(plan, dict):
        print("[GitHub Versioning] No valid JSON plan found. Skipping commit.")
        return state

    intent = plan.get("intent", "AI modification")
    changes = plan.get("changes", [])

    if not changes:
        print("[GitHub Versioning] No changes detected. Nothing to commit.")
        return state

    commit_entries = []

    for change in changes:
        file_path = change.get("file", "unknown_file")
        operation = change.get("operation", "update")
        description = change.get("description", "")

        entry = f"{operation.upper()} → {file_path} | {description}"
        commit_entries.append(entry)

    # Create commit message
    commit_message = f"AI: {intent}"

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    commit_record = {
        "timestamp": timestamp,
        "message": commit_message,
        "changes": commit_entries,
    }

    # Append to commit history in state
    if "commit_history" not in state or state["commit_history"] is None:
        state["commit_history"] = []

    state["commit_history"].append(commit_record)

    # Print commit simulation
    print(f"\n[GitHub Commit Created]")
    print(f"Message : {commit_message}")
    print(f"Time    : {timestamp}")
    print("Changes :")
    for entry in commit_entries:
        print(f"  - {entry}")

    print("\n[GitHub Versioning] Commit stored in state history.")

    return state