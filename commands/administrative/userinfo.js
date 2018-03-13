const Base = require("../../base/Command.js");

module.exports = class Userinfo extends Base {
    constructor(client) {
        super(client, {
            name: "userinfo",
            description: "Finds information on a user.",
            usage: "<user>",
            category: "administrative",
            permLevel: 4,
            aliases: ["whois"]
        });
    }

    async run(message, args) {
        // Fetch the target user
        const user = await super.verifyUser(args[0]);
        // If user is invalid, throw an error
        if (!user) return super.error("Invalid user.");
        // Fetch the guild member
        const member = await message.guild.members.fetch(user.id);
        // Fetch the user's permission level
        const permLevel = await this.client.permLevel(user.id);
        // Confirm that a user has been found
        if (!user) return super.error("Unknown user.");

        // Fetch verification data
        const data = await this.client.query("SELECT player_name, player_uuid FROM linked_accounts WHERE discord_id = ?;", [user.id]);

        // Create a new embed
        const embed = message.channel.buildEmbed(this.client.config.embedTemplate)
            .setAuthor(user.tag, user.avatarURL());

        // Add fields
        embed.addField("» Name", user.username, true);
        embed.addField("» Discord ID", user.id, true);
        if (member.displayName !== user.username) embed.addField("» Nickname", member.displayName, true);
        embed.addField("» Roles", member.roles.filter(r => r.id !== member.guild.id).sort((a, b) => a.comparePositionTo(b)).map(r => r.name).join(", "), true);
        embed.addField("» Permission Level", `**${permLevel.level}** (\`${permLevel.name}\`)`, true);
        embed.addField("» Joined Discord", this.humanize(user.createdAt), true);
        embed.addField("» Joined Server", this.humanize(member.joinedAt), true);
        if (data.length > 0) embed.addField("» Minecraft Username", data[0].player_name, true);
        if (data.length > 0) embed.addField("» Minecraft UUID", data[0].player_uuid, true);

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
