const twilio = require('twilio');
const validationCodeMap = new Map();

module.exports = function (app) {
    // Sends a validation code to a user phone
    app.post('/validationcode', (req, res) => {
        generateValidationCode((cb) => {
            var code = cb.toString();
            var msg = 'Your proxytel validation code is ' + code;
            var user_primary_phone = req.body.data.user_primary_phone;
            var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            client.messages
                .create({
                    from: process.env.SWITCHBOARD_NUMBER,
                    to: user_primary_phone,
                    body: msg,
                })
                .then((message) => {
                    //  delete from current map array 
                    if (validationCodeMap.has(user_primary_phone)) {
                        validationCodeMap.delete(user_primary_phone);
                    }
                    // Now add to validation map
                    validationCodeMap.set(user_primary_phone, code);
                    var result = {
                        'to': user_primary_phone,
                        'status': 'sent'
                    };
                    res.send(result);
                });
        });
    });

    // validates a code that was sent to a user phone
    app.post('/validatecode', (req, res) => {
        var code = req.body.data.code;
        var user_primary_phone = req.body.data.user_primary_phone;
        var result = {};

        if (validationCodeMap != null && validationCodeMap.has(user_primary_phone)) {
            if (validationCodeMap.get(user_primary_phone) == code) {
                result = {
                    'success': true,
                    'message': 'Code validated',
                    'primary_phone': user_primary_phone
                }
                // delete the mapping
                validationCodeMap.delete(user_primary_phone);
            } else {
                result = {
                    'success': false,
                    'message': 'ERROR: Invalid code ' + user_primary_phone,
                    'primary_phone': user_primary_phone
                }
            }
        } else {
            result = {
                'success': false,
                'message': 'ERROR: Code never sent to ' + user_primary_phone,
                'primary_phone': user_primary_phone
            }
        }
        res.send(result);
    });
}

// Generates a random six digit number
function generateValidationCode(callback) {
    // TODO: Should we make sure that we do not have the number in the validationCodeMap?
    var rnd = Math.round((Math.random() * (999999 - 123456) + 123456));
    callback(rnd);
}