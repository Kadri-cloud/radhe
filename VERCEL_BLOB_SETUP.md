# Connecting Your Project to Vercel Blob

This guide outlines the steps to connect your Next.js application to Vercel Blob for storing wishes.

## Prerequisites

1.  A Vercel account.
2.  Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step-by-Step Instructions

### 1. deploy Your Project to Vercel
If you haven't already deployed your project:
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your Git repository.
4.  Click **"Deploy"**.

### 2. Create a Blob Store
1.  Navigate to the **Storage** tab in your Vercel Project Dashboard.
2.  Click **"Connect Store"**.
3.  Select **"Blob"** -> **"Continue"**.
4.  Give your store a name (e.g., `radhe-wishes`) and click **"Create Blob Store"**.
5.  Ensure the store is connected to your `radhe` project environment (Production and Preview).

### 3. Get Environment Variables
Once created, Vercel automatically checks your environment variables.
1.  Go to your project settings -> **"Environment Variables"**.
2.  You should see `BLOB_READ_WRITE_TOKEN`.
3.  **For Local Development**:
    *   Click the "Copy" icon next to the value of `BLOB_READ_WRITE_TOKEN`.
    *   Open your local `.env.local` file (create it if it doesn't exist) in the root of your project.
    *   Add the line:
        ```bash
        BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
        ```
    *   Save the file.

### 4. Verify Connection
1.  Restart your local development server:
    ```bash
    npm run dev
    ```
2.  Use the App!
    *   Go to your site, click "Sign the Birthday Wall", and submit a wish.
    *   The wish should now be saved to Vercel Blob (you can verify this by looking at the "Browser" tab in your Vercel Blob store dashboard).

## Code Changes
I have already updated your `src/app/api/wishes/route.ts` to support overwriting the `wishes.json` file on Vercel Blob.

```typescript
await put(BLOB_FILE_NAME, JSON.stringify(updatedWishes), {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
    allowOverwrite: true // This ensures your database file updates correctly
});
```
