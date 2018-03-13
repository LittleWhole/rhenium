const Base = require("../../base/ModerationCommand.js");

module.exports = class Ban extends Base {
    constructor(client) {
        super(client, {
            name: "softban",
            description: "Kicks the mentioned user and purges their messages.",
            usage: "<user> <reason>",
            category: "administration",
            permLevel: 4
        }, {
            actionName: "softban",
            color: 0xFF5500
        });
    }

    async run(message) {
        try {
            await super.setData(message);
            const valid = super.check();
            if (!valid) return;

            await super.notify();
            await this.target.ban({ days: 7, reason: this.reason ? `[${this.executor.user.tag} (softban)] ${this.reason}` : `Softbanned by ${this.executor.user.tag}` });
            await message.guild.members.unban(this.target.id, { reason: "softban unban" });

            super.send();
        } catch (e) {
            super.error("An unknown error occured whilst attempting to perform this action.");
        }
    }
};
