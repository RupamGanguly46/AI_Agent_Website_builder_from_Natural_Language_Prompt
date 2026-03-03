from ai.app.services.github_services import clone_repo, init_repo


def load_or_clone_repo(state):
    mode = state.get("tech_input_mode")

    if mode == "github":
        repo_url = input("Enter GitHub repository URL: ").strip()
        clone_repo(repo_url)
        state["repo_url"] = repo_url

    elif mode == "upload":
        local_path = input("Enter local project folder path: ").strip()
        repo_url = init_repo(local_path)
        state["repo_url"] = repo_url

    elif mode == "scratch":
        print("No existing repo provided. Will generate project from scratch.")
        state["repo_url"] = None

    else:
        print("Invalid mode selected.")

    return state