/**
 * Checks that the user is authenticated
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect("/login");
}

module.exports = checkAuth;
