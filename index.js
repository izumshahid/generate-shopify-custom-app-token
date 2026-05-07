const express = require("express");
const axios = require("axios");

// ===== APP CREDENTIALS =====
// TODO: Update these 3 values when using a different app
const CLIENT_ID = "0646xxxxxxxxxxxxxxxxxx";
const CLIENT_SECRET = "shpss_xxxxxxxxxxxxxxxxxx"; // ROTATE THIS!
const SCOPES = "read_customers,read_orders,read_products";

const REDIRECT_URI = "http://localhost:3000/callback";
const PORT = 3000;
// ============================

const app = express();

/**
 * Root endpoint — entry point of the script.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ HOW TO USE THIS SCRIPT FOR A DIFFERENT APP + DIFFERENT STORE    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                 │
 * │ TODO 1: In Shopify Partner dashboard, for the NEW app, set:     │
 * │   - App URL:      http://localhost:3000                         │
 * │   - Redirect URL: http://localhost:3000/callback                │
 * │                                                                 │
 * │ TODO 2: Update the constants at the top of this file:           │
 * │   - CLIENT_ID      → new app's client ID                        │
 * │   - CLIENT_SECRET  → new app's client secret                    │
 * │   - SCOPES         → scopes the new app needs                   │
 * │                                                                 │
 * │ TODO 3: Restart the server:                                     │
 * │   Ctrl+C, then: node index.js                                   │
 * │                                                                 │
 * │ TODO 4: Install the app on the NEW store via Partner dashboard  │
 * │   (click the "install_custom_app" URL Shopify generates).       │
 * │   This will land you on http://localhost:3000/?shop=...         │
 * │                                                                 │
 * │ TODO 5: This route auto-detects the shop param and forwards to  │
 * │   /install — no manual URL crafting needed. If the auto-redirect│
 * │   doesn't fire, manually visit:                                 │
 * │     http://localhost:3000/install?shop=NEWSTORE.myshopify.com   │
 * │                                                                 │
 * │ TODO 6: Click "Install app" on Shopify's consent screen.        │
 * │   Token will appear in the browser AND printed in the terminal. │
 * │                                                                 │
 * └─────────────────────────────────────────────────────────────────┘
 */
app.get("/", (req, res) => {
  const shop = req.query.shop;

  // If Shopify just redirected back here after install confirmation,
  // automatically kick off the OAuth flow to get the code → token.
  if (shop) {
    console.log(`\n✓ App installed on ${shop} — starting OAuth flow...`);
    return res.redirect(`/install?shop=${shop}`);
  }

  // Otherwise, show a simple form to manually trigger the flow
  res.send(`
    <body style="font-family:sans-serif;padding:40px;background:#0e1117;color:#fff;max-width:600px;margin:auto">
      <h2>🛍️ Shopify Token Generator</h2>
      <p>Enter the store domain to start OAuth:</p>
      <form action="/install" method="get">
        <input name="shop" placeholder="yourstore.myshopify.com"
          style="padding:10px;width:300px;border-radius:4px;border:1px solid #444;background:#1e2128;color:#fff" />
        <button type="submit"
          style="padding:10px 20px;background:#5a31f4;color:#fff;border:none;border-radius:4px;cursor:pointer">
          Get Token
        </button>
      </form>
      <hr style="margin-top:30px;border-color:#333" />
      <p style="color:#888;font-size:13px">
        Current app: <code>${CLIENT_ID.slice(0, 12)}...</code><br/>
        Scopes: <code>${SCOPES}</code>
      </p>
    </body>
  `);
});

// Step 1: Build Shopify OAuth URL and redirect there
app.get("/install", (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing ?shop=yourstore.myshopify.com");
  }
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}`;
  console.log(`→ Redirecting to Shopify auth: ${authUrl}`);
  res.redirect(authUrl);
});

// Step 2: Shopify redirects here with ?code=... → exchange for access token
app.get("/callback", async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).send("Missing shop or code in callback");
  }

  console.log(`✓ Got code for ${shop}: ${code}`);

  try {
    const tokenRes = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
    );

    const accessToken = tokenRes.data.access_token;

    console.log("\n========================================");
    console.log(`✅ TOKEN FOR ${shop}:`);
    console.log(accessToken);
    console.log("========================================\n");

    res.send(`
      <body style="font-family:sans-serif;padding:40px;background:#0e1117;color:#fff;max-width:700px;margin:auto">
        <h2>✅ Token captured!</h2>
        <p><b>Shop:</b> ${shop}</p>
        <p><b>Access Token:</b></p>
        <code style="background:#1e2128;padding:12px;display:block;border-radius:6px;word-break:break-all">${accessToken}</code>
        <p style="margin-top:20px;color:#888">Token also printed in your terminal. You can close this tab.</p>
      </body>
    `);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res
      .status(500)
      .send(`Error: ${JSON.stringify(err.response?.data || err.message)}`);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`\nFlow:`);
  console.log(`  1. Install app on store via Partner dashboard install link`);
  console.log(`  2. After install → land on http://localhost:3000/?shop=...`);
  console.log(`  3. Script auto-redirects to OAuth → captures token\n`);
});
