const Base = require("../../base/ModerationCommand.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "unmute",
            description: "Unmutes the mentioned user.",
            usage: "<user> <reason>",
            category: "administrative",
            permLevel: 4
        }, {
            actionName: "unmute",
            color: 0x00AAFF
        });
    }

    async run(message) {
        try {
            await super.setData(message);
            const valid = super.check();
            if (!valid) return;

            await super.notify();
            await this.target.roles.remove(message.guild.roles.find("name", "Muted"));

            super.send();
        } catch (e) {
            console.log(e);
            super.error("An unknown error occured whilst attempting to perform this action.");
        }
    }
};
