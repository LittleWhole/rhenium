const Base = require("../../base/Command.js");
const { Permissions } = require("discord.js");

module.exports = class Perms extends Base {
    constructor(client) {
        super(client, {
            name: "perms",
            description: "Edits a user's permissions. Use `perms list` to get a list of all available permissions.",
            usage: "<list|give|revoke|reset> <user> <permission> <channel(s)>",
            category: "administrative",
            permLevel: 5 
        });
    }

    async run(message, args) {
        // List of permission flags
        const flags = Object.keys(Permissions.FLAGS).map(f => f.toLowerCase());

        // Fetch command parameters
        const mode = (args[0] || "").toLowerCase();
        const user = await super.verifyUser(args[1]);
        const permission = (args[2] || "").toLowerCase();
        const channels = message.mentions.channels;

        // Validate arguments
        if (!["list", "give", "take", "reset"].includes(mode)) return super.error(`Command usage: \`${this.client.config.prefix}${this.help.name} ${this.help.usage}\`.`);
        
        // If mode is list, list all permissions
        if (mode === "list") return message.channel.send(`== All user permissions\n\n${flags.join("\n")}`, { code: "asciidoc" });

        // Check if the flags, channels, and user are valid
        if (!flags.includes(permission)) return super.error("Invalid permission name.");
        if (channels.size === 0) return super.error("Please provide at least 1 channel.");
        if (!user) return super.error("No user found.");

        // If mode is give, give the target user the specified permissions
        if (mode === "give") {
            channels.forEach(channel => {
                channel.overwritePermissions(user, {
                   [permission.toUpperCase()]: true 
                 });
            });

            return super.respond(`Given permissions to ${user.tag}.`);
        }

        // If mode is reset, reset the permissions of the specified user
        if (mode === "reset") {
            channels.forEach(channel => {
                channel.overwritePermissions(user, {
                    [permission.toUpperCase()]: null
                });
            });

            return super.respond(`Reset permissions for ${user.tag}.`);
        }

        // If mode is take, take the permissions from the target user
        if (mode === "take") {
            channels.forEach(channel => {
                channel.overwritePermissions(user, {
                    [permission.toUpperCase()]: false
                });
            });
            
            return super.respond(`Revoked permissions for ${user.tag}.`);
        }
    }
};
