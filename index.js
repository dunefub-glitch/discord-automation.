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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! Gateway synchronization active.`);
});

client.on('raw', async (packet) => {
  if (packet.t === 'GUILD_MEMBER_ADD') {
    const data = packet.d;
    const userId = data.user.id;
    const username = data.user.username;
    const isPending = data.pending === true;

    if (isPending) {
      console.log(`[Gateway] Pending member detected: ${username} (ID: ${userId})`);

      try {
        const channel = await client.channels.fetch('1519526602805870655');
        await channel.send(`🔔 **New Pending Member**\nUsername: **${username}**\nUser ID: **${userId}**\nStatus: ⏳ Awaiting approval`);
        console.log(`Alert sent for ${username}`);
      } catch (err) {
        console.error(`Failed to send alert: ${err.message}`);
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
