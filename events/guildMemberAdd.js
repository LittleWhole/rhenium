const { Blacklist } = require("discordblacklist");
const config = require("../config.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        // Create a blacklist
        const blacklist = new Blacklist({ token: this.client.config.credentials.dbans, update: true });
        // Update the blacklist
        await blacklist.update();
        // Fetch blacklist data
        const blacklisted = blacklist.lookup(member.id);

        // Find the joins channel
        const channel = member.guild.channels.find("name", config.channels.joins);
        // If no channel found, return
        if (!channel) {
            if (blacklisted) member.ban({ reason: `${blacklisted.bannedFor} (${blacklisted.proofLink})` });
            return;
        };

        if (blacklisted) {
            channel.buildEmbed(this.client.config.embedTemplate)
            .setColor(0xff6400)
            .setThumnail(member.user.avatarURL({ size: 256, format: "png" }))
            .setDescription("<:joined:401925850846724106> | Publically banned member joined.")
            .addField("» Banned For", blacklisted.bannedFor, false)
            .addField("» Proof", blacklist.proofLink, false)
            .setTimestamp()
            .send();
        }
        
        // Create a new embed
        const embed = channel.buildEmbed(this.client.config.embedTemplate)
            .setColor([67, 181, 129])
            .setThumbnail(member.user.avatarURL({ size: 256, format: "png" }))
            .setDescription("<:joined:401925850846724106> | New member joined.")
            .setTimestamp();

        // Fetch verification data
        const data = await this.client.query("SELECT player_name, player_uuid FROM linked_accounts WHERE discord_id = ?;", [member.id]);

        embed.addField("» Discord Tag", member.user.tag, true);
        embed.addField("» Joined Discord", this.humanize(member.user.createdAt), true);
        embed.addField("» Previously Verified?", data[0] ? `Yes. (as ${data[0].player_name})` : "No.", true);
        embed.addField("» Current Member Count", member.guild.memberCount, true);
        embed.addField("» User ID", member.id, true);
        if (data[0]) embed.addField("» Minecraft UUID", data[0].player_uuid, true);

        // Send the embed
        embed.send();

        // If user was verified, update their nickname immediately and give them a role.
        if (data[0]) {
            member.setNickname(`${data[0].player_name} (Pending)`).catch(() => null);
            member.send("Welcome back! You will be automatically reverified in 3 minutes.").catch(() => null);

            setTimeout(() => {
                if (!member.roles.exists("name", "Verified")) member.roles.add(member.guild.roles.find("name", "Verified")).then(() => member.send("You have been verified! You can now chat as much as you want")).catch(() => null);
                member.setNickname(data[0].player_name);
            }, 180000);
        }
    }

    // Used to make dates easy to read
    humanize(date) {
        // Define months
        const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
};
