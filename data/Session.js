const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const HOUR = 1000 * 60 * 60;
const SESSION_LIFETIME = 48 * HOUR;
const SESSION_PRODUCTION = false;
const SESSION_NAME = process.env.SESSION_NAME;
const SESSION_SECRET = process.env.SESSION_SECRET;

const SESSION_STORE = new MongoDBStore(
    {
        uri: process.env.MONGODB_URL,
        databaseName: process.env.SESSION_DB,
        collection: process.env.SESSION_COLLECTION,
        connectionOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        },
    },
    function (error) {
        if (error) {
        }
    },
);

const SESSION_CONFIGURATION = {
    store: SESSION_STORE,
    name: SESSION_NAME,
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
        maxAge: SESSION_LIFETIME,
        secure: SESSION_PRODUCTION,
        httpOnly: false,
    },
};

module.exports = session(SESSION_CONFIGURATION);
