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
    if (!guild) {
      console.log(`[SCAN] Not in server yet.`);
      return;
    }

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

    try {
      const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
      await channel.send(`📊 **Scan Complete**\nTotal members scanned: **${members.size}**\nNew members found: **${newCount}**\nTimestamp: **${new Date().toUTCString()}**`);
    } catch (err) {
      console.error(`Scan report failed: ${err.message}`);
    }

    console.log(`[SCAN] Done. ${newCount} new member(s) found out of ${members.size} total.`);
  } catch (err) {
    console.error(`Scan error: ${err.message}`);
  }
}

async function joinAndScan() {
  try {
    console.log(`[JOIN] Joining server...`);
    await client.acceptInvite(INVITE_CODE);
    console.log(`[JOIN] Successfully joined.`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await scanNewMembers();
  } catch (err) {
    console.error(`[JOIN] Failed: ${err.message}`);
    setTimeout(joinAndScan, 10000);
  }
}

async function rejoin() {
  try {
    console.log(`[REJOIN] Attempting to rejoin...`);
    await client.acceptInvite(INVITE_CODE);
    console.log(`[REJOIN] Successfully rejoined.`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await scanNewMembers();
  } catch (err) {
    console.error(`[REJOIN] Failed: ${err.message}`);
    setTimeout(rejoin, 10000);
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}! Monitoring active.`);
  await joinAndScan();

  setInterval(() => {
    console.log(`[HEARTBEAT] Bot is alive. Total alerted: ${alreadyAlerted.size} members. Last seen: ${new Date(lastSeenTimestamp).toUTCString()}`);
  }, 30 * 60 * 1000);
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
