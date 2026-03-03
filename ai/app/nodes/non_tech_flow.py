from ai.app.services.groq_client import groq_chat


def ask_non_tech_questions(state):
    website_type = input("Type of website (portfolio/blog/etc): ")
    industry = input("Industry/domain: ")
    style = input("Style preference (dark/minimal/etc): ")
    pages = input("Required pages (comma separated): ")

    state["prompt"] = {
        "website_type": website_type,
        "industry": industry,
        "style": style,
        "pages": [p.strip() for p in pages.split(",")],
    }
    return state


def generate_structured_prompt(state):
    prompt = f"""
    Convert the following website requirements into structured JSON:
    {state['prompt']}
    """

    response = groq_chat(prompt)
    state["prompt"] = response
    return state