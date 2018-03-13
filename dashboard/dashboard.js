// Imports
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const express = require("express");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const passport = require("passport");
const { Strategy } = require("passport-discord");
const path = require("path");

// Init express application
const app = express();

function run(client) {
    // Load base directory
    const dataDir = path.resolve(`${process.cwd() + path.sep}dashboard`);
    // Load template directory
    const templateDir = path.resolve(`${dataDir + path.sep}templates`);

    // Define "public" directory
    app.use("/public", express.static(path.resolve(`${dataDir + path.sep}public`)));
    // Define cookie parser
    app.use(cookieParser());

    // Use bodyparser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Passport-discord serialize function
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    // Passport-discord deserialize function
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    // Define OAUTH2 data
    passport.use(new Strategy({
        clientID: client.user.id,
        clientSecret: client.config.dashboard.clientSecret,
        callbackURL: `${client.config.dashboard.domain}/callback`,
        scope: ["identify"]
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    // Define session data
    app.use(session({
        store: new LevelStore("./data/dashboard-session/"),
        secret: client.config.dashboard.secret,
        resave: false,
        saveUninitialized: false
    }));

    // Initialize passport
    app.use(passport.initialize());
    // Initialise session
    app.use(passport.session());

    app.locals.domain = client.config.dashboard.domain;

    // Use EJS engine
    app.engine("html", ejs.renderFile);
    app.set("view engine", "html");
    
    // Define client variable
    app.set("client", client);
    // Define templateDir variable
    app.set("templateDir", templateDir);

    // /staff route
    app.use("/staff", require("./routes/staff"));
    // / route
    app.use("/", require("./routes/index"));

    // Listen on the specified port
    app.listen(client.config.dashboard.port);
}

module.exports = run;
