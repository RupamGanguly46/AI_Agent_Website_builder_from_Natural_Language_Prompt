# RESTful Application Programming Interface (API) Reference

## 1. Introduction
This reference enumerates the exposure surfaces of the backend computational environment. Communication with the endpoints relies strictly on standard HTTP methodologies with payload transmission primarily formatted via `application/json`. 

## 2. Global Protocol Constructs
- **Base URI:** `http://<host>:<port>/`
- **Authentication Strategy:** Ephemeral Tokenization (To be integrated explicitly in Production phase 2)
- **Response Schemas:** All standard responses encapsulate a defined status flag, returning 2xx class statuses upon success, and 4xx or 5xx class status codes outlining standard HTTP fault structures upon error.

## 3. Core Resource Endpoints

### 3.1 Project Resource Controllers (`/projects`)
This subset handles the initialization, retrieval, and persistent storage mechanics of the generated projects.

- `POST /projects/create`
  - **Purpose:** Initializes a new isolated namespace and establishes the initial Git repository tree structure.
  
- `GET /projects/`
  - **Purpose:** Retrieves a paginated matrix of existing structural projects related to the current isolated workspace.

- `GET /projects/:id`
  - **Purpose:** Fetches the comprehensive monolithic metadata object of a specific project identifier.

### 3.2 File Subsystem Operators
These routes manipulate the physical artifacts resulting from the generative processes.

- `GET /projects/:id/files`
  - **Purpose:** Computes the current hierarchical Abstract Syntax Tree (AST) mapping of the workspace artifacts.

- `GET /projects/:id/files/*`
  - **Purpose:** Executes a read stream for a specifically targeted alphanumeric file path mapped within the namespace.

- `PUT /projects/:id/files/*`
  - **Purpose:** Mutates the file data stream directly. This invocation automatically generates a corresponding deterministic Git checksum within the Version Control Subsystem.

### 3.3 Artificial Intelligence Orchestration (`/ai`)
This grouping dictates the interfacing protocol for autonomous code generation heuristics.

- `POST /ai/prompt`
  - **Purpose:** The primary ingestion pipeline. Transmits semantic language sequences to the LangGraph node network. This route inherently initiates the sequential agent loop, waiting asynchronously for finalization prior to payload response.

## 4. Development Instance Management
These endpoints provide lifecycle bindings for child processes simulating remote environments locally.

- `POST /projects/:id/start`
  - **Purpose:** Initiates a daemonized child process bound to the specified project dependency configuration.
- `POST /projects/:id/stop`
  - **Purpose:** Transmits a SIGTERM signal to the corresponding process, safely concluding daemon bindings.
- `GET /projects/:id/server-status`
  - **Purpose:** Poller endpoint establishing continuous connection checking.
- `GET /projects/:id/logs`
  - **Purpose:** Retrieves stdout and stderr streams cached by the targeted computational daemon instance.
