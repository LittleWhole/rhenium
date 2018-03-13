const { current, patches } = require("../../patches");
const Base = require("../../base/Command.js");

module.exports = class Suggest extends Base {
    constructor(client) {
        super(client, {
            name: "patch",
            description: "Lists new updates.",
            usage: "[patch]",
            category: "information",
            permLevel: 0,
            aliases: ["updates"]
        });
    }

    run(message, args) {
        if (args[0] === "list") {
            return message.channel.send(`__Patch List__\n${Object.keys(patches).join(", ")}`);
        }

        const patch = patches[args[0]] || patches[current];
        message.channel.send(`__Patch **${patch.name}**__\n*Released ${patch.released}*\n\n${patch.additions.map(addition => `**+** ${addition}`).join("\n")}\n${patch.removals.map(removal => `**-** ${removal}`).join("\n")}\n${patch.notes.map(note => `**\\*** ${note}`).join("\n")}`);
    }
};
