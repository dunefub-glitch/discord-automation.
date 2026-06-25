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

const INVITE_CODE = 'trading-made-simple-862067326467178506';
const GUILD_ID = '862067326467178506';
const ALERT_CHANNEL_ID = '1519526602805870655';
const alreadyAlerted = new Set();
let lastSeenTimestamp = Date.now();

function getRandomDelay() {
  const min = 2 * 60 * 60 * 1000;
  const max = 4 * 60 * 60 * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function scanNewMembers() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const members = await guild.members.fetch({ force: true });
    let newCount = 0;

    for (const [id, member] of members) {
      const joinedAt = member.joinedAt?.getTime() || 0;

      if (joinedAt > lastSeenTimestamp && !alreadyAlerted.has(id)) {
        alreadyAlerted.add(id);
        newCount++;
        console.log(`[NEW] ${member.user.username} joined while bot was out.`);

        try {
          const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
          await channel.send(`🔔 **New Member Detected**\nUsername: **${member.user.username}**\nUser ID: **${member.id}**\nJoined at: **${member.joinedAt.toUTCString()}**\nStatus: ⚠️ Joined while bot was offline`);
        } catch (err) {
          console.error(`Alert failed: ${err.message}`);
        }
      }
    }

    lastSeenTimestamp = Date.now();
    console.log(`[SCAN] Done. ${newCount} new member(s) found.`);
  } catch (err) {
    console.error(`Scan error: ${err.message}`);
  }
}

async function rejoin() {
  try {
    console.log(`[REJOIN] Attempting to rejoin...`);
    await client.acceptInvite(INVITE_CODE);
    console.log(`[REJOIN] Successfully rejoined.`);
    await scanNewMembers();
  } catch (err) {
    console.error(`[REJOIN] Failed: ${err.message}`);
    setTimeout(rejoin, 10000);
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}! Monitoring active.`);
  await scanNewMembers();
});

client.on('raw', async (packet) => {
  if (packet.t === 'GUILD_MEMBER_ADD' && packet.d.guild_id === GUILD_ID) {
    const username = packet.d.user.username;
    const userId = packet.d.user.id;

    if (!alreadyAlerted.has(userId)) {
      alreadyAlerted.add(userId);
      console.log(`[LIVE] ${username} joined live.`);

      try {
        const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
        await channel.send(`🔔 **New Member Detected**\nUsername: **${username}**\nUser ID: **${userId}**\nStatus: 🟢 Caught live`);
      } catch (err) {
        console.error(`Alert failed: ${err.message}`);
      }
    }
  }

  if (packet.t === 'GUILD_DELETE' && packet.d.id === GUILD_ID) {
    lastSeenTimestamp = Date.now();
    const delay = getRandomDelay();
    const hours = (delay / 3600000).toFixed(1);
    console.log(`[KICKED] Removed from server. Rejoining in ${hours} hours...`);
    setTimeout(rejoin, delay);
  }
});

client.login(process.env.DISCORD_TOKEN);
