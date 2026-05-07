import { google } from "googleapis";

export default async function handler(req, res) {

  try {

    const code = req.query.code;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    console.log("TOKENS:", JSON.stringify(tokens, null, 2));

    return res.send(`
      <h1>OAuth Success</h1>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
    `);

  } catch (err) {

    console.error(err);

    return res.status(500).send("OAuth failed");

  }

}
