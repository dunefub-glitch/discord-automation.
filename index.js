const { Client } = require('discord.js-selfbot-v13');

const client = new Client({
  ws: { 
    properties: { 
      $os: 'Windows', 
      $browser: 'Chrome', 
      $device: '' 
    } 
  },
  captchaSolver: async function (captcha, UA) {
    console.log("CAPTCHA detected! Sending to NoneCap...");
    
    const apiKey = String(process.env.CAPTCHA_KEY || "").trim();
    if (!apiKey) {
      console.error("CRITICAL ERROR: CAPTCHA_KEY variable is empty or missing in Railway!");
      return;
    }

    try {
      const response = await fetch("https://api.nonecap.com/v1/solves?wait=90", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "hcaptcha",
          sitekey: captcha.captcha_sitekey,
          url: "https://discord.com",
          rqdata: captcha.captcha_rqdata
        })
      });

      const data = await response.json();
      console.log("NoneCap response:", JSON.stringify(data));
      return data.token;
    } catch (err) {
      console.error("NoneCap failed:", err.message || err);
    }
  },
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Gateway synchronization active.`);
});

client.on('raw', async (packet) => {
  if (packet.t === 'GUILD_MEMBER_ADD') {
    const data = packet.d;
    const userId = data.user.id;
    const username = data.user.username;

    console.log(`[Gateway] New member join detected: ${username} (ID: ${userId})`);

    const delay = Math.floor(Math.random() * (50000 - 40000 + 1)) + 40000;
    console.log(`Waiting ${Math.round(delay / 1000)}s before sending request to ${username}...`);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await client.relationships.addFriend(userId);
      console.log(`Success: Friend request sent to ${username}`);
    } catch (err) {
      console.error(`Failed to send request: ${err.message}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
