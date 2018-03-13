const Command = require("../../base/Command");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const path = require("path");

module.exports = class Pull extends Command {
    constructor(client) {
        super(client, {
            name: "pull",
            description: "Update code from GitHub repository.",
            usage: "",
            category: "system",
            permLevel: 10
        });
    }

    async run(message) {
        try {
            // Execute pull on repository URL
            const { stdout, stderror, error } = await exec(`git pull ${require("../../package.json").repository.url.split("+")[1]}`, { cwd: path.join(__dirname, "../../") });
            // If error thrown, return error message
            if (error) return super.error("An unknown error occured whilst attempting to pull.");

            // Create an empty array to store output.
            const out = [];
            // If output returned, push to output
            if (stdout) out.push(stdout);
            // If error returned, push to output
            if (stderror) out.push(stderror);

            await message.channel.send(out.join("---\n"), { code: true });
            const notice = await message.channel.send("To update changes, you'll need to restart the bot. Respond with **y** to restart or **n** to cancel restart.");
            
            message.channel.awaitMessages(m => m.author.id === message.author.id && ["y", "n"].includes(m.content), { max: 1, time: 60000, errors: ["time"] })
            .then(collected => {
                const m = collected.first();
                if (m.content === "y") return this.client.commands.get("restart").run(message);
                notice.edit("To update changes, you'll need to restart the bot.");
                super.respond("Restart canceled.");
            }).catch(() => {
                notice.edit("To update changes, you'll need to restart the bot.");
            });
        } catch (e) {
            super.error("An unknown error occured.");

            console.log(e);
        }
    }
};
