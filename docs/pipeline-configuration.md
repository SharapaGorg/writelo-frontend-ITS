# Pipeline Configuration Explanation

## Pipeline overview

The Writelo DevOps pipeline is an automatic CI/CD workflow for deploying the frontend application.

The pipeline starts after a developer pushes code to a Git branch. GitHub Actions runs the build and deployment process. The branch name determines the target environment.

## Branch-based deployment rule

| Branch | Target environment |
|---|---|
| `master` | Production |
| Any other branch | Staging |

This rule prevents feature or development branches from being deployed directly to production.

## Stage 0 — Code push

**Tool:** Git branch  
**Purpose:** Start the pipeline automatically.  
**Output:** New workflow run in GitHub Actions.

## Stage 1 — Workflow trigger

**Tool:** GitHub Actions  
**Purpose:** Run the CI/CD process after a push event.  
**Output:** Active CI/CD workflow run.

## Stage 2 — Test build

**Tool:** Nuxt 3 / Vue 3  
**Purpose:** Check whether the frontend project can be built successfully.  
**Output:** Passed or failed build result.

This stage acts as a basic quality gate. If the build fails, the Docker image is not created and deployment does not continue.

## Stage 3 — Build Docker image

**Tool:** Dockerfile + Docker  
**Purpose:** Package the frontend application into a reproducible container image.  
**Output:** Docker image tagged by branch and commit.

Image tag example:

```text
gitea.radolyn.com/writelo/frontend:feature-login-abc1234
```

## Stage 4 — Push Docker image

**Tool:** Gitea Registry  
**Purpose:** Store the built Docker image before deployment.  
**Output:** Image available in `gitea.radolyn.com`.

The registry works as the deployment artifact storage. Servers pull the image from this registry instead of building the application locally.

## Stage 5 — Deploy to server

**Tool:** SSH + Docker Compose  
**Purpose:** Update the selected environment.  
**Output:** Staging or production frontend service restarted.

The workflow connects to the target server through SSH, pulls the image, and restarts the service using Docker Compose.

## Why these tools were selected

| Tool | Rationale |
|---|---|
| Nuxt 3 / Vue 3 | Existing frontend stack; suitable for modern production-ready web interfaces |
| Docker | Makes deployment reproducible and independent from local server configuration |
| GitHub Actions | Provides automatic workflow execution after push and supports branch-based conditions |
| Gitea Registry | Self-hosted image storage that matches the project infrastructure |
| SSH | Simple and realistic deployment method for server-based deployment |
| Docker Compose | Easy way to restart and manage the frontend container on the server |

## Technical limitations of the Week 3 prototype

1. The workflow has not yet been tested on a real server.
2. Server credentials and real environment files are not included.
3. Rollback is not automated yet.
4. Monitoring is not included yet.
5. The prototype focuses on frontend deployment only.