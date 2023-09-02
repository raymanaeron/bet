const https = require('https');

function validateAmznToken(authToken, callback) {
    var valid = false;

    parseAmznToken(authToken, (cb) => {
        if (cb.error == null || cb.error == undefined) {
            var data = JSON.parse(cb);
            // validate the app id and token issuer
            if (data.app_id != null && data.app_id == process.env.AMZN_APP_ID &&
                data.iss != null && data.iss == process.env.AMZN_TOKEN_ISSUER) {
                valid = true;
                callback(
                    {
                        'data': data,
                        'isTokenValid': valid
                    });
            } else {
                callback(
                    {
                        'data': data,
                        'isTokenValid': valid
                    });
            }
        } else {
            return callback(
                {
                    'data': cb.error,
                    'isTokenValid': valid
                });
        }
    });
}

// Parses AMZN Token
function parseAmznToken(token, callback) {
    var data = '';
    var url = process.env.AMZN_AUTH_VERIFY_URL + token;

    https.get(url, (resp) => {
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Send out the result.
        resp.on('end', () => {
            // console.log(data);
            callback(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        return callback(err);
    });
}

module.exports = {
    parseAmznToken,
    validateAmznToken
}