const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const mysqlDataProvider = require('./mysql-data-provider');

module.exports = function (app) {
    // Generic Send SMS
    app.get('/sendsms', function (req, res) {
        var from = req.query.from;
        var to = req.query.to;
        var body = req.query.body;

        var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        client.messages
            .create({
                from: from,
                to: to,
                body: body,
            })
            .then((message) => console.log(message.sid));

        res.status(200).json({ "Message": "OK" });
    });

    // Voice Handler
    app.get('/voice', function (req, res) {
        var from_phone = phoneUtil.parse(req.query.From, "US");
        var to_phone = phoneUtil.parse(req.query.To, "US");
        var from = phoneUtil.format(from_phone, PNF.E164);
        var to = phoneUtil.format(to_phone, PNF.E164);

        console.log("---------CALL HANDLER---------");
        console.log(`Call from: ${from}, to: ${to}`);

        var virtual_number = to;
        var voice_response = new VoiceResponse();

        /* getProxyPhoneMapping -> response data structure
        {
            "AltUserId": "amzn1.account.AHFO4BVNSSGPNBN2JFSQ6KCLECDA",
            "PrimaryPhoneNumber": "+14254490088",
            "VirtualPhoneNumber": "+13363474086",
            "TargetPhoneNumber": "+12064880044",
            "InDebugMode": 0
        }
        */
        mysqlDataProvider.getProxyPhoneMapping(virtual_number, (cb) => {
            var pmap = cb[0];

            if (pmap) {
                // If from is not primary or target then reject the call
                // who should we dial?
                if (from == pmap.PrimaryPhoneNumber) {
                    const dial = voice_response.dial({
                        callerId: pmap.VirtualPhoneNumber
                    });
                    dial.number(pmap.TargetPhoneNumber);
                } else if (from == pmap.TargetPhoneNumber) {
                    // If we just want to show the virtual number as caller Id
                    // Then enable this line and disable next two lines
                    // voice_response.dial(pmap.PrimaryPhoneNumber);
                    const dial = voice_response.dial({
                        callerId: pmap.VirtualPhoneNumber
                    });
                    dial.number(pmap.PrimaryPhoneNumber);
                }
            } else {
                voice_response.say("Sorry! We cannot connect the call. ERROR: 1 0 0 1");
            }

            res.type("text/xml");
            res.send(voice_response.toString());
        });
    });

    // Message Handler
    app.get('/message', function (req, res) {
        var from_phone = phoneUtil.parse(req.query.From, "US");
        var to_phone = phoneUtil.parse(req.query.To, "US");
        var from = phoneUtil.format(from_phone, PNF.E164);
        var to = phoneUtil.format(to_phone, PNF.E164);
        var virtual_number = to;
        var body = req.query.Body;

        console.log("---------MESSAGE HANDLER---------");
        console.log(`Message from: ${from}, to: ${to}`);

        if (body.startsWith("$")) {
            // Its a command
            // handle_sms_commands(from, body, virtual_number, client);
            var command_data = {
                virtualPhoneNumber: virtual_number,
                from: from,
                to: to,
                message: body,
            };

            handleSmsCommands(command_data, (result) => {
                // the result contains twilio response with a twilio message object
                console.log(result);
            });
        } else {
            buildMediaUrlArray(req.query, (cb) => {
                var mediaUrls = cb;
                var data;

                if (mediaUrls.length > 0) {
                    data = {
                        virtualPhoneNumber: virtual_number,
                        from: from,
                        to: to,
                        body: body,
                        mediaUrls: mediaUrls
                    };
                } else {
                    data = {
                        virtualPhoneNumber: virtual_number,
                        from: from,
                        to: to,
                        body: body,
                        mediaUrls: []
                    };
                }
                handleSmsDelivery(data, (result) => {
                    // the result contains twilio response with a twilio message object
                    console.log(result);
                });
            });
        }

        var msg_response = new MessagingResponse();
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(msg_response.toString());
    });
};

// Builds a media url array for up to 10 media urls
// TODO: Re-write recursive
function buildMediaUrlArray(requestQuery, callback) {
    var mediaUrls = [];
    if (requestQuery.MediaUrl0) {
        mediaUrls.push(requestQuery.MediaUrl0);
        if (requestQuery.MediaUrl1) {
            mediaUrls.push(requestQuery.MediaUrl1);
            if (requestQuery.MediaUrl2) {
                mediaUrls.push(requestQuery.MediaUrl2);
                if (requestQuery.MediaUrl3) {
                    mediaUrls.push(requestQuery.MediaUrl3);
                    if (requestQuery.MediaUrl4) {
                        mediaUrls.push(requestQuery.MediaUrl4);
                        if (requestQuery.MediaUrl5) {
                            mediaUrls.push(requestQuery.MediaUrl5);
                            if (requestQuery.MediaUrl6) {
                                mediaUrls.push(requestQuery.MediaUrl6);
                                if (requestQuery.MediaUrl7) {
                                    mediaUrls.push(requestQuery.MediaUrl7);
                                    if (requestQuery.MediaUrl8) {
                                        mediaUrls.push(requestQuery.MediaUrl8);
                                        if (requestQuery.MediaUrl9) {
                                            mediaUrls.push(requestQuery.MediaUrl9);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    callback(mediaUrls);
}

// Handles SMS Commands
function handleSmsCommands(data, callback) {
    var command = data.message.substring(1, 4);
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    switch (command) {
        case "map":
            var msg_arr = data.message.split(":");
            var target = msg_arr[1];
            var target_phone = phoneUtil.parse(target, "US");
            var target_number = phoneUtil.format(target_phone, PNF.E164);
            var virtual_number = data.virtualPhoneNumber;
            var primary_number = data.from;

            updateVirtualPhoneMapping(primary_number, virtual_number, target_number, (result) => {
                console.log(result);
                if (result[1][0].success == 1) {
                    client.messages
                        .create({
                            from: virtual_number,
                            to: primary_number,
                            body: "Now mapped to: " + target_number,
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                } else {
                    client.messages
                        .create({
                            from: virtual_number,
                            to: primary_number,
                            body: "Unable to map. ERROR 1002.",
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                }
            });
            break;
        case "del":
            var target_number = "";
            var virtual_number = data.virtualPhoneNumber;
            var primary_number = data.from;

            updateVirtualPhoneMapping(primary_number, virtual_number, target_number, (result) => {
                if (result[1][0].success == 1) {
                    client.messages
                        .create({
                            from: virtual_number,
                            to: primary_number,
                            body: "Removed mapping",
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                } else {
                    client.messages
                        .create({
                            from: virtual_number,
                            to: primary_number,
                            body: "Unable to remove mapping. Error 1003",
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                }
            });
            break;
        case "lst":
            var virtual_number = data.virtualPhoneNumber;
            var primary_number = data.from;
            mysqlDataProvider.getProxyPhoneMapping(virtual_number, (cb) => {
                var pmap = cb[0];
                if (pmap) {
                    if (pmap.TargetPhoneNumber == "") {
                        client.messages
                            .create({
                                from: virtual_number,
                                to: primary_number,
                                body: "No mapping exists",
                            })
                            .then((smsSendResult) => {
                                callback(smsSendResult);
                            });
                    } else {
                        client.messages
                            .create({
                                from: virtual_number,
                                to: primary_number,
                                body: "Currently mapped to " + pmap.TargetPhoneNumber,
                            })
                            .then((smsSendResult) => {
                                callback(smsSendResult);
                            });
                    }
                }
            });
            break;
        default:
            client.messages
                .create({
                    from: data.virtualPhoneNumber,
                    to: data.from,
                    body: "Valid commands are $map:<target_number>, $del, $lst",
                })
                .then((smsSendResult) => {
                    callback(smsSendResult);
                });
            break;
    }
}

// Used for map and del commands
function updateVirtualPhoneMapping(primaryPhoneNumber, virtualPhoneNumber, targetPhoneNumber, callback) {
    var data = {
        primaryPhoneNumber: primaryPhoneNumber,
        virtualPhoneNumber: virtualPhoneNumber,
        targetPhoneNumber: targetPhoneNumber
    };

    mysqlDataProvider.updateProxyMapForSmsCommand(data, (cb) => {
        callback(cb);
    })
}

// Handles sending SMS
function handleSmsDelivery(data, callback) {
    mysqlDataProvider.getProxyPhoneMapping(data.virtualPhoneNumber, (cb) => {
        // create a client instance
        var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        var pmap = cb[0];

        if (pmap) {
            // who should we send?

            if (data.from == pmap.PrimaryPhoneNumber) {
                if (data.mediaUrls.length > 0) {
                    client.messages
                        .create({
                            from: data.virtualPhoneNumber,
                            to: pmap.TargetPhoneNumber,
                            body: data.body,
                            mediaUrl: data.mediaUrls
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                } else {
                    client.messages
                        .create({
                            from: data.virtualPhoneNumber,
                            to: pmap.TargetPhoneNumber,
                            body: data.body,
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                }
            } else if (data.from == pmap.TargetPhoneNumber) {
                if (data.mediaUrls.length > 0) {
                    client.messages
                        .create({
                            from: data.virtualPhoneNumber,
                            to: pmap.PrimaryPhoneNumber,
                            body: data.body,
                            mediaUrl: data.mediaUrls
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                } else {
                    client.messages
                        .create({
                            from: data.virtualPhoneNumber,
                            to: pmap.PrimaryPhoneNumber,
                            body: data.body,
                        })
                        .then((smsSendResult) => {
                            callback(smsSendResult);
                        });
                }
            } else {
                // do nothing because the sender is neither the primary nor target
                callback({
                    'status': 'Not Sent',
                    'message': 'Sender is neither primary nor target',
                    'proxy': data.virtualPhoneNumber,
                    'primary': pmap.PrimaryPhoneNumber,
                    'target': pmap.TargetPhoneNumber
                });
            }
        } else {
            console.log(`No mapping: From: ${data.from}, To: ${data.to}`);
            client.messages
                .create({
                    from: data.virtualPhoneNumber,
                    to: data.from,
                    body: "ERROR: 1001: No Mapping!",
                })
                .then((smsSendResult) => {
                    callback(smsSendResult);
                });
        }
    });
}
