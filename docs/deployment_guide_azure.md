# Deploying AI Builder to Microsoft Azure ☁️

This guide walks you through the split-deployment strategy for Azure:
1. **Azure Static Web Apps** (Frontend - Vite/React)
2. **Azure App Service** (Backend - Node.js/Express)

---

## Part 1: Deploying the Backend (App Service)

We'll deploy the Express backend to a Linux App Service. This supports background jobs (like your Vite Dev Server previews) and allows for persistent storage.

### Step 1: Create the App Service
1. Go to the [Azure Portal](https://portal.azure.com/).
2. Search for **"App Services"** and click **Create** > **Web App**.
3. **Basics Tab**:
   * **Resource Group**: Create a new one (e.g., `ai-builder-rg`).
   * **Name**: Choose a unique name (e.g., `ai-builder-api-123`). This will be your backend URL (`https://ai-builder-api-123.azurewebsites.net`).
   * **Publish**: `Code`
   * **Runtime stack**: `Node 20 LTS` (or Node 18 LTS).
   * **Operating System**: `Linux`
   * **Pricing Plan**: Choose **Basic (B1)** or **Standard (S1)**. *(Do not choose Free (F1). It does not support 'Always On' which is required for your AI background tasks).*
4. Click **Review + Create**, then **Create**.

### Step 2: Configure Environment Variables
1. Once deployed, go to your new App Service.
2. In the left menu, scroll down to **Settings** > **Environment variables**.
3. Add the following **App settings** (copy values from your local `.env`):
   * `MONGO_URI`: `your-mongodb-connection-string`
   * `GEMINI_API_KEY`: `your-gemini-key`
   * `GROQ_API_KEY`: `your-groq-key`
   * `FRONTEND_URL`: `(We will set this later after deploying the frontend)`
   * `NODE_ENV`: `production`
4. Click **Apply** to save.

### Step 3: Turn on `Always On`
1. Go to **Settings** > **Configuration**.
2. Click the **General settings** tab.
3. Find **Always On** and turn it **ON** (prevents the server from sleeping and killing AI jobs).
4. Click **Save**.

### Step 4: Deploy the Code
1. In the left menu, go to **Deployment** > **Deployment Center**.
2. **Source**: Select `GitHub`.
3. Authenticate with GitHub and select your `ai-builder` repository.
4. **Branch**: `main`.
5. Under Build provider, let GitHub Actions build it. Azure will auto-generate a `.yaml` file in your repo.
   * *Important*: The GitHub action will deploy the whole repo to the App Service. Since `server.js` is inside the `backend/` folder, Azure needs to know how to start it.
6. Go back to **Settings** > **Configuration** > **General settings**.
7. Under **Startup Command**, type: `node backend/server.js` (or `npm start` if your root `package.json` points to it).
8. Save.

---

## Part 2: Setting up Persistent Storage (Optional but Recommended)

By default, the Linux `/home` directory is persistent, so your projects will naturally save there.
However, to ensure they survive across different instances and scales, you can mount Azure Files.

1. Create an **Azure Storage Account**.
2. Inside the Storage account, create a **File share** named `projects-share`.
3. Go back to your **App Service** > **Settings** > **Path mappings**.
4. Click **New Azure Storage Mount**.
   * **Storage Account**: Select your account.
   * **Storage Type**: `Azure Files`
   * **Storage Container**: `projects-share`
   * **Mount path**: `/mounts/projects`
5. Go to **Environment variables** and add a new setting:
   * `AZURE_STORAGE_MOUNT_PATH` = `/mounts/projects`
*(The backend code has already been updated to automatically use this mount path if it finds this variable!)*

---

## Part 3: Deploying the Frontend (Static Web Apps)

1. Go back to the Azure home page.
2. Search for **"Static Web Apps"** and click **Create**.
3. **Basics Tab**:
   * **Resource Group**: Select your existing `ai-builder-rg`.
   * **Name**: Choose a name (e.g., `ai-builder-ui`).
   * **Plan Type**: `Free`
4. **Deployment details**:
   * **Source**: `GitHub`
   * **Repository**: Select your `ai-builder` repo.
   * **Branch**: `main`
   * **Build Presets**: `React` or `Vue/Vite`
   * **App location**: `/frontend/` (Important! Keep the slashes)
   * **Output location**: `dist` (Important for Vite)
5. Click **Review + Create**, then **Create**.
6. When completed, copy the generated **URL**.

---

## Part 4: Final Link-up

1. Go to your **Backend App Service**.
2. Add your new Static Web App URL to the `FRONTEND_URL` environment variable.
3. Open your project locally. Update `frontend/src/api/api.js` line 5 to point `BUILD_URL` to your **Backend App Service URL**.
   * Example: `const BUILD_URL = import.meta.env.PROD ? 'https://ai-builder-api-123.azurewebsites.net' : 'http://127.0.0.1:5001';`
4. Git Commit and Push! 
   * This will trigger GitHub Actions to deploy the updated frontend (with the correct backend URL) and the backend (with the correct CORS).
