'use server'

export async function sendDiscordMessage(message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Webhook URL is not configured");
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message to Discord");
  }

  return { success: true };
}