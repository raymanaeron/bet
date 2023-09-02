
// MOVED 3-10-2022
app.get('/userprofilessssssssss', (req, res) => {
    // read the amazon user Id that is extracted by the middleware function and attached to the request
    var altUserId = req.userId;
    getMySqlConnection(con => {
        con.connect(function (err) {
            if (err) {
                console.log(err);
                res.send(err);
            };

            var proc = "CALL getUserByAltId (?);";
            var params = [altUserId];

            con.query(proc, params,
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    };

                    con.end();

                    if (result != null && result[0] != null) {
                        res.send(result[0]);
                    }
                });
        });
    });

});

// MOVED 3-10-22
app.post('/userprofilesssss', (req, res) => {
    // collect request params
    var authToken = req.body.data.authToken;
    /*
    / Parsed Token
    {
        "aud": "amzn1.application-oa2-client.02754c39c4d94fa99708720de204a3a8",
        "user_id": "amzn1.account.AFJ5P5YKISGQ6OBTX74S26LLWEVA",
        "iss": "https://www.amazon.com",
        "exp": 3531,
        "app_id": "amzn1.application.73dea4f116534c3ebedeca676044b0ca",
        "iat": 1645927827
    }
    */

    // These params come from SocialUser object
    var auth_provider = req.body.data.provider;
    var user_email = req.body.data.email;
    var user_name = req.body.data.name;

    // These two must be validated and inserted with the body
    var primary_phone = req.body.data.primary_phone;
    var primary_phone_validated = req.body.data.primary_phone_validated;

    // Make sure that socialUser.id (from the UI) == token.id (from the middleware function token validation)
    if (req.body.data.id == req.id) {
        console.log("user ids matched");
    }

    // create a user profile in the database if it does not exist
    getMySqlConnection((con) => {
        con.connect(function (err) {
            if (err) { throw err; }

            var proc = "CALL createOrUpdateUserProfile (?,?,?,?,?,?,@PK); SELECT @PK as primary_key;";
            var params = [
                user_name,
                user_email,
                primary_phone,
                primary_phone_validated,
                req.userId,
                auth_provider
            ];

            con.query(proc, params,
                function (err, result) {
                    if (err) {
                        console.log(err);
                        if (err.code == 'ER_DUP_ENTRY') {
                            return res.send({
                                'error': 'Duplicate entry',
                                'message': err.sqlMessage.replace('Users.', '')
                            });
                        } else {
                            throw err;
                        }
                    };

                    con.end();
                    res.send(result);
                });
        })

    });

});

// MOVED 3-10-2022
app.post('/proxyphonesssss', function (req, res) {
    var phone_number = req.body.data.virtualPhoneNumber;

    if (phone_number != null && phone_number != undefined) {
        buy_virtual_number(phone_number, (cb) => {
            //console.log(cb);

            var provider_id = cb.sid;

            getMySqlConnection(con => {
                con.connect((err) => {
                    if (err) { throw err; }

                    // TODO: should come from another API call
                    var renewalPrice = 14.99;

                    // TODO: should come from a policy config
                    var date_plus_30 = new Date();
                    date_plus_30.setDate(date_plus_30.getDate() + 28);

                    var sql = "CALL createVirtualPhoneNumber(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@success); SELECT @success as success";
                    var params = [
                        req.body.data.virtualPhoneNumber,
                        req.body.data.usageType,
                        req.body.data.address,
                        new Date(),
                        date_plus_30,
                        renewalPrice,
                        true,
                        req.body.data.isVoiceSupported,
                        req.body.data.isSmsSupported,
                        req.body.data.isMmsSupported,
                        process.env.PHONE_SERVICE_PROVIDER,
                        provider_id,
                        process.env.TWILIO_VOICE_URL,
                        process.env.TWILIO_VOICE_HTTP_METHOD,
                        process.env.TWILIO_SMS_URL,
                        process.env.TWILIO_SMS_HTTP_METHOD,
                        req.userId,
                        req.body.data.primaryPhoneNumber,
                        req.body.data.targetPhoneNumber,
                        req.body.data.inDebugMode
                    ];
                    con.query(sql, params, function (err, results, fields) {
                        // console.log(params);
                        if (err) { console.log(err); throw err; }
                        // do something with the result
                        res.send(results);
                        // close the connection
                        con.end();
                    })
                });
            });

        });
    }
});

// NOT IN USE
app.post('/virtualphonenumber', function (req, res) {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        };
        console.log('Saving virtual number...');

        var proc = "CALL insertVirtualPhoneNumber (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@PK); SELECT @PK as primary_key;";
        var params = [
            req.body.data.virtualPhoneNumber,
            req.body.data.usageType,
            req.body.data.address,
            req.body.data.purchaseDate,
            req.body.data.renewalDate,
            req.body.data.renewalPrice,
            req.body.data.isActive,
            req.body.data.isVoiceSupported,
            req.body.data.isSmsSupported,
            req.body.data.isMmsSupported,
            req.body.data.provider,
            req.body.data.providerIdentifier,
            req.body.data.incomingVoiceUrl,
            req.body.data.incomingVoiceHttpMethod,
            req.body.data.incomingMessageUrl,
            req.body.data.incomingMessageHttpMethod
        ];

        con.query(proc, params,
            function (err, result) {
                if (err) {
                    console.log(err);
                };

                con.end(function (err) {
                    if (err) {
                        console.log('error:' + err.message);
                    }
                });

                res.send(result);
            });
    });
});

// MOVED 3-10-2022
app.delete('/virtualphonenumber', function (req, res) {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        };
        var proc = 'CALL deleteVirtualPhoneNumber (?,@SUCCESS); SELECT @SUCCESS as success;'
        var params = [
            req.query.id
        ];
        con.query(proc, params, function (err, result) {
            if (err) {
                console.log(err);
            };

            con.end(function (err) {
                if (err) {
                    console.log('error:' + err.message);
                }
            });
            res.send(result);
        });
    });
});

// MOVED 3-10-22
app.get('/userproxyphone', function (req, res) {
    getMySqlConnection(con => {
        // the alt user Id (amazon id) req.userId -- comes from the token 
        // see the middleware function that intercepts the http calls 
        // to retrieve the userId and set with the request object
        con.connect(function (err) {
            if (err) {
                console.log(err);
            };
            var sql = "CALL getUserVirtualPhones('" + req.userId + "')";
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                };

                con.end(function (err) {
                    if (err) {
                        console.log('error:' + err.message);
                    }
                });

                res.send(result);
            });
        });
    });
});

// NOT IN USE
app.post('/uservirtualnumber', function (req, res) {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        };

        var proc = "CALL insertUserVirtualPhoneNumber (?,?,@PK); SELECT @PK as primary_key;";
        var params = [
            req.body.data.userId,
            req.body.data.virtualPhoneNumberId,
        ];

        con.query(proc, params,
            function (err, result) {
                if (err) {
                    console.log(err);
                };

                con.end(function (err) {
                    if (err) {
                        console.log('error:' + err.message);
                    }
                });
                res.send(result);
            });
    });
});

// NOT IN USE
app.post('/virtualphonesetting', function (req, res) {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        };

        var proc = "CALL insertVirtualPhoneSetting (?,?,?,?,@PK); SELECT @PK as primary_key;";
        var params = [
            req.body.data.virtualPhoneNumberId,
            req.body.data.primaryPhoneNumber,
            req.body.data.targetPhoneNumber,
            req.body.data.inDebugMode,
        ];

        con.query(proc, params,
            function (err, result) {
                if (err) {
                    console.log(err);
                };

                con.end(function (err) {
                    if (err) {
                        console.log('error:' + err.message);
                    }
                });

                res.send(result);
            });
    });
});

// MOVED 3-10-2022
app.put('/virtualphonesetting', function (req, res) {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        };

        var proc = "CALL updateVirtualPhoneSetting (?,?,?,?,?,@PK); SELECT @PK as primary_key;";
        var params = [
            req.body.data.virtualPhoneSettingId,
            req.body.data.virtualPhoneNumberId,
            req.body.data.primaryPhoneNumber,
            req.body.data.targetPhoneNumber,
            req.body.data.inDebugMode,
        ];

        con.query(proc, params,
            function (err, result) {
                if (err) {
                    console.log(err);
                };

                con.end(function (err) {
                    if (err) {
                        console.log('error:' + err.message);
                    }
                });

                res.send(result);
            });
    });
});


// Gets a MySQL connection object
function getMySqlConnection(callback) {
    var connection = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });
    callback(connection);
}