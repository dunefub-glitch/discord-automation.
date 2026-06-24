const { Client } = require('discord.js-selfbot-v13');

const TARGET_SERVER_ID = '1206863130756522025';

const client = new Client({
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
  console.log(`Logged in as ${client.user.tag}! Broad tracking active.`);
});

client.on('messageCreate', async (message) => {
  // Check if the message is from any channel inside your specific server
  if (message.guild && message.guild.id === TARGET_SERVER_ID) {
    
    // Check for standard system join messages OR if the content/system properties match a join
    const isSystemJoin = message.type === 'USER_JOIN' || message.type === 7;
    
    if (isSystemJoin) {
      const joinedUser = message.author;
      console.log(`System Join detected: ${joinedUser.tag} (ID: ${joinedUser.id})`);

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
