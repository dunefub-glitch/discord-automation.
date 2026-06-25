const { Client } = require('discord.js-selfbot-v13');

const client = new Client({
  ws: { 
    properties: { 
      $os: 'Windows', 
      $browser: 'Chrome', 
      $device: '' 
    } 
  }
});

const alreadyAlerted = new Set();
const MONITOR_SERVER_ID = '1419526508044881955';
const ALERT_CHANNEL_ID = '1519526602805870655';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Monitoring for pending members...`);

  setInterval(async () => {
    try {
      const guild = client.guilds.cache.get(MONITOR_SERVER_ID);
      if (!guild) return;

      const members = await guild.members.fetch();

      members.forEach(async (member) => {
        if (member.pending === true && !alreadyAlerted.has(member.id)) {
          alreadyAlerted.add(member.id);
          console.log(`[PENDING] ${member.user.username} is in application phase!`);

          try {
            const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
            await channel.send(`🔔 **New Pending Applicant**\nUsername: **${member.user.username}**\nUser ID: **${member.id}**\nStatus: ⏳ Awaiting approval`);
          } catch (err) {
            console.error(`Failed to send alert: ${err.message}`);
          }
        }
      });
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  }, 2000);
});

client.login(process.env.DISCORD_TOKEN);
