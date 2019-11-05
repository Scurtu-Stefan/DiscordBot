module.exports = async (message, time) => {
    const muted = message.guild.member(message.mentions.users.first());
    if (!muted) return message.channel.send("Can't find the user!");
    if (muted.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them");

    let muterole = message.guild.roles.find("name", "muted");
    if (!muterole) {
        try {
            muterole = await message.guild.createRole({
                name: "muted",
                color: "#0000000",
                permissions: []
            });
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        } catch (e) {
            console.log(e.stack);
        }
    }

    // Muting
    muted.addRole(muterole.id);
    message.channel.send(`<@${muted.id}> has been muted for abusing... :rage:`);

    // Unmuting
    setTimeout(() => {
        muted.removeRole(muterole.id);
        message.channel.send(`<@${muted.id}> has been unmuted, better talk nice now! :blush:`);
    }, time);
}