const { Collection } = require("discord.js");
const ms = require("pretty-ms");
const { Router } = require("express");

const checkAuth = require("../functions/checkAuth");
const fetchVariables = require("../functions/fetchVariables");
const fetchSupportData = require("../../methods/restricted/fetchSupportData");

// Initialise router
const router = Router();


// GET staff/
router.get("/", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not staff, throw a 404
    if (perms.level < 2) return res.status(404);

    // Render file
    res.render(`${templateDir}/staff/index.ejs`, {
        client,
        auth: true,
        user: req.user,
        perms
    });
});

// GET staff/support
router.get("/support", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not support, throw a 404
    if (perms.level < 2) return res.status(404);

    // Render file
    res.render(`${templateDir}/staff/support.ejs`, {
        client,
        auth: true,
        user: req.user,
        perms,
        mode: req.query.mode,
        data: await { ms, ...await fetchSupportData(client, req.user.id) }
    });
});

// POST staff/support/notify/mention
router.post("/support/notify/mention", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not expert, throw a 404
    if (perms.level < 3) return res.status(404);

    // Fetch all online support
    const support = client.guild.members.filter(m => m.roles.exists("name", "Support") && ["online", "idle"].includes(m.presence.status));
    // Fetch staffchat
    const staffchat = client.channels.find("name", client.config.channels.staffchat);
    // Send a message to staffchat
    staffchat.send(`${support.map(s => s.toString()).join(" ")}\n${req.user.username} has requested that you help with the queue. Thank you!`);

    // Redirect the user
    res.redirect("/staff/support?mode=success");
});

// POST staff/support/notify/dm
router.post("/support/notify/dm", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not expert, throw a 404
    if (perms.level < 3) return res.status(404);

    // Fetch all online support
    const support = client.guild.members.filter(m => m.roles.exists("name", "Support") && ["online", "idle"].includes(m.presence.status));
    // Send a message to all support
    support.forEach(s => s.send(`${req.user.username} has requested that you help with the queue. Thank you!`).catch(() => null));

    // Redirect the user
    res.redirect("/staff/support?mode=success");
});

// GET staff/mod
router.get("/mod", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not mod, throw a 404
    if (perms.level < 4) return res.status(404);

    // Fetch last 25 reports
    const reports = await client.channels.find("name", "reports").messages.fetch({ limit: 25 });
    // Filter reports and slice them
    const filtered = reports ? reports.filter(r => {
        const match = /([a-zA-Z0-9]{2,16})[\s|](\||-|:|is)[\s|](.+)/g.exec(r.content);
        return (!r.reactions.first() || r.reactions.first().count === 0) && (r.embeds && r.embeds.length > 0 || r.attachments.size > 0) && match && match.length > 4;
    }).array().slice(0, 4) : new Collection();

    // Render file
    res.render(`${templateDir}/staff/mod.ejs`, {
        client,
        auth: true,
        user: req.user,
        perms,
        mode: req.query.mode,
        data: {
            reports: filtered
        }
    });
});

// GET staff/mod/report/:id/accept
router.get("/mod/report/:id/accept", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not mod, throw a 404
    if (perms.level < 4) return res.status(404);

    try {
        // Fetch the guild member
        const member = await client.guild.members.fetch(req.user.id);
        // Fetch the reports channel
        const channel = client.channels.find("name", "reports");
        // Fetch the report
        const message = await channel.messages.fetch(req.params.id);
        // Add a reaction to the report
        await message.react("✅");
        // Send a message to the reports channel
        await message.channel.send(`${message.author} | ✅ | Your report has been accepted by ${member.displayName}!`);
        // Redirect the user
        res.redirect("/staff/mod?mode=success");
    } catch (e) {
        res.redirect("/staff/mod?mode=error");
    }
});

// GET staff/mod/report/:id/deny
router.get("/mod/report/:id/deny", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not mod, throw a 404
    if (perms.level < 4) return res.status(404);

    try {
        // Fetch the guild member
        const member = await client.guild.members.fetch(req.user.id);
        // Fetch the reports channel
        const channel = client.channels.find("name", "reports");
        // Fetch the report
        const message = await channel.messages.fetch(req.params.id);
        // Add a reaction to the report
        await message.react("❌");
        // Send a message to the reports channel
        await message.channel.send(`${message.author} | ❌ | Your report has been denied by ${member.displayName}.`);
        // Redirect the user
        res.redirect("/staff/mod?mode=success");
    } catch (e) {
        console.log(e);
        res.redirect("/staff/mod?mode=error");
    }
});

