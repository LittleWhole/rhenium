const Command = require("./Command");

/** 
 * Represents a moderation command
*/
class ModerationCommand extends Command {
    /**
     * @param {CustomClient} client The client passed to the command
     * @param {Object} options The properties of the command
     * @param {Object} logOptions The properties of the moderation log
     * @param {Color} logOptions.color The color for the moderation log
     * @param {String} logOptions.action The name of the action
     */
    constructor(client, options, logOptions) {
        // Initialise the command
        super(client, options);

        /**
         * The client used by the command
         * @type {CustomClient}
         */
        this.client = client;
        /**
         * The color for the embed
         * @type {Discord.ColorResolvable}
         */
        this.color = logOptions.color;
        /**
         * The action name for the moderation action
         * @type {String}
         */
        this.actionName = logOptions.actionName;
        /**
         * The executor of the command (null until the setData method has been called)
         * @type {Discord.GuildMember}
         */
        this.executor = null;
        /**
         * The target for the command (null until the setData method has been called)
         * @type {Discord.GuildMember}
         */
        this.target = null;
        /**
         * The reason for the moderation action (null until the setData method has been called)
         * @type {String}
         */
        this.reason = null;
    }

    /**
     * Fetches data such as the target, reason, and executor
     * @param {Message} message The message used to fetch data
     * @returns {Promise} An empty promise
     */
    async setData(message) {
        // Fetch message args
        const args = message.content.split(" ").slice(1);

        // Get the message member
        this.executor = message.member;
        // Get the target member
        this.target = message.guild.member(await super.verifyUser(args[0]));
        // If no target found, throw an error
        if (!this.target) return super.error("Invalid user.");
        // Find the reason
        this.reason = args.join(" ").replace(new RegExp(`( |)(${this.target}|${this.target.id})( |)`), "");

        // Return an empty promise
        return new Promise(r => r());
    }

    /** 
     * Matches a string with a regular expression and returns all capture groups
     * @param {String} str The string to match
     * @param {RegExp} regex The expression used to match
     * @returns {Promise<Array<matches>>} An array of all matches
    */
   matchAll(str, regex) {
        const res = [];
        let m;

        if (regex.global) {
            while (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        } else if (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        return res[0] ? res[0].slice(1) : null;
    }

    /** 
     * Verifies that the command can run
     * @returns {Boolean} Wether or not the check was successful
    */
    check() {
        // Verify that the user's roles are high enough
        const check1 = this.executor.roles.highest.comparePositionTo(this.target.roles.highest) > 0;
        // If not, throw an error
        if (!check1) super.error("You can't execute this operation on this user.");
        // Verify that the bot's roles are high enough
        const check2 = this.executor.guild.me.roles.highest.comparePositionTo(this.target.roles.highest) > 0;
        // If not, throw an error
        if (check1 && !check2) super.error("I can't execute this operation on that user.");

        // Return true if check1 and check2 are true, and false if one or the other isn't
        return check1 && check2;
    }

    /** 
     * Sends the target a message telling them that a moderation action was executed on them
     * @returns {Promise<Message>} The message sent to the user (null if the send failed)
    */
    notify() {
        return new Promise(resolve => {
            this.target.send(`You have 1 new ${this.actionName}${this.reason ? ` for the reason \`${this.reason}\`` : ""}.`).then(resolve).catch(() => resolve(null));
        });
    }

    /** 
     * Sends the moderation log
     * @returns {Promise<Message>} The moderation log sent
    */
    async send() {
        const channel = this.client.channels.find("name", this.client.config.channels.modlog);
        if (!channel) return super.error(`No moderation log found. Create a channel named \`${this.client.config.channels.modlog}\` to use moderation commands.`);
        if (!this.target) return super.error("No target found.");
        if (!this.executor) throw new Error(`No executor specified for the moderation command ${this.actionName}. Set the executor with super.setExecutor(message.author);`);

        const previous = (await channel.messages.fetch({ limit: 1 })).filter(c => c.author.id === this.client.user.id);
        const caseNumber = (previous.size ? parseInt(previous.first().embeds[0].footer.text.split(" ")[1]) + 1 : 1) || 1;

        const embed = channel.buildEmbed()
            .setColor(this.color)
            .setAuthor(`${this.executor.displayName} (${this.executor.user.tag})`, this.executor.user.displayAvatarURL({ size: 128, format: "png" }))
            .setDescription(`**User:** ${this.target.displayName} (${this.target.user.tag})\n**Action:** ${this.actionName}\n**Reason:** ${this.reason || `Awaiting moderator's input. Type \`!reason ${caseNumber} <reason>\` to set reason.`}`)
            .setFooter(`Case ${caseNumber}`)
            .setTimestamp();

        const sent = embed.send();
        super.respond(`Operation executed on ${this.target.user.tag}.`);
        return sent;
    }
}

// Export the moderation command class
module.exports = ModerationCommand;
