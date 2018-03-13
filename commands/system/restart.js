const Base = require("../../base/Command");
const { writeFile } = require("fs");

module.exports = class Restart extends Base {
    constructor(client) {
        super(client, {
            name: "restart",
            description: "Restarts the bot.",
            usage: "",
            aliases: ["reboot"],
            category: "system",
            permLevel: 10
        });
    }

    async run(message) {
        // Send a message notifying the user of a restart
        const msg = await message.channel.send(`<a:typing:398270961163436044> | Restarting...`);
        // Write information to restart.json
        writeFile("restart.json", `{ "id": "${msg.id}", "channel": "${message.channel.id}", "time": "${Date.now()}" }`, () => {
            // When write is complete, end process
            process.exit(1);
        });
    }
};
