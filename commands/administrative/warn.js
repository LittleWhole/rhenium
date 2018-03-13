const Base = require("../../base/ModerationCommand.js");

module.exports = class Ban extends Base {
    constructor(client) {
        super(client, {
            name: "warn",
            description: "Warns the mentioned user.",
            usage: "<user> <reason>",
            category: "administrative",
            permLevel: 4
        }, {
            actionName: "warn",
            color: 0xFFFF00
        });
    }

    async run(message) {
        try {
            await super.setData(message);
            const valid = super.check();
            if (!valid) return;

            await super.notify();

            super.send();
        } catch (e) {
            super.error("An unknown error occured whilst attempting to perform this action.");
        }
    }
};
