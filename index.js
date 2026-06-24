const { Client } = require('discord.js-selfbot-v13');

const client = new Client({
  // Force the client to sync and cache user/guild data actively
  ws: { 
    properties: { 
      $os: 'Windows', 
      $browser: 'Chrome', 
      $device: '' 
    } 
  },
  captchaSolver: async function (captcha, UA) {
    console.log("CAPTCHA detected! Sending to CaptchaSonic...");
    try {
      const { CaptchaSonic } = await import('captchasonic');
      const solver = new CaptchaSonic({ apiKey: process.env.CAPTCHA_KEY });

      const result = await solver.solve({
        type: 'hcaptcha',
        sitekey: captcha.captcha_sitekey,
        pageurl: "https://discord.com",
        rqdata: captcha.captcha_rqdata,
        useragent: UA
      });

      console.log("CAPTCHA solved successfully.");
      return result.solution?.token || result.solution || result.token;
    } catch (err) {
      console.error("CaptchaSonic failed:", err);
    }
  },
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Gateway synchronization active.`);
});

// Listening to the raw gateway packet for guild member additions
client.on('raw', async (packet) => {
  if (packet.t === 'GUILD_MEMBER_ADD') {
    const data = packet.d;
    const userId = data.user.id;
    const username = data.user.username;
    
    console.log(`[Gateway] New member join detected: ${username} (ID: ${userId})`);

    // 10-second human delay before acting
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
