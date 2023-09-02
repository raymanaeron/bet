const twilio = require('twilio');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const mySqlDataProvider = require('./mysql-data-provider');
const phoneDataProvider = require('./phone-data-provider');

// WARNING -- Once any of these function starts they never stop 
// even though you cancel/close the browser
// Better to call them in a client rather than inside a server side timer
module.exports = function (app) {
    app.get('/admin/cleanmessages', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        var interval = setInterval(() => {
            deleteMessages(res);
        }, 5000);
    });

    app.get('/admin/cleancalls', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        var interval = setInterval(() => {
            deleteCalls(res);
        }, 5000);
    });

    app.get('/admin/renewproxyphones', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        var interval = setInterval(() => {
            renewproxyphones(res);
        }, 10000);
    });

    app.get('/admin/createtrn', (req, res) => {
        var amount = 0.00
        if (req.query.amount != null) {
            amount = parseFloat(req.query.amount);
        }
        var trn_type = '';
        var debit = 0.00;
        var credit = 0.00;
        if (amount > 0) {
            trn_type = 'Credit';
            debit = 0.00;
            credit = Math.abs(amount);
        } else {
            trn_type = 'Manual Charge';
            debit = Math.abs(amount);
            credit = 0.00;
        }

        var email = req.query.email;
        if (email != null) {
            mySqlDataProvider.getUserByEmailAddress(email, (cb_user) => {
                if (cb_user != null) {
                    var altUserId = cb_user.AltUserId;
                    if (altUserId != null) {
                        var data = {
                            altUserId: altUserId,
                            transactionType: trn_type,
                            transactionDate: new Date(),
                            processor: 'PROXYTEL',
                            transactionState: 'Completed',
                            description: `${trn_type} by admin`,
                            chargeId: '',
                            chargePermissionId: '',
                            currencyCode: 'USD',
                            debit: debit,
                            credit: credit
                        };
                        mySqlDataProvider.createUserTransaction(data, altUserId, (cb_trn) => {
                            res.status(200).send(cb_trn);
                        });
                    } else {
                        res.status(200).send({ 'status': 'User data did not return an AltID' });
                    }
                } else {
                    res.status(200).send({ 'status': 'User not found' });
                }
            });
        }
    });

    app.get('/admin/switchowner', (req, res) => {
        var vp = req.query.p;
        var vphone = phoneUtil.parse(vp, "US");
        var virtual_number = phoneUtil.format(vphone, PNF.E164);
        var to_email = req.query.to;
        //console.log(`Received ${virtual_number} ==> ${to_email}`);

        phoneDataProvider.getPhoneNumberDetailsFromProvider(virtual_number, (cb) => {
            if (cb != null && cb.length > 0) {
                var phone_record = cb[0];
                //console.log(phone_record);
                if (phone_record.sid != null) {
                    //console.log(phone_record.sid);
                    mySqlDataProvider.getUserByEmailAddress(to_email, (cb_to_user) => {
                        //console.log(cb_to_user);
                        if (cb_to_user != null) {
                            //console.log('before updating provider');
                            // Update voice and SMS urls at the provider
                            phoneDataProvider.updatePhoneNumberDetailsAtProvider(phone_record.sid, (cb_phone_updated) => {
                                // Update virtual phone info in the database
                                var data = {
                                    virtualPhoneNumber: virtual_number,
                                    usageType: 'proxy',
                                    address: '',
                                    isVoiceSupported: phone_record.capabilities.voice,
                                    isSmsSupported: phone_record.capabilities.sms,
                                    isMmsSupported: phone_record.capabilities.mms,
                                    providerId: phone_record.sid,
                                    altUserId: cb_to_user.AltUserId,
                                    primaryPhoneNumber: cb_to_user.PrimaryPhone,
                                    targetPhoneNumber: '',
                                    inDebugMode: false
                                };
                                //console.log('before saving into db');
                                mySqlDataProvider.saveProxyPhone(data, cb_to_user.AltUserId, phone_record.sid, (save_result) => {
                                    // console.log(save_result);
                                    if (save_result != null && save_result.result != null) {
                                        res.status(200).send(save_result.result[1][0]);
                                    } else {
                                        res.status(200).send({ 'status': 'save result unsuccessful' })
                                    }
                                });
                            });
                        } else {
                            res.status(200).send(
                                {
                                    'phone_record': phone_record,
                                    'to_user': ''
                                }
                            );
                        }
                    });
                } else {
                    res.status(200).send(
                        {
                            'phone_record': '',
                            'from_user': '',
                            'to_user': ''
                        }
                    );
                }
            } else {
                res.status(200).send({ 'status': `Phone number ${virtual_number} not found.` });
            }
        })
    });
};

function deleteMessages(res) {
    var one_hour = 60 * 60 * 1000;
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.messages.list({ limit: 10 }).then(msgs => {
        msgs.forEach(m => {
            res.write(`<br/><span>Checking ${m.sid} - From: ${m.from}, To: ${m.to}, Body: ${m.body}</span>`);
            if ((new Date() - m.dateUpdated) > one_hour) {
                res.write(`<span>&nbsp;&nbsp;==>>Deleting ${m.sid}...`);
                client.messages(m.sid).remove();
                res.write(`<span>&nbsp;&nbsp;==>>Deleted...`);
            }
        });

        if (msgs.length < 1) {
            res.write('<br/><span>No message to delete...</span>');
        }
    });
}

function deleteCalls(res) {
    var one_hour = 60 * 60 * 1000;
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.calls.list({ limit: 10 }).then(calls => {
        calls.forEach(c => {
            res.write(`<br/><span>Checking ${c.sid} - From: ${c.from}, To: ${c.to}</span>`);
            if ((new Date() - c.dateCreated) > one_hour) {
                res.write(`<span>&nbsp;&nbsp;==>>Deleting ${c.sid}...`);
                client.calls(c.sid).remove();
                res.write(`<span>&nbsp;&nbsp;==>>Deleted...`);
            }
        });

        if (calls.length < 1) {
            res.write('<br/><span>No call to delete...</span>');
        }
    });
}

function renewproxyphones(res) {
    mySqlDataProvider.renewProxyPhones((cb) => {
        if (cb != null && cb.length > 0) {
            var d = cb[1][0];
            if (d.drop_list != null && d.drop_list.length > 0) {
                // release phone number from twilio
                var phones = d.drop_list.split(',');
                if (phones != null && phones.length > 0) {
                    phones.forEach(p => {
                        phoneDataProvider.deletePhoneNumberFromProvider(p, (cb) => {
                            res.write(`<br/><span>Released phone number: ${d}...</span>`);
                        });
                    });
                }
            } else {
                res.write(`<br/><span>Renewal applied.</span>`);
            }
        }
    });
}