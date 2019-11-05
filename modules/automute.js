module.exports = async (user, time) => {
    let muterole = user.guild.roles.find("name", "Muted");
    if (!muterole) {
        try {
            muterole = await user.guild.createRole({
                name: "muted",
                color: "#0000000",
                permissions: []
            });
            user.guild.channels.forEach(async (channel, id) => {
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
    user.addRole(muterole.id);
    user.lastMessage.channel.send(`<@${user.id}> has been muted for abusing... :rage:`);

    // Unmuting
    setTimeout(() => {
        user.removeRole(muterole.id);
        user.lastMessage.channel.send(`<@${user.id}> has been unmuted, better talk nice now! :blush:`);
    }, time * 1000);
}