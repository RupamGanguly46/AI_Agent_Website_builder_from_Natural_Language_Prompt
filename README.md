# 🌐 AI Website Builder — Multi-Agent, DL-Powered & Developer-Friendly 🚀

> Build complete websites from natural language, assist developers with code-aware AI, get smart feature recommendations using Deep Learning, and manage everything with version control — all in one intelligent platform.

---

## ✨ What is this?

An AI-driven, multi-agent website builder that supports:
- 🧑‍🎨 **Non-Tech Users** → Generate full websites from prompts  
- 👨‍💻 **Developers** → AI-assisted editing & completion of existing code  
- 🧠 **Deep Learning Recommendations** → Smart feature suggestions users may want  
- 🔄 **Versioning System** → Track, compare & rollback changes  
- ⚙️ **Framework Selection** → React / Next.js / Vue / etc.

Built with **LangGraph** for orchestration + a **Deep Learning model** for intelligent recommendations.

---

## 🧠 Core Idea

Instead of a single AI call, this project uses **multiple specialized agents** working together in a workflow:
- Prompt understanding
- Smart recommendations
- Conditional flow (Dev vs Non-Tech)
- Code generation / editing
- Version tracking
- Deployment preparation

---

## 🔁 System Flow

```mermaid
flowchart TD
    A[User Input: Prompt / Form] --> B[Prompt Generator Agent]
    B --> C[Deep Learning Recommendation Model]
    C --> D{Mode Selection}

    D -->|Non-Tech User| E[Full Website Generator Agent]
    D -->|Developer Mode| F[Code Analyzer Agent]

    F --> G[Code Editor Agent]
    E --> H[Generated Website Code]
    G --> H

    H --> I[Version Manager]
    I --> J{More Changes?}

    J -->|Yes| C
    J -->|No| K[Export / Deploy Website]
```
