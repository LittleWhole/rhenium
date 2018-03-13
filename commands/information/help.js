const Base = require("../../base/Command.js");

module.exports = class Help extends Base {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Get a full list of commands.",
            usage: "",
            category: "information",
            permLevel: 0
        });
    }

    async run(message, args, perms) {
        // Fetch commands the user has access to
        const commands = this.client.commands.filter(command => command.conf.level <= perms.level);
        // Fetch command categories
        const categories = ["information", "administrative", "support", "system", "fun"];
        // Fetch highest command length
        const spacing = commands.map(c => c.help.name).reduce((out, command) => Math.max(command.length, out), 1);
        
        // Category icons
        const icons = new Map()
            .set("information", "ℹ")
            .set("administrative", "⚙")
            .set("support", "❓")
            .set("system", "💻")
            .set("fun", "🎉");
        
        const menu = await message.channel.send(`**VerifyBot Help** for ${icons.get(categories[0])} __${categories[0]}__ commands\nUse the **reaction buttons** to navigate.\n\n${commands.filter(c => c.help.category === categories[0]).length == 0 ? "No commands available to you in this category." : commands.filter(c => c.help.category === categories[0]).map(c => `\`!${c.help.name} ${c.help.usage}\` ${c.help.description}`).join("\n")}`);
        menu.delete({ timeout: 60000 });

        for (let data of icons) await menu.react(data[1]);
    }
};
