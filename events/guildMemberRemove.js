const config = require("../config.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        // Find the joins channel
        const channel = member.guild.channels.find("name", config.channels.joins);
        // If no channel found, return
        if (!channel) return;
        
        // Create a new embed
        const embed = channel.buildEmbed()
            .setColor([181, 67, 67])
            .setThumbnail(member.user.avatarURL({ size: 256, format: "png" }))
            .setDescription("<:left:401925867531665409> | Member left.")
            .setTimestamp();

        embed.addField("» Discord Tag", member.user.tag, true);
        embed.addField("» Joined Server", this.humanize(member.joinedAt), true);
        embed.addField("» Joined Discord", this.humanize(member.user.createdAt));
        embed.addField("» Current Member Count", member.guild.memberCount, true);
        embed.addField("» User ID", member.id, true);

        // Send the embed
        embed.send();
    }

    // Used to make dates easy to read
    humanize(date) {
        // Define months
        const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
};
