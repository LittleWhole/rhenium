const Base = require("../../base/Command.js");

module.exports = class MyLevel extends Base {
    constructor(client) {
        super(client, {
            name: "mylevel",
            description: "See your permission level.",
            usage: "",
            category: "information",
            permLevel: 0 
        });
    }

    run(message, args, perms) {
        super.respond(`You are permission level \`${perms.level}\` (**${perms.name}**).`);
    }
};
