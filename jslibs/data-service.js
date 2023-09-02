const { encrypt, decrypt } = require('./crypto-provider');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const mockDataProvider = require('./mock-data-provider');
const mysqlDataProvider = require('./mysql-data-provider');
const amznPayDataProvider = require('./amzn-pay-data-provider');
const middlewareFunctionProvider = require('./middleware-function-provider');
const phoneDataProvider = require('./phone-data-provider');

module.exports = function (app) {

    app.get('/proxymap', (req, res) => {
        mysqlDataProvider.getAllProxyPhoneMappings((cb) => {
            res.status(200).send(cb);
        });
    });

    // Gets a list of products
    app.get('/products', (req, res) => {
        res.status(200).send(mockDataProvider.getProducts());
    });

    // Gets the amazon buyer profile
    app.get('/buyerdata', (req, res) => {
        var token = req.query.token;
        amznPayDataProvider.getBuyer(token, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Gets a user profile by alternate Id
    app.get('/userprofile', middlewareFunctionProvider.checkToken, (req, res) => {
        altUserId = req.user.AltUserId;
        mysqlDataProvider.getUserByAlternateId(altUserId, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Creates or updates a user profile
    app.post('/userprofile', middlewareFunctionProvider.checkToken, (req, res) => {
        //console.log('req.user:....');
        //console.log(req.user);
        var altUserId = req.user.AltUserId;
        var data = req.body.data;
        mysqlDataProvider.createOrUpdateUserProfile(data, altUserId, (cb) => {
            // prep a new token based on new user profile
            //console.log("DB profile save result");
            //console.log(cb);
            var profile = cb[0][0];
            //console.log(profile);

            var result = {
                'token': encrypt(JSON.stringify(profile)),
                'profile': profile
            };
            res.status(200).send(result);
        });
    });

    // Gets user account balance
    app.get('/balance', middlewareFunctionProvider.checkToken, (req, res) => {
        var altUserId = req.user.AltUserId;
        mysqlDataProvider.getUserAccountBalance(altUserId, (cb) => {
            res.status(200).send(cb[1][0]);
        });
    });

    // Gets user account balance
    app.get('/history', middlewareFunctionProvider.checkToken, (req, res) => {
        var altUserId = req.user.AltUserId;
        mysqlDataProvider.getSummarizedUserTransactions(altUserId, (cb) => {
            res.status(200).send(cb[0]);
        });
    });

    // Gets a login button signature
    app.get('/loginbtnsignature', (req, res) => {
        amznPayDataProvider.getLoginButtonSignature((cb) => {
            res.status(200).send(cb);
        })
    });

    // Gets a button signature for a given product Id
    app.get('/storebtnsignature', (req, res) => {
        var productId = req.query.productId;
        amznPayDataProvider.getStoreButtonSignature(productId, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Gets a checkout session details
    // This is a notification url so cannot have token
    app.get('/checkoutsession', (req, res) => {
        amznPayDataProvider.getCheckoutSession(req.query.id, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Completes a checkout
    app.get('/completecheckout', (req, res) => {
        amznPayDataProvider.completeCheckoutSession(req.query.id, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Gets all proxy phones that are associated with a given user
    app.get('/proxyphone', middlewareFunctionProvider.checkToken, (req, res) => {
        var altUserId = req.user.AltUserId;
        mysqlDataProvider.getUserProxyPhones(altUserId, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Buys a proxy phone and then saves it into the database 
    app.post('/proxyphone', middlewareFunctionProvider.checkToken, (req, res) => {
        var phone_number = req.body.data.virtualPhoneNumber;
        if (phone_number != null && phone_number != undefined) {
            phoneDataProvider.buyVirtualPhoneNumber(phone_number, (cb1) => {
                var providerId = cb1.sid;
                if (providerId != null) {
                    var altUserId = req.user.AltUserId;
                    mysqlDataProvider.saveProxyPhone(req.body.data, altUserId, providerId, (cb2) => {
                        var trn_data = {
                            'transactionType': 'Charge',
                            'transactionDate': new Date(),
                            'processor': 'PROXYTEL',
                            'transactionState': 'Completed',
                            'description': 'Monthly charge for proxy phone: ' + cb2.virtualPhoneNumber,
                            'chargeId': '',
                            'chargePermissionId': '',
                            'currencyCode': 'USD',
                            'debit': parseFloat(process.env.PROXY_PHONE_RENEWAL_PRICE),
                            'credit': 0.00
                        };

                        mysqlDataProvider.createUserTransaction(trn_data, altUserId, (cb3) => {
                            res.status(200).send(cb3);
                        });
                    });
                } else {
                    throw new Error("Phone purchase was unsuccessful.");
                }
            });
        } else {
            throw new Error("Request body does not contain a virtual phone number.");
        }
    });

    // Deletes a proxyphone
    // TODO: Must check if the proxy phone belongs to the user logged in
    app.delete('/proxyphone', middlewareFunctionProvider.checkToken, (req, res) => {
        var phone_number = req.query.proxy_number;
        var altUserId = req.user.AltUserId;
        var vphone = phoneUtil.parse(phone_number, "US");
        var virtual_number = phoneUtil.format(vphone, PNF.E164);
        // console.log(`Deleting :${virtual_number} for ${altUserId}`);

        mysqlDataProvider.deleteProxyPhone(virtual_number, altUserId, (cb) => {
            // Delete from the provider
            phoneDataProvider.deletePhoneNumberFromProvider(virtual_number, (vcb) => {
                res.status(200).send(vcb);
            });
        });
    });

    // Updates a proxy phone setting
    // TODO: Must check if the virtual number belongs to the user
    app.put('/proxyphonesetting', middlewareFunctionProvider.checkToken, (req, res) => {
        var altUserId = req.user.AltUserId;
        var data = req.body.data;
        mysqlDataProvider.updateProxyPhoneSetting(data, altUserId, (cb) => {
            res.status(200).send(cb);
        });
    });
};