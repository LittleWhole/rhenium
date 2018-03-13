const Base = require("../../base/Command.js");

module.exports = class Credits extends Base {
    constructor(client) {
        super(client, {
            name: "credits",
            description: "Lists the bot's credits.",
            usage: "",
            category: "information",
            permLevel: 0
        });
    }

    run(message) {
        // Create a new embed
        message.channel.buildEmbed(this.client.config.embedTemplate)
            .setThumbnail(this.client.user.avatarURL({ size: 128 }))
            .setAuthor("Credits")
            .setDescription("This is a full list of users who helped with the development of VerifyBot, directly or indirectly.")
            .addField("» RedstoneDaedalus#2020 (268071134057070592)", "Base code & basis of bot")
            .addField("» LittleWhole#2107 (230880116035551233)", "Bot developer")
            .send();
    }
};
