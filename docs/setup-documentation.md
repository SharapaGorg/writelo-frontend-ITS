# Week 3 Setup Documentation

## Project

**Project:** Writelo DevOps Pipeline  
**Track:** DevOps  
**Week:** Week 3 — Initial Prototype and Documentation  
**Pipeline type:** Automatic CI/CD pipeline  
**Deployment rule:** `master → production`, all other branches → `staging`

## Objective

The objective of Week 3 is to create a basic prototype or mock-up of the main DevOps pipeline components and document the required setup steps and configurations.

This prototype demonstrates how the Writelo frontend can be built, packaged into a Docker image, pushed to a self-hosted registry, and deployed to a server automatically after a branch push.

## Prototype scope

The Week 3 prototype includes:

1. GitHub Actions workflow mock-up.
2. Automatic trigger on branch push.
3. Branch-based environment routing.
4. Nuxt 3 / Vue 3 frontend test build.
5. Dockerfile for frontend containerization.
6. Docker image push to Gitea registry.
7. SSH-based server deployment.
8. Staging and production Docker Compose examples.
9. Setup and configuration documentation.

The prototype does not yet include:

1. Full rollback automation.
2. Monitoring and alerting.
3. Advanced integration tests.
4. Security scanning.
5. Backend and database deployment.

These improvements can be added in later iterations.

## Repository structure

```text
writelo_week3_prototype/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml
├── docs/
│   ├── setup-documentation.md
│   └── pipeline-configuration.md
├── scripts/
│   └── deploy.sh
├── Dockerfile
├── .dockerignore
└── README.md
```

## Required tools

| Tool | Purpose |
|---|---|
| GitHub Actions | Runs the automatic CI/CD workflow after push |
| Nuxt 3 / Vue 3 | Frontend application stack and build validation |
| Docker | Builds and runs the application as a container |
| Gitea Registry | Stores Docker images before deployment |
| SSH | Connects to the target server for deployment |

## GitHub Secrets configuration

The following secrets should be configured in GitHub repository settings:

| Secret name | Purpose |
|---|---|
| `REGISTRY_USERNAME` | Username for Docker registry login |
| `REGISTRY_PASSWORD` | Password or token for Docker registry login |
| `IMAGE_NAME` | Full Docker image name used for build and push |
| `PRODUCTION_IMAGE_TAG` | Docker image tag used for production deployments from `master` |
| `STAGING_IMAGE_TAG` | Docker image tag used for staging deployments from non-`master` branches |
| `SERVER_HOST` | Server hostname or IP address used for deployment |
| `SERVER_USERNAME` | SSH username for deployment server |
| `SERVER_SSH_KEY` | Private SSH key for server deployment |
| `PRODUCTION_SERVER_WORKDIR` | Application directory on the server for production deployment |
| `STAGING_SERVER_WORKDIR` | Application directory on the server for staging deployment |

## Server-side setup

Both staging and production servers should have:

1. Docker installed.
2. A deployment directory created, for example:

```bash
mkdir -p /opt/writelo/frontend
```

4. SSH access configured for GitHub Actions.

## Pipeline setup steps

### Step 1 — Add the workflow file

Place the GitHub Actions workflow file in:

```text
.github/workflows/deploy-frontend.yml
```

The workflow runs automatically on every push to any branch.

### Step 2 — Add the Dockerfile

Place the frontend Dockerfile in the project root:

```text
Dockerfile
```

The Dockerfile builds the Nuxt 3 application and runs the production server from `.output/server/index.mjs`.

### Step 3 — Add the deployment script

Place the deployment script in:

```text
scripts/deploy.sh
```

The script logs into the registry, pulls the selected image, and restarts the target service using Docker Compose.

### Step 4 — Configure GitHub Secrets

Add all required secrets in the GitHub repository settings. Without these secrets, the workflow can still be reviewed as a prototype, but real deployment will not run successfully.

### Step 5 — Test the routing logic

Expected behavior:

```text
Push to master      → production deployment
Push to any branch  → staging deployment
```

Examples:

```text
master              → production
feature/login-page  → staging
dev                 → staging
bugfix/navbar       → staging
```

## Expected prototype result

After the setup, the pipeline should be able to:

1. Detect a branch push.
2. Start GitHub Actions automatically.
3. Build the Nuxt 3 frontend.
4. Create a Docker image.
5. Push the image to the Gitea registry.
6. Select staging or production based on branch name.
7. Deploy the image to the selected server.
8. Restart the frontend container.
