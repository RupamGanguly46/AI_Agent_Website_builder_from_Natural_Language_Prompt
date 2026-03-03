# from langgraph.graph import StateGraph, END
# from ai.app.state import BuilderState

# from ai.app.nodes.identify_user import identify_user_type

# def build_graph():
#     graph = StateGraph(BuilderState)

#     graph.add_node("identify_user", identify_user_type)

#     graph.set_entry_point("identify_user")
#     graph.add_edge("identify_user", END)

#     return graph.compile()
# from langgraph.graph import StateGraph, END
# from ai.app.state import BuilderState

# # Node imports
# from ai.app.nodes.identify_user import identify_user_type
# from ai.app.nodes.non_tech_flow import (
#     ask_non_tech_questions,
#     generate_structured_prompt,
# )
# from ai.app.nodes.tech_mode_select import select_tech_mode


# def build_graph():
#     graph = StateGraph(BuilderState)

#     # -------------------------
#     # Add Nodes
#     # -------------------------
#     graph.add_node("identify_user", identify_user_type)

#     # Non-technical flow
#     graph.add_node("non_tech_questions", ask_non_tech_questions)
#     graph.add_node("structured_prompt", generate_structured_prompt)

#     # Technical flow
#     graph.add_node("tech_mode_select", select_tech_mode)

#     # -------------------------
#     # Entry Point
#     # -------------------------
#     graph.set_entry_point("identify_user")

#     # -------------------------
#     # Conditional Branching
#     # -------------------------
#     graph.add_conditional_edges(
#         "identify_user",
#         lambda state: state["user_type"],
#         {
#             "non-technical": "non_tech_questions",
#             "technical": "tech_mode_select",
#         },
#     )

#     # -------------------------
#     # Non-Technical Flow Edges
#     # -------------------------
#     graph.add_edge("non_tech_questions", "structured_prompt")
#     graph.add_edge("structured_prompt", END)

#     # -------------------------
#     # Technical Flow Edges
#     # (next we will extend this)
#     # -------------------------
#     graph.add_edge("tech_mode_select", END)

#     return graph.compile()
# from langgraph.graph import StateGraph, END
# from ai.app.state import BuilderState

# # Node imports
# from ai.app.nodes.identify_user import identify_user_type
# from ai.app.nodes.non_tech_flow import (
#     ask_non_tech_questions,
#     generate_structured_prompt,
# )
# from ai.app.nodes.tech_mode_select import select_tech_mode
# from ai.app.nodes.repo_loader import load_or_clone_repo
# from ai.app.nodes.project_analysis import analyze_project


# def build_graph():
#     graph = StateGraph(BuilderState)

#     # -------------------------
#     # Add Nodes
#     # -------------------------
#     graph.add_node("identify_user", identify_user_type)

#     # Non-technical flow
#     graph.add_node("non_tech_questions", ask_non_tech_questions)
#     graph.add_node("structured_prompt", generate_structured_prompt)

#     # Technical flow
#     graph.add_node("tech_mode_select", select_tech_mode)
#     graph.add_node("repo_loader", load_or_clone_repo)
#     graph.add_node("project_analysis", analyze_project)

#     # -------------------------
#     # Entry Point
#     # -------------------------
#     graph.set_entry_point("identify_user")

#     # -------------------------
#     # Conditional Branching
#     # -------------------------
#     graph.add_conditional_edges(
#         "identify_user",
#         lambda state: state["user_type"],
#         {
#             "non-technical": "non_tech_questions",
#             "technical": "tech_mode_select",
#         },
#     )

#     # -------------------------
#     # Non-Technical Flow
#     # -------------------------
#     graph.add_edge("non_tech_questions", "structured_prompt")
#     graph.add_edge("structured_prompt", END)

#     # -------------------------
#     # Technical Flow
#     # -------------------------
#     graph.add_edge("tech_mode_select", "repo_loader")
#     graph.add_edge("repo_loader", "project_analysis")
#     graph.add_edge("project_analysis", END)

#     return graph.compile()
# from langgraph.graph import StateGraph, END
# from ai.app.state import BuilderState

# # Node imports
# from ai.app.nodes.identify_user import identify_user_type
# from ai.app.nodes.non_tech_flow import (
#     ask_non_tech_questions,
#     generate_structured_prompt,
# )
# from ai.app.nodes.tech_mode_select import select_tech_mode
# from ai.app.nodes.repo_loader import load_or_clone_repo
# from ai.app.nodes.project_analysis import analyze_project
# from ai.app.nodes.json_planner import generate_json_plan


# def build_graph():
#     graph = StateGraph(BuilderState)

#     # -------------------------
#     # Add Nodes
#     # -------------------------
#     graph.add_node("identify_user", identify_user_type)

#     # Non-technical flow
#     graph.add_node("non_tech_questions", ask_non_tech_questions)
#     graph.add_node("structured_prompt", generate_structured_prompt)

#     # Technical flow
#     graph.add_node("tech_mode_select", select_tech_mode)
#     graph.add_node("repo_loader", load_or_clone_repo)
#     graph.add_node("project_analysis", analyze_project)
#     graph.add_node("json_plan", generate_json_plan)

#     # -------------------------
#     # Entry Point
#     # -------------------------
#     graph.set_entry_point("identify_user")

#     # -------------------------
#     # Conditional Branching
#     # -------------------------
#     graph.add_conditional_edges(
#         "identify_user",
#         lambda state: state["user_type"],
#         {
#             "non-technical": "non_tech_questions",
#             "technical": "tech_mode_select",
#         },
#     )

#     # -------------------------
#     # Non-Technical Flow
#     # -------------------------
#     graph.add_edge("non_tech_questions", "structured_prompt")
#     graph.add_edge("structured_prompt", END)

#     # -------------------------
#     # Technical Flow
#     # -------------------------
#     graph.add_edge("tech_mode_select", "repo_loader")
#     graph.add_edge("repo_loader", "project_analysis")
#     graph.add_edge("project_analysis", "json_plan")
#     graph.add_edge("json_plan", END)
#
# #     return graph.compile()
# from langgraph.graph import StateGraph, END
# from ai.app.state import BuilderState

# # Node imports
# from ai.app.nodes.identify_user import identify_user_type
# from ai.app.nodes.non_tech_flow import (
#     ask_non_tech_questions,
#     generate_structured_prompt,
# )
# from ai.app.nodes.tech_mode_select import select_tech_mode
# from ai.app.nodes.repo_loader import load_or_clone_repo
# from ai.app.nodes.project_analysis import analyze_project
# from ai.app.nodes.json_planner import generate_json_plan
# from ai.app.nodes.code_modifier import apply_code_modifications


# def build_graph():
#     graph = StateGraph(BuilderState)

#     # -------------------------
#     # Add Nodes
#     # -------------------------
#     graph.add_node("identify_user", identify_user_type)

#     # Non-technical flow
#     graph.add_node("non_tech_questions", ask_non_tech_questions)
#     graph.add_node("structured_prompt", generate_structured_prompt)

#     # Technical flow
#     graph.add_node("tech_mode_select", select_tech_mode)
#     graph.add_node("repo_loader", load_or_clone_repo)
#     graph.add_node("project_analysis", analyze_project)
#     graph.add_node("json_plan", generate_json_plan)
#     graph.add_node("code_modifier", apply_code_modifications)

#     # -------------------------
#     # Entry Point
#     # -------------------------
#     graph.set_entry_point("identify_user")

#     # -------------------------
#     # Conditional Branching
#     # -------------------------
#     graph.add_conditional_edges(
#         "identify_user",
#         lambda state: state["user_type"],
#         {
#             "non-technical": "non_tech_questions",
#             "technical": "tech_mode_select",
#         },
#     )

#     # -------------------------
#     # Non-Technical Flow
#     # -------------------------
#     graph.add_edge("non_tech_questions", "structured_prompt")
#     graph.add_edge("structured_prompt", END)

#     # -------------------------
#     # Technical Flow
#     # -------------------------
#     graph.add_edge("tech_mode_select", "repo_loader")
#     graph.add_edge("repo_loader", "project_analysis")
#     graph.add_edge("project_analysis", "json_plan")
#     graph.add_edge("json_plan", "code_modifier")
#     graph.add_edge("code_modifier", END)

#     return graph.compile()
from langgraph.graph import StateGraph, END
from ai.app.state import BuilderState

# Node imports
from ai.app.nodes.identify_user import identify_user_type
from ai.app.nodes.non_tech_flow import (
    ask_non_tech_questions,
    generate_structured_prompt,
)
from ai.app.nodes.tech_mode_select import select_tech_mode
from ai.app.nodes.repo_loader import load_or_clone_repo
from ai.app.nodes.project_analysis import analyze_project
from ai.app.nodes.json_planner import generate_json_plan
from ai.app.nodes.code_modifier import apply_code_modifications
from ai.app.nodes.github_versioning import version_and_commit_changes


def build_graph():
    graph = StateGraph(BuilderState)

    # -------------------------
    # Add Nodes
    # -------------------------
    graph.add_node("identify_user", identify_user_type)

    # Non-technical flow
    graph.add_node("non_tech_questions", ask_non_tech_questions)
    graph.add_node("structured_prompt", generate_structured_prompt)

    # Technical flow
    graph.add_node("tech_mode_select", select_tech_mode)
    graph.add_node("repo_loader", load_or_clone_repo)
    graph.add_node("project_analysis", analyze_project)
    graph.add_node("json_plan", generate_json_plan)
    graph.add_node("code_modifier", apply_code_modifications)
    graph.add_node("github_versioning", version_and_commit_changes)

    # -------------------------
    # Entry Point
    # -------------------------
    graph.set_entry_point("identify_user")

    # -------------------------
    # Conditional Branching
    # -------------------------
    graph.add_conditional_edges(
        "identify_user",
        lambda state: state["user_type"],
        {
            "non-technical": "non_tech_questions",
            "technical": "tech_mode_select",
        },
    )

    # -------------------------
    # Non-Technical Flow
    # -------------------------
    graph.add_edge("non_tech_questions", "structured_prompt")
    graph.add_edge("structured_prompt", END)

    # -------------------------
    # Technical Flow
    # -------------------------
    graph.add_edge("tech_mode_select", "repo_loader")
    graph.add_edge("repo_loader", "project_analysis")
    graph.add_edge("project_analysis", "json_plan")
    graph.add_edge("json_plan", "code_modifier")
    graph.add_edge("code_modifier", "github_versioning")
    graph.add_edge("github_versioning", END)

    return graph.compile()