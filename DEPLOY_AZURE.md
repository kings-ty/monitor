# 🚀 Azure App Service Deployment Guide (submarine-monitor)

This document contains the exact commands used to deploy the frontend and backend of the `submarine-monitor` project to Azure.

## Prerequisites
Ensure you are logged into Azure CLI with the correct account.
```bash
az login
```

## Step 1: Build the React Application
First, you must compile the React TypeScript application into static files (inside the `/dist` folder). This ensures what we upload to Azure is minified and ready for production.

```bash
cd /home/ty/submarine/monitor
npm install  # (If you haven't installed dependencies yet)
npm run build
```

## Step 2: Zip the App Folder
To upload securely and quickly, bundle the entire directory except for unnecessary files like `node_modules` and `.git`. Azure Kudu will install dependencies on the cloud.

```bash
# This creates an 'app.zip' package excluding heavy folders.
zip -q -r app.zip . -x "node_modules/*" -x ".git/*" -x "*.zip"
```

## Step 3: Deploy to Existing Web App Resource
Since the `submarine-monitor` web app already exists inside the `tfl-app-rg` resource group, we deploy directly by pushing the zip file. This tells Azure to extract and run the `npm start` command (which spins up the `server.js` Node.js express server that serves your React app).

```bash
az webapp deploy \
  --name submarine-monitor \
  --resource-group tfl-app-rg \
  --src-path app.zip \
  --type zip
```

## Troubleshooting
If the deployment succeeds but the page doesn't update, clear your browser cache or force-refresh (`Ctrl + Shift + R`). If it throws an error in Azure, you can inspect the Azure Deployment Logs via the Azure Portal -> App Services -> submarine-monitor -> Log stream.
