const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (member) => {
  console.log(`Debug: New member detected in guild ${member.guild.name} (ID: ${member.guild.id})`);
  
  // Replace the ID below with your actual server ID (keep the quotes)
  const targetServerId = '1206863130756522025';

  if (member.guild.id === targetServerId) {
    console.log(`Match found! Attempting to add ${member.user.tag} (ID: ${member.id})`);
    
    client.relationships.addFriend(member.id)
      .then(() => {
        console.log(`Success: Friend request sent to ${member.user.tag}`);
      })
      .catch((err) => {
        console.error(`Failed to send request: ${err.message}`);
      });
  } else {
    console.log(`No match: Guild ID ${member.guild.id} did not match target.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
