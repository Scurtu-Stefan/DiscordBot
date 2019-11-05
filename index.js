// Initialize client
const Discord = require('discord.js');
const config = require('./data/config.json');
const triggers = require('./data/triggers.json');
const automute = require('./modules/automute.js');

const client = new Discord.Client();
const warnings = [];

function findWarnings(name) {
  let count = 0;
  let index = -1;
  for (let i = 0; i < warnings.length; i++) {
    const entry_name = warnings[i][0];
    const entry_count = warnings[i][1];
    if (name == entry_name) {
      count = entry_count;
      index = i;
      return;
    }
  }
  return [count, index];
}

// const clear_warnings = () => { for (let warning in warnings) warnings[warning] = 0; }
// setInterval(clear_warnings, 10000);

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
  
  // Making a string with message text but lower case
  const msg = message.content.toLowerCase();
  
  // Basic message checking and replies
  if (triggers.hello.includes(msg)) {
    const index = Math.floor(Math.random() * triggers.hello.length + 1);
    message.channel.sendMessage(triggers.hello[index]);
  }

  if (triggers.gm.includes(msg)) {
    message.channel.sendMessage(`Good morning ${message.author}! have a nice day!`);
  }

  if (triggers.gn.includes(msg)) {
    message.channel.sendMessage(`Good night ${message.author}! have sweet dreams!`);
  }

  for (let abuse of triggers.abuses) {
    if (msg.includes(abuse)) {

      // Counting warnings
      const name = message.member.username;
      const [count, index] = findWarnings(name);

      // If it's first warning
      if (index == -1) warnings.push([name, 0]);
      else warnings[index][1] = count + 1;

      message.channel.send(`${message.author}, you have ${count} warnings!`);
      // message.channel.sendMessage(`WARNING: Stop Cursing, Talk Nice ${message.author}, You must have a wish to get mute.`);
    }
  }

  if (triggers.hru.includes(msg) || triggers.hru.map(h => h.concat('?')).includes(msg)) {
    message.channel.sendMessage("I'm doing good." + message.author + ', what about you?');
  }

  if (triggers.sup.includes(msg) || triggers.sup.map(h => h.concat('?')).includes(msg)) {
    message.channel.sendMessage("Nothing much, " + message.author + ', what about you?');
  }

  if (triggers.bye.includes(msg)) {
    message.channel.sendMessage("Have a nice day " + message.author + ', Be safe!');
  }

  if (triggers.afk.includes(msg)) {
    message.channel.sendMessage("Take your time " + message.author + ', see you soon!');
  }

  if (triggers.back.includes(msg)) {
    message.channel.sendMessage("Welcome back " + message.author + ' :heart:');
  }

  if (triggers.ty.includes(msg)) {
    message.channel.sendMessage("You're welcome " + message.author + ' :rose:');
  }

  if (triggers.sorry.includes(msg)) {
    message.channel.sendMessage("It's alright " + message.author + '. No problem buddy :sunglasses: !');
  }

  if (msg == 'pk') {
    message.channel.sendMessage("go go go " + message.author + ', you are OP!');
  }

  if (msg.includes('best fac') || msg.includes('best faction')) {
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
    if (!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if (!member)
      return message.reply("Please mention a valid member of this server");
    if (!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";
    
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}https://gfycat.com/playfulfittingcaribou`);

  }
  
  // !ban
  if(command === "ban") {
    if (!message.member.roles.some(r=>["Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first();
    if (!member)
      return message.reply("Please mention a valid member of this server");
    if (!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  // !purge
  if (command === "purge") {
    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

// Starting the client
client.login(process.env.TOKEN);
