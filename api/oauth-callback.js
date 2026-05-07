import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    console.log("TOKENS:", tokens);

    oauth2Client.setCredentials(tokens);

    // IMPORTANT:
    // Save refresh token somewhere persistent
    // For now temporarily store in env/database/etc

    if (!tokens.refresh_token) {
      console.error("NO REFRESH TOKEN RETURNED");

      return res
        .status(500)
        .send("No refresh token returned from Google");
    }

    console.log("REFRESH TOKEN:", tokens.refresh_token);

    // TEMP DEBUG:
    // You can manually copy this from logs into Vercel env var:
    // GOOGLE_REFRESH_TOKEN

    return res.redirect(
      "https://thesimplebrands.com/email-builder?gmail=connected"
    );
  } catch (err) {
    console.error("OAUTH CALLBACK ERROR:", err);

    return res.status(500).send("OAuth failed");
  }
}