// GET staff/admin
router.get("/admin", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not admin, throw a 404
    if (perms.level < 5) return res.status(404);

    // Fetch chat channels
    const chatChannels = client.guild.channels.filter(channel => channel.type === "text" && ["dfchat", "offtopic", "reports"].includes(channel.name));
    // Fetch verified role
    const verified = client.guild.roles.find("name", "Verified");
    // Fetch wether or not the server is on cooldown
    const onLockdown = (chatChannels.find(c => !c.permissionsFor(verified).has("SEND_MESSAGES")));

    // Fetch node data
    const nodes = await (require("../../methods/restricted/fetchNodeData"))(client);

    // Render file
    res.render(`${templateDir}/staff/admin.ejs`, {
        client,
        auth: true,
        user: req.user,
        perms,
        mode: req.query.mode,
        data: {
            ms,
            onLockdown,
            nodes
        }
    });
});

// GET staff/admin/lockdown
router.get("/admin/lockdown", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not admin, throw a 404
    if (perms.level < 5) return res.status(404);

    // Fetch chat channels
    const chatChannels = client.guild.channels.filter(channel => channel.type === "text" && ["dfchat", "offtopic", "reports"].includes(channel.name));
    // Fetch verified role
    const verified = client.guild.roles.find("name", "Verified");
    // Fetch wether or not the server is on cooldown
    const onLockdown = chatChannels.filter(c => c.permissionsFor(verified).has("SEND_MESSAGES")).size === 0;
    // Fetch announcements channel
    const announcements = client.channels.find("name", client.config.channels.announcements);

    // If lockdown is active, disable it
    if (onLockdown) {
        // Run through all chat channels and disable the lockdown
        chatChannels.forEach(channel => channel.overwritePermissions(verified, { SEND_MESSAGES: true }, "Lockdown lifted."));
        // Send an announcement
        announcements.send("The lockdown has been lifted! You can now chat and verify accounts again.");

        // If no verified role or announcements found, throw an error
        if (!verified || !announcements) return res.redirect("/staff/admin?mode=error");

        // If not, enable it
    } else {
        // Run through all chat channels and enable the lockdown
        chatChannels.forEach(channel => channel.overwritePermissions(verified, { SEND_MESSAGES: false }, "Lockdown activated."));
        // Send an announcement
        announcements.send("Hello, everyone. An administrator has activated a complete server lockdown. This means that you are no longer able to type in any channels, nor verify your account. Please do not direct message admins, or any staff, unless you feel that it is important information.");
    }

    // Redirect the user
    res.redirect("/staff/admin?mode=success");
});

// GET /staff/admin/bans
router.get("/admin/bans", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not admin, throw a 404
    if (perms.level < 5) return res.status(404);

    // Render file
    res.render(`${templateDir}/staff/bans.ejs`, {
        client,
        auth: true,
        user: req.user,
        perms,
        mode: req.query.mode,
        data: {
            bans: await client.guild.fetchBans()
        }
    });
});

// GET /staff/admin/bans/revoke/:id
router.get("/admin/bans/revoke/:id", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not admin, throw a 404
    if (perms.level < 5) return res.status(404);

    // Execute unban and redirect the user
    client.guild.members.unban(req.params.id).then(() => res.redirect("/staff/admin?mode=success")).catch(() => res.redirect("/satff/admin?mode=error"));
});

// POST /staff/admin/announcement
router.post("/admin/announcement", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Calculate user permissions
    const perms = await client.permLevel(req.user.id);
    // If user is not admin, throw a 404
    if (perms.level < 5) return res.status(404);

    // Fetch announcements channel
    const channel = client.channels.find("name", client.config.channels.announcements);
    // Create a new embed
    const embed = channel.buildEmbed();
    // Fetch the user
    const member = await client.guild.members.fetch(req.user.id);

    // Set embed properties
    if (req.body.anonymous !== "on") embed.setAuthor(`${member.displayName} (${member.user.tag})`, member.user.avatarURL({ size: 128, format: "jpg" }));
    if (req.body.title) embed.setTitle(req.body.title);
    if (req.body.body) embed.setDescription(req.body.body);
    if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(req.body.image)) embed.setImage(req.body.image);
    if (req.body.color && !isNaN(parseInt(req.body.color.replace("#", ""), 16))) embed.setColor(req.body.color);

    const text = `${req.body.role === "none" ? "" : `${req.body.role} | `}A new announcement has been posted!`;
    
    // Post the announcement and redirect the user.
    embed.send({ content: text, disableEveryone: false }).then(() => res.redirect("/staff/admin?mode=success")).catch(() => res.redirect("/staff/admin?mode=error"));
});

// Export the router
module.exports = router;
