const { Client } = require('discord.js-selfbot-v13');

const TARGET_SERVER_ID = '1206863130756522025';

const client = new Client({
  captchaSolver: async function (captcha, UA) {
    console.log("CAPTCHA detected! Sending to CaptchaSonic...");
    try {
      // CaptchaSonic uses ES Modules, requiring a dynamic import
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
      // CaptchaSonic API structure fallback to ensure the token is passed correctly
      return result.solution?.token || result.solution || result.token;
    } catch (err) {
      console.error("CaptchaSonic failed:", err);
    }
  },
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Solver is active.`);
});

client.on('messageCreate', async (message) => {
  if (message.guild && message.guild.id === TARGET_SERVER_ID) {
    if (message.type === 'USER_JOIN' || message.type === 7) {
      const joinedUser = message.author;
      console.log(`Join detected: ${joinedUser.tag}`);

      await new Promise(resolve => setTimeout(resolve, 10000));

      try {
        await client.relationships.addFriend(joinedUser.id);
        console.log(`Success: Friend request sent to ${joinedUser.tag}`);
      } catch (err) {
        console.error(`Failed to send request: ${err.message}`);
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
