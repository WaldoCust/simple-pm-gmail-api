import { google } from "googleapis";

export default async function handler(req, res) {

  // CORS HEADERS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // HANDLE PREFLIGHT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ONLY ALLOW POST
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {

    console.log("SEND EMAIL API HIT");

    console.log(
      "HAS REFRESH TOKEN:",
      !!process.env.GOOGLE_REFRESH_TOKEN
    );

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error(
        "GOOGLE_REFRESH_TOKEN missing"
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // FORCE ACCESS TOKEN REFRESH
    const accessToken =
      await oauth2Client.getAccessToken();

    console.log(
      "ACCESS TOKEN:",
      !!accessToken.token
    );

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      throw new Error(
        "Missing email fields"
      );
    }

    const message = [
      "Content-Type: text/html; charset=UTF-8",
      "MIME-Version: 1.0",
      `to: ${to}`,
      `subject: ${subject}`,
      "",
      html
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result =
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage
        }
      });

    console.log("EMAIL SENT");

    return res.status(200).json({
      success: true,
      result
    });

  } catch (err) {

    console.error(
      "SEND EMAIL ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
