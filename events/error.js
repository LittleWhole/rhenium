module.exports = class {
    constructor(client) {
        this.client = client;
    }

    run(error) {
        console.log(`A websocket error occured. VerifyBot may require a restart.\n${error}`);
    }
};
