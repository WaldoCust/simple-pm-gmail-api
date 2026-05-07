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

    oauth2Client.setCredentials(tokens);

    console.log(tokens);

    // OPTIONAL:
    // Save refresh token somewhere later

    return res.redirect(
      "https://thesimplebrands.com/email-builder?gmail=connected"
    );

  } catch (err) {

    console.error(err);

    return res.status(500).send("OAuth failed");

  }

}
