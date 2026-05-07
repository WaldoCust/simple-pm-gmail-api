import { google } from "googleapis";

export default async function handler(req, res) {
  const code = req.query.code;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log(tokens);

    res.send(`
      <h1>Gmail Connected Successfully</h1>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
}
