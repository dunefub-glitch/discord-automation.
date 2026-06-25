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
    console.log("CAPTCHA detected! Sending to CaptchaSonic...");
    
    const apiKey = String(process.env.CAPTCHA_KEY || "").trim();
    if (!apiKey) {
      console.error("CRITICAL ERROR: CAPTCHA_KEY variable is empty or missing in Railway!");
      return;
    }

    try {
      const { CaptchaSonic } = await import('captchasonic');
      const solver = new CaptchaSonic(apiKey);

      const result = await solver.solvePopularCaptchaToken({
        websiteURL: "https://discord.com",
        websiteKey: captcha.captcha_sitekey,
        metadata: { rqdata: captcha.captcha_rqdata }
      });

      console.log("CAPTCHA solved successfully.");
      return result.solution.token;
    } catch (err) {
      console.error("CaptchaSonic failed:", err.message || err);
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

    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      await client.relationships.addFriend(userId);
      console.log(`Success: Friend request sent to ${username}`);
    } catch (err) {
      console.error(`Failed to send request: ${err.message}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
