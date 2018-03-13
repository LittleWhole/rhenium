const Command = require("../../base/Command.js");

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "verify",
            description: "Link your Minecraft and Discord accounts.",
            category: "information",
            permLevel: 0
        });
    }

    run() {
        super.respond(`Please go to the website to verify yourself: ${this.client.config.dashboard.domain}`, { showCheck: false });
    }
};
