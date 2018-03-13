const { TextChannel, DMChannel, MessageEmbed, Message } = require("discord.js");
const Command = require("../base/Command");

TextChannel.prototype.buildEmbed = DMChannel.prototype.buildEmbed = function (data = {}) {
    return Object.defineProperty(new MessageEmbed({ ...data, timestamp: data.timestamp ? new Date() : null } || {}), "channel", { value: this });
};

MessageEmbed.prototype.send = function (options = {}) {
    if (!this.channel || !(this.channel instanceof TextChannel || this.channel instanceof DMChannel)) return Promise.reject("Invalid channel.");
    return this.channel.send(options.content || "", { embed: this, ...options });
};

Message.prototype.appendTo = function (command) {
    if (!(command instanceof Command)) return Promise.reject("Invalid command.");
    return Object.defineProperty(command, "message", { value: this, configurable: true });
};
