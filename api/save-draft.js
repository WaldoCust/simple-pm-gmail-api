import { google } from 'googleapis';

export default async function handler(req, res) {
      if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { to, subject, html } = req.body;

  const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth });

  // Handle UTF-8 subjects correctly
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
              `To: ${to}`,
              'Content-Type: text/html; charset=utf-8',
              'MIME-Version: 1.0',
              `Subject: ${utf8Subject}`,
              '',
              html,
            ];
      const message = messageParts.join('\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

  try {
          const response = await gmail.users.drafts.create({
                    userId: 'me',
                    requestBody: {
                                message: {
                                              raw: encodedMessage,
                                },
                    },
          });
          res.status(200).json(response.data);
  } catch (error) {
          res.status(500).json({ error: error.message });
  }
}
