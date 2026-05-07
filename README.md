# 🛍️ Shopify Access Token Generator

A simple Node.js script that automates the OAuth flow to generate Shopify Admin API access tokens. Useful for replacing the manual Postman + browser URL-crafting flow that Shopify now requires for custom apps.

## 📖 Background

Shopify previously allowed merchants to create custom apps directly in the store admin and copy the access token from the UI. That flow is no longer available — now you must:

1. Create an app on the **Shopify Partner dev dashboard**
2. Install it on the client store
3. Run an OAuth flow to exchange a `code` for an access token

This script automates steps 2–3 by spinning up a tiny local server that catches the OAuth callback and exchanges the code for a token automatically.

## ✨ Features

- 🚀 Automatic OAuth code → token exchange
- 📋 Token printed to terminal AND displayed in browser
- 🔄 Reusable for any store (just change the `?shop=` query param)
- 🏠 Simple homepage form for entering store domain
- 🔐 Auto-detects post-install redirect from Shopify

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- A Shopify Partner account
- A custom app created in your Partner dashboard

## 🚀 Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd shopify-token-generator
npm install
```

### 2. Configure your Shopify app

In the **Shopify Partner dashboard** , edit your app and set:

| Field                       | Value                            |
| --------------------------- | -------------------------------- |
| **App URL**                 | `http://localhost:3000`          |
| **Allowed redirection URL** | `http://localhost:3000/callback` |

### 3. Update credentials in `index.js`

Edit the constants at the top of the file:

```javascript
const CLIENT_ID = "your_app_client_id";
const CLIENT_SECRET = "your_app_client_secret";
const SCOPES = "read_customers,read_orders,read_products"; // adjust as needed
```

> ⚠️ **Never commit real credentials to git.** See [Security](https://claude.ai/chat/fa4f05d0-e7c0-4afb-b956-672551ee9b87#-security) below.

## 🏃 Usage

### Step 1: Start the server

```bash
node index.js
```

You should see:

```
🚀 Server running at http://localhost:3000
```

### Step 2: Install the app on the target store

In your Shopify Partner dashboard:

1. Open your app
2. Click **"Select store"** / **"Install on store"**
3. Pick the client store
4. Shopify generates an `install_custom_app` URL — click it
5. Approve the install on Shopify

After install, Shopify will redirect to `http://localhost:3000/?shop=yourstore.myshopify.com`.

### Step 3: Get the token

The script auto-detects the redirect, runs the OAuth flow, and displays the token in:

- ✅ Your **browser**
- ✅ Your **terminal**

That's it.

### Alternative: manual trigger

You can also start the OAuth flow directly without going through Partner dashboard:

```
http://localhost:3000/install?shop=yourstore.myshopify.com
```

Or visit `http://localhost:3000` and use the form.

## 🔄 Using a different app on a different store

When switching to a new app + store, follow these steps:

| #   | Action                                                            | Where                               |
| --- | ----------------------------------------------------------------- | ----------------------------------- |
| 1   | Set redirect URL to `http://localhost:3000/callback`              | Shopify Partner dashboard (new app) |
| 2   | Set app URL to `http://localhost:3000`                            | Shopify Partner dashboard (new app) |
| 3   | Update `CLIENT_ID`,`CLIENT_SECRET`,`SCOPES`                       | `index.js`                          |
| 4   | Restart server (`Ctrl+C`, then `node index.js`)                   | Terminal                            |
| 5   | Install app on new store via Partner dashboard                    | Browser                             |
| 6   | Visit `http://localhost:3000/install?shop=NEWSTORE.myshopify.com` | Browser                             |

## 🗂️ Project structure

```
shopify-token-generator/
├── index.js          # Main script (Express server + OAuth handlers)
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 🛣️ Routes

| Route       | Method | Description                                                                                                             |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `/`         | GET    | Homepage with store input form. Auto-redirects to `/install`if `?shop=`is present (post-install callback from Shopify). |
| `/install`  | GET    | Builds the Shopify OAuth URL and redirects to Shopify's consent screen. Requires `?shop=`query param.                   |
| `/callback` | GET    | Receives the `code`from Shopify, exchanges it for an access token, and displays the token.                              |

## 🔐 Security

- ⚠️ **Never commit `client_secret` to a public repo.** Add it to a `.env` file and load via `dotenv`, or keep `index.js` out of source control.
- Consider adding a `.gitignore`:
  ```
  node_modules/.envtokens.json
  ```
- The redirect URL `http://localhost:3000/callback` only works on your local machine — it's safe for development but not for production.
- If your `client_secret` ever leaks, rotate it immediately in the Partner dashboard.

## 🧰 Tech stack

- [Express](https://expressjs.com/) — HTTP server
- [Axios](https://axios-http.com/) — HTTP client for the token exchange POST

## 🐛 Troubleshooting

**"Cannot GET /"**
You're hitting the root before the script handles `?shop=`. Make sure you're using the latest version of `index.js` which has a `/` handler.

**"invalid_request" from Shopify**
Your redirect URL in the Partner dashboard doesn't exactly match `REDIRECT_URI` in the script. They must match character-for-character.

**"Application cannot be found"**
Wrong `CLIENT_ID`, or the app isn't installed on the target store yet.

**Browser shows the token but terminal is empty**
The script's `console.log` runs only when `/callback` is hit. If you see the token in the browser, it's also in the terminal — scroll up.

## 🙋 Contributing

PRs welcome. If you add features (token storage, multi-app support, etc.), keep the script self-contained and easy for new users to run.
