/**
 * Fetches client and templateDir variables
 * @param {Request} req The request to fetch variables from
 */
function fetchVariables(req) {
    const client = req.app.get("client");
    const templateDir = req.app.get("templateDir");

    return { client, templateDir };
}

module.exports = fetchVariables;
