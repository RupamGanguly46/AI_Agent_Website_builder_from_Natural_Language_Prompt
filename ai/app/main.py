from ai.app.graph import build_graph

if __name__ == "__main__":
    graph = build_graph()

    initial_state = {
        "user_type": None,
        "tech_input_mode": None,
        "prompt": None,
        "framework": None,
        "repo_url": None,
        "project_summary": None,
        "json_plan": None,
        "commit_history": [],
    }

    result = graph.invoke(initial_state)
    print("\nFinal State:\n", result)