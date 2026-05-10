import { Client } from "@upstash/qstash";

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { to, subject, html, scheduledAt } = req.body;

  try {
        // Schedule the task via QStash
      // It will call your /api/send-email endpoint at the specified time
      await qstashClient.publishJSON({
              url: `https://${process.env.VERCEL_URL}/api/send-email`,
              body: { to, subject, html },
              notBefore: Math.floor(new Date(scheduledAt).getTime() / 1000),
      });

      res.status(200).json({ success: true });
  } catch (error) {
        console.error('Scheduling Error:', error);
        res.status(500).json({ success: false, error: error.message });
  }
}
