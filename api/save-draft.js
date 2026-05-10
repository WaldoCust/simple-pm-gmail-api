import { google } from 'googleapis';

export default async function handler(req, res) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
              return res.status(200).end();
  }

  if (req.method !== 'POST') {
              return res.status(405).send('Method Not Allowed');
  }

  try {
              const { to, subject, html } = req.body || {};

            if (!to || !subject || !html) {
                          console.error('Missing fields:', { to: !!to, subject: !!subject, html: !!html });
                          return res.status(400).json({ error: 'Missing required fields: to, subject, or html' });
            }

            const auth = new google.auth.OAuth2(
                          process.env.GOOGLE_CLIENT_ID,
                          process.env.GOOGLE_CLIENT_SECRET,
                          process.env.GOOGLE_REDIRECT_URI
                        );

            auth.setCredentials({
                          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            });

            // Force token refresh to ensure we have a valid access token
            const { token } = await auth.getAccessToken();
              if (!token) {
                            throw new Error('Failed to retrieve access token');
              }

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

            const response = await gmail.users.drafts.create({
                          userId: 'me',
                          requestBody: {
                                          message: {
                                                            raw: encodedMessage,
                                          },
                          },
            });

            console.log('Draft created successfully');
              return res.status(200).json(response.data);
  } catch (error) {
              console.error('Draft Error Details:', error);
              return res.status(500).json({ 
                                                error: error.message,
                            details: error.response ? error.response.data : undefined
              });
  }
}
