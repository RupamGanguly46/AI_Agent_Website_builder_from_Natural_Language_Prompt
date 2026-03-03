from typing import TypedDict, List, Optional

class BuilderState(TypedDict):
    user_type: Optional[str]
    tech_input_mode: Optional[str]
    prompt: Optional[dict]
    framework: Optional[str]
    repo_url: Optional[str]
    project_summary: Optional[str]
    json_plan: Optional[dict]
    commit_history: List[str]