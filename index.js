// Initialize client
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')

// Setting Activity
client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

// Message event handling
client.on("message", async message => {

  // If message is by bot, then dont send any message
  if (message.author.bot) return;
  
  // Basic message checking and replies
  const hello = ['hello', 'hi', 'hii', 'hiii', 'hola', 'ola', 'hai', 'heya', 'hey', 'howdy'];
  const gm = ['good morning', 'gm', 'morning', 'goodmorning'];
  const gn = ['good night', 'gn', 'night', 'goodnight', 'nite', 'goodnite'];
  const abuses = ['fuck', 'dick', 'pussy', 'hoe', 'retard', 'idiot', 'cunt'];
  const hru = ['how are you', 'how r u', 'how are u', 'how r you', 'hru', 'hry'];
  const bye = ['bai', 'bye', 'goodbye', 'good bye'];

  if (hello.includes(message.content)) {
    const index = Math.floor(Math.random() * hello.length + 1);
    message.channel.sendMessage(hello[index]);
  }

  if (gm.includes(message.content)) {
    message.channel.sendMessage(`Good morning ${message.author}! have a nice day!`);
  }

  if (gn.includes(message.content)) {
    message.channel.sendMessage(`Good night ${message.author}! have sweet dreams!`);
  } 

  for (let abuse of abuses) {
    if (message.content.includes(abuse)) {
      message.channel.sendMessage(`WARNING: Stop Cursing, Talk Nice ${message.author}, You must have a wish to get mute.`);
    }
  }

  if (hru.includes(message.content) || hru.map(h => h.concat('?')).includes(message.content)) {
    message.channel.sendMessage("I'm doing good." + message.author + ',what about you?');
  }

  if (bye.includes(message.content)) {
    message.channel.sendMessage("Have a nice day" + message.author + 'Be safe!');
  }
  
  if (message.content.includes('pk')) {
    message.channel.sendMessage("go go go" + message.author + ',you are OP!');
  }

  if (message.content.includes('best fac') || message.content.includes('best faction')) {
    message.channel.sendMessage('Ofcourse, best faction is Outlander');
  }

  // Some exceptions
  if (message.content.indexOf(config.prefix) !== 0) return;

  // Reading whats written in command
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // !ping
  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  // !say
  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }
  
  // !kick
  if(command === "kick") {
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}https://gfycat.com/playfulfittingcaribou`);

  }
  
  // !ban
  if(command === "ban") {
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  // !purge
  if(command === "purge") {
    const deleteCount = parseInt(args[0], 10);
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

// Starting the client
client.login(config.token);
