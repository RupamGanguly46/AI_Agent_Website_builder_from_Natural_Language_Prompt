import os
import json


def apply_code_modifications(state):
    print("\n[Code Modifier] Applying targeted code changes...")

    plan = state.get("json_plan")

    # If plan is not a dict (e.g., float from guard model), skip safely
    if not isinstance(plan, dict):
        print("[Code Modifier] Invalid or non-JSON plan received. Skipping modifications.")
        return state

    # If plan is a string (fallback case), try parsing
    if isinstance(plan, str):
        try:
            plan = json.loads(plan)
        except Exception:
            print("[Code Modifier] Invalid JSON plan format. Skipping.")
            return state

    changes = plan.get("changes", [])

    if not changes:
        print("[Code Modifier] No changes specified in plan.")
        return state

    for idx, change in enumerate(changes, start=1):
        file_path = change.get("file")
        operation = change.get("operation")
        description = change.get("description")

        print(f"\n[Change {idx}]")
        print(f"Operation : {operation}")
        print(f"Target File : {file_path}")
        print(f"Description : {description}")

        # Ensure directories exist for create/update
        if file_path:
            dir_name = os.path.dirname(file_path)
            if dir_name and not os.path.exists(dir_name):
                os.makedirs(dir_name, exist_ok=True)

        # --- Handle Operations ---
        try:
            if operation == "create":
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(f"// Auto-generated file\n// {description}\n")
                print(f"[Code Modifier] Created file: {file_path}")

            elif operation == "update":
                if os.path.exists(file_path):
                    with open(file_path, "a", encoding="utf-8") as f:
                        f.write(f"\n// Update: {description}\n")
                    print(f"[Code Modifier] Updated file: {file_path}")
                else:
                    print(f"[Warning] File not found for update: {file_path}")

            elif operation == "insert":
                if os.path.exists(file_path):
                    with open(file_path, "a", encoding="utf-8") as f:
                        f.write(f"\n// Insert: {description}\n")
                    print(f"[Code Modifier] Inserted content into: {file_path}")
                else:
                    print(f"[Warning] File not found for insert: {file_path}")

            elif operation == "delete":
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"[Code Modifier] Deleted file: {file_path}")
                else:
                    print(f"[Warning] File not found for deletion: {file_path}")

            else:
                print(f"[Warning] Unknown operation type: {operation}")

        except Exception as e:
            print(f"[Error] Failed to apply change on {file_path}: {e}")

    return state