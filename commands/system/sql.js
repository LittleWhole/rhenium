const Base = require("../../base/Command");

module.exports = class Sql extends Base {
    constructor(client) {
        super(client, {
            name: "sql",
            description: "Evaluates sql code",
            usage: "<sql code>",
            category: "system",
            permLevel: 6,
            aliases: ["mysql"]
        });
    }

    async run(message, args) {
        // Query the specified sql code
        this.client.query(args.join(" ")).then(results => {
            // Send the list of results
            message.channel.send(`== ${args.join(" ")}\n\n${results.map(r => {
                // Calculate spacing
                const spacing = Object.keys(r).reduce((out, key) => Math.max(out, key.length), 0);
                // Map all entries
                return Object.entries(r).map(data => `${data[0] + " ".repeat(spacing - data[0].length)} :: ${data[1]}`).join("\n");
            }).join("\n\n")}`, { code: "asciidoc" });
        }).catch(err => {
            // Throw an error
            message.channel.send(err, { code: "x1" });
        });
    }
};
