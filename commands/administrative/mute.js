const Base = require("../../base/ModerationCommand.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "mute",
            description: "Mutes the mentioned user.",
            category: "administrative",
            usage: "<user> <reason>",
            category: "administrative",
            permLevel: 4
        }, {
            actionName: "mute",
            color: 0x2C2F33
        });
    }

    async run(message) {
        try {
            await super.setData(message);
            const valid = super.check();
            if (!valid) return;

            await super.notify();
            await this.target.roles.add(message.guild.roles.find("name", "Muted"));

            super.send();
        } catch (e) {
            console.log(e);
            super.error("An unknown error occured whilst attempting to perform this action.");
        }
    }
};
