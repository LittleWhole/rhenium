const ms = require("pretty-ms");
const Base = require("../../base/Command");
const fetchSupportData = require("../../methods/restricted/fetchSupportDataFromName");
const { escapeMarkdown } = require("discord.js");

module.exports = class Stats extends Base {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Shows your support statistics.",
            usage: "[username]",
            category: "support",
            permLevel: 2
        });
    }

    async run(message, args) {
        // Fetch support data
        const data = await fetchSupportData(this.client, args[0] || message.member.displayName);
        // If no data returned, throw an error
        if (!data || !data.sessions[0]) return super.error(`No sessions found for user ${escapeMarkdown(args[0] || message.member.displayName)}.`);

        // Attempt to find the target
        const target = message.guild.members.find("displayName", data.sessions[0].staff);

        message.channel.buildEmbed(this.client.config.embedTemplate)
            .setAuthor(data.sessions[0].staff, target ? target.user.avatarURL({ size: 64 }) : null)
            .setTitle("Support Statistics")
            .addField("» Total Sessions", data.sessions.length)
            .addField("» Sessions this Month", data.month.length)
            .addField("» Individual Players Helped", Array.from(new Set(data.sessions.map(s => s.name))).length)
            .addField("» Total Session Time", ms(data.sessions.reduce((t, s) => t += s.duration, 0), { verbose: true, secDecimalDigits: 0 })) //eslint-disable-line
            .send();
    }
};
