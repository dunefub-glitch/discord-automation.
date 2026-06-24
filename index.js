const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (member) => {
  // Replace YOUR_SERVER_ID with your actual server ID
  if (member.guild.id === 'YOUR_SERVER_ID') {
    console.log(`${member.user.tag} joined! Sending request...`);
    
    // This is the command that sends the request
    client.relationships.addFriend(member.id);
  }
});

// We will add the login token later
client.login(process.env.DISCORD_TOKEN);
