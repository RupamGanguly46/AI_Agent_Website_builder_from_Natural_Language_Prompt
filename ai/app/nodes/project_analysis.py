# from ai.app.services.groq_client import groq_chat


# def analyze_project(state):
#     print("\n[AI] Analyzing project structure using Groq LLM...")

#     prompt = """
#     Analyze a typical web project and describe:
#     - Framework (React, Next.js, Node, etc.)
#     - Main folders
#     - Entry point files
#     - Overall architecture summary
#     Return a concise summary.
#     """

#     summary = groq_chat(prompt)
#     state["project_summary"] = summary

#     print("\n[Project Summary]:\n", summary)
#     return state
from ai.app.services.groq_client import groq_chat


def analyze_project(state):
    print("\n[AI] Analyzing project structure using Groq LLM...")

    # If scratch mode (no repo yet), ask for context first
    if state.get("tech_input_mode") == "scratch":
        framework = input("Preferred framework (React / Next.js / Vue): ").strip()
        project_type = input("Type of project (portfolio / dashboard / SaaS): ").strip()

        state["framework"] = framework

        prompt = f"""
        The user wants to build a {project_type} website using {framework}.
        Provide a concise project architecture including:
        - Folder structure
        - Entry files
        - Key components
        - Overall architecture summary
        """

    else:
        # Repo-based analysis prompt
        prompt = """
        Analyze the given web project and describe:
        - Framework used
        - Key folders
        - Entry point files
        - Overall architecture summary
        """

    summary = groq_chat(prompt)
    state["project_summary"] = summary

    print("\n[Project Summary]:\n", summary)
    return state