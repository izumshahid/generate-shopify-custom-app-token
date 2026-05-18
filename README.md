# Shopify Access Token Generator

A small Node.js script that runs the Shopify OAuth flow locally and prints an Admin API access token.

## Prerequisites

- Node.js v14+
- A Shopify Partner account

## Install

```bash
npm install
```

## Steps — creating the app (Shopify Partner dashboard)

1. Create a new app in the Partner dashboard.
2. Set **App URL** → `http://localhost:3000`
3. Set **Allowed redirection URL** → `http://localhost:3000/callback`
4. Copy the app's **Client ID** and **Client Secret**.

## Steps — in `index.js`

1. Update the three constants at the top:
   - `CLIENT_ID` → app's client ID
   - `CLIENT_SECRET` → app's client secret
   - `SCOPES` → comma-separated scopes the app needs
2. Start the server:
   ```bash
   node index.js
   ```
3. In the Partner dashboard, install the app on the target store. Shopify will redirect to `http://localhost:3000/?shop=...` and the script auto-runs the OAuth flow.
4. The access token prints in the terminal and is shown in the browser.

If the auto-redirect doesn't fire, visit:
```
http://localhost:3000/install?shop=YOURSTORE.myshopify.com
```

## Switching to a different app/store

Repeat the steps above: update redirect URLs in the Partner dashboard, update the three constants in `index.js`, restart the server, install on the new store.

> Never commit real `CLIENT_SECRET` values to git.
