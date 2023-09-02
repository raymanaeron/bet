const { decrypt } = require('./crypto-provider');

// Middleware function to check a token
function checkToken(req, res, next) {
    var authHeader = req.headers['authorization'];
    if (authHeader != null && authHeader != undefined) {
        var authToken = JSON.parse(authHeader.replace('Bearer ', ''));
        if (authToken != null && authToken != undefined) {
            req.user = JSON.parse(decrypt(authToken));
            //console.log("from middleware...");
            //console.log(req.user);
            next();
        } else {
            res.status(503).send({ 'status': 'Error', message: 'Auth token not present in request header.' });
        }
    } else {
        res.status(503).send({ 'status': 'Error', message: 'Auth header must be present.' });
    }
}

module.exports = {
    checkToken
}