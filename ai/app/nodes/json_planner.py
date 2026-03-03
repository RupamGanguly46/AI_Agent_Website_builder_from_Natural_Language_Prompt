# from ai.app.services.groq_client import groq_chat
# import json


# def generate_json_plan(state):
#     print("\n[Developer Mode] What specific change or feature do you want?")
#     user_request = input("Describe the change: ")

#     project_summary = state.get("project_summary", "No summary available")

#     prompt = f"""
#     You are an AI developer assistant.
#     Based on the following project summary and user request,
#     generate a structured JSON modification plan.

#     Project Summary:
#     {project_summary}

#     User Request:
#     {user_request}

#     Output JSON format:
#     {{
#       "intent": "...",
#       "changes": [
#         {{
#           "file": "path/to/file",
#           "operation": "create | update | insert | delete",
#           "description": "what to modify"
#         }}
#       ]
#     }}
#     Only output valid JSON.
#     """

#     response = groq_chat(prompt)

#     try:
#         state["json_plan"] = json.loads(response)
#     except Exception:
#         print("\n[Warning] Could not parse JSON, storing raw response.")
#         state["json_plan"] = response

#     print("\n[Generated JSON Plan]:\n", state["json_plan"])
#     return state
import json
import re
from ai.app.services.groq_client import groq_chat


def generate_json_plan(state):
    print("\n[Developer Mode] What specific change or feature do you want?")
    user_request = input("Describe the change: ")

    project_summary = state.get("project_summary", "No summary available")

    prompt = f"""
You are an AI developer assistant.

Based on the following project summary and user request,
generate a structured JSON modification plan.

Project Summary:
{project_summary}

User Request:
{user_request}

Output ONLY valid JSON in this format:
{{
  "intent": "...",
  "changes": [
    {{
      "file": "path/to/file",
      "operation": "create | update | insert | delete",
      "description": "what to modify"
    }}
  ]
}}
"""

    response = groq_chat(prompt)

    print("\n[Raw LLM Response]:\n", response)

    # -------------------------------
    # Robust JSON Extraction Logic
    # -------------------------------
    try:
        # 1. Try extracting from ```json fenced block
        fenced_match = re.search(r"```json\s*(\{.*?\})\s*```", response, re.DOTALL)

        if fenced_match:
            json_str = fenced_match.group(1)
        else:
            # 2. Fallback: find first {...} JSON object
            brace_match = re.search(r"\{.*\}", response, re.DOTALL)
            json_str = brace_match.group(0) if brace_match else None

        if json_str:
            parsed_plan = json.loads(json_str)
            state["json_plan"] = parsed_plan
            print("\n[Generated JSON Plan]:\n", parsed_plan)
        else:
            print("\n[Warning] No JSON object detected in LLM response.")
            state["json_plan"] = None

    except Exception as e:
        print("\n[Warning] Could not parse JSON plan:", str(e))
        state["json_plan"] = None

    return state