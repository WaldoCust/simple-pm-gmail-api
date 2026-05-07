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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { to, subject, html } = req.body;

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

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage
      }
    });

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
