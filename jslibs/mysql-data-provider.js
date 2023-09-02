const mysql = require('mysql');

// Gets user by amazon buyer Id
function getUserByAlternateId(altUserId, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getUserByAltId (?);";
    var params = [altUserId];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) { console.log(err); };
            if (result != null && result[0] != null && result[0][0] != null) {
                callback(result[0][0]);
            } else {
                callback({ 'status': 'Error: User Not Found' });
            }
        }
    );
}

function getUserByEmailAddress(email, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getUserByEmailAddress (?);";
    var params = [email];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) { console.log(err); };
            if (result != null && result[0] != null && result[0][0] != null) {
                callback(result[0][0]);
            } else {
                callback({ 'status': 'Error: User Not Found' });
            }
        }
    );
}

// Gets all proxy phone mappings
function getAllProxyPhoneMappings(callback) {
    var con = getMySqlConnection();
    var proc = "CALL getAllVirtualPhoneMappings ();";

    con.query(proc, 
        function (err, result) {
            con.end();
            if (err) { console.log(err); };
            
            if (result != null && result[0] != null ) {
                callback(result[0]);
            } else {
                callback({ 'status': 'Error: Virtual Phone Mappings Not Found' });
            }
        }
    );
}

// Get a single proxy phone mapping
function getProxyPhoneMapping(virtualPhoneNumber, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getVirtualPhoneMapping (?);";
    var params = [virtualPhoneNumber];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) { console.log(err); };
            
            if (result != null && result[0] != null ) {
                callback(result[0]);
            } else {
                callback({ 'status': 'Error: Virtual Phone Mapping Not Found' });
            }
        }
    );
}

// Gets user account balance
function getUserAccountBalance(altUserId, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getUserAccountBalanceByAltUserId (?, @bal); SELECT @bal as AccountBalance; ";
    var params = [altUserId];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) {
                console.log(err);
            };
            callback(result);
        });
}

// Gets transaction history
function getSummarizedUserTransactions(altUserId, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getSummarizedUserTransactions (?)";
    var params = [altUserId];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) {
                console.log(err);
            };
            callback(result);
        });
}

// Creates or updates a user profile
function createOrUpdateUserProfile(data, altUserId, callback) {
    var user_name = data.name;
    var user_email = data.email;
    var primary_phone = data.primary_phone;
    var primary_phone_validated = data.primary_phone_validated;
    var auth_provider = data.provider;

    var con = getMySqlConnection();
    var proc = "CALL createOrUpdateUserProfile (?,?,?,?,?,?)";
    var params = [
        user_name,
        user_email,
        primary_phone,
        primary_phone_validated,
        altUserId,
        auth_provider
    ];

    con.query(proc, params,
        function (err, result) {
            con.end();

            if (err) {
                console.log(err);
                if (err.code == 'ER_DUP_ENTRY') {
                    callback({
                        'error': 'Duplicate entry',
                        'message': err.sqlMessage.replace('Users.', '')
                    });
                } else {
                    throw err;
                }
            };
            callback(result);
        });
}

// Saves a virtual phone + user virtual phone relationship + virtual phone settings 
// in the database
function saveProxyPhone(data, altUserId, providerId, callback) {
    var con = getMySqlConnection();
    var renewalPrice = parseFloat(process.env.PROXY_PHONE_RENEWAL_PRICE);
    var renewal_date = new Date();
    renewal_date.setDate(renewal_date.getDate() + parseInt(process.env.PROXY_PHONE_VALID_DAYS));

    var proc = "CALL createOrModifyVirtualPhoneNumber(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@success); SELECT @success as success";
    var params = [
        data.virtualPhoneNumber,
        data.usageType,
        data.address,
        new Date(),
        renewal_date,
        renewalPrice,
        true,
        data.isVoiceSupported,
        data.isSmsSupported,
        data.isMmsSupported,
        process.env.PHONE_SERVICE_PROVIDER,
        providerId,
        process.env.TWILIO_VOICE_URL,
        process.env.TWILIO_VOICE_HTTP_METHOD,
        process.env.TWILIO_SMS_URL,
        process.env.TWILIO_SMS_HTTP_METHOD,
        altUserId,
        data.primaryPhoneNumber,
        data.targetPhoneNumber,
        data.inDebugMode
    ];
    con.query(proc, params,
        function (err, results) {
            // close the connection
            con.end();

            if (err) {
                console.log(err);
                throw err;
            }

            // callback with the result
            callback({ 'virtualPhoneNumber': data.virtualPhoneNumber, 'result': results});
        }
    );
}

// Gets all proxy phone that are associated with a particular user
function getUserProxyPhones(altUserId, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getUserVirtualPhones('" + altUserId + "')";
    con.query(proc, function (err, result) {
        con.end();
        if (err) {
            console.log(err);
        };
        callback(result);
    });
}

// Charges the customer if account balance is greater than renewal price. Else marks the phone inactive
// We must interpret the drop_list (result) from this call and release the phone numbers that are in the list
function renewProxyPhones(callback) {
    var con = getMySqlConnection();
    var proc = 'CALL renewProxyPhones (@drop_phone_list); SELECT @drop_phone_list as drop_list;'
    con.query(proc, function (err, result) {
        con.end();
        if (err) {
            console.log(err);
        };
        callback(result);
    });
}

// Deletes a proxy phone from the database and all its relationships
function deleteProxyPhone(phoneNumber, altUserId, callback) {
    // TODO: Must check if the virtual number belongs to the user
    var con = getMySqlConnection();
    var proc = 'CALL deleteVirtualPhoneNumber (?,@SUCCESS); SELECT @SUCCESS as success;'
    var params = [phoneNumber];
    con.query(proc, params, function (err, result) {
        con.end();
        if (err) {
            console.log(err);
        };
        callback(result);
    });
}

// Returns a twilio Id for a given virtual phone number
function getProviderIdentifier(virtualPhoneNumber, callback) {
    var con = getMySqlConnection();
    var proc = "CALL getProviderIdentifier(?)";
    var params = [virtualPhoneNumber];
    con.query(proc, params, function (err, result) {
        con.end();
        if (err) {
            console.log(err);
        };
        callback(result);
    });
}

// Updates a proxy phone settings --- usually the target phone number
function updateProxyPhoneSetting(data, altUserId, callback) {
    // TODO: Must check if the virtual number belongs to the user
    var con = getMySqlConnection();
    var proc = "CALL updateVirtualPhoneSetting (?,?,?,?,?,@PK); SELECT @PK as primary_key;";
    var params = [
        data.virtualPhoneSettingId,
        data.virtualPhoneNumberId,
        data.primaryPhoneNumber,
        data.targetPhoneNumber,
        data.inDebugMode,
    ];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) {
                console.log(err);
            };
            callback(result);
        });
}

// Updates proxy phone mapping for SMS commands
function updateProxyMapForSmsCommand(data, callback) {
    var con = getMySqlConnection();
    var proc = "CALL updateVirtualPhoneMapping (?,?,?,@SUCCESS); SELECT @SUCCESS as success;";
    var params = [
        data.primaryPhoneNumber,
        data.virtualPhoneNumber,
        data.targetPhoneNumber
    ];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) {
                console.log(err);
            };
            callback(result);
        });
}

// Creates a financial transaction
function createUserTransaction(data, altUserId, callback) {
    var con = getMySqlConnection();
    var proc = "CALL createUserTransaction (?,?,?,?,?,?,?,?,?,?,?,@PK); SELECT @PK as primary_key;";
    var params = [
        altUserId,
        data.transactionType,
        data.transactionDate,
        data.processor,
        data.transactionState,
        data.description,
        data.chargeId,
        data.chargePermissionId,
        data.currencyCode,
        data.debit,
        data.credit
    ];

    con.query(proc, params,
        function (err, result) {
            con.end();
            if (err) {
                console.log(err);
            };
            callback(result);
        });
}

// Gets a MySQL connection object
function getMySqlConnection() {
    var con = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USERID,
        password: process.env.MY_SQL_USERPWD,
        database: process.env.MY_SQL_DATABASE,
        multipleStatements: true
    });

    con.connect(function (err) {
        if (err) { console.log(err); };
    });
    return con;
}

module.exports = {
    getUserByAlternateId,
    getUserByEmailAddress,
    getAllProxyPhoneMappings,
    getProxyPhoneMapping,
    createOrUpdateUserProfile,
    getUserAccountBalance,
    getSummarizedUserTransactions,
    saveProxyPhone,
    getUserProxyPhones,
    deleteProxyPhone,
    renewProxyPhones,
    getProviderIdentifier,
    updateProxyPhoneSetting,
    updateProxyMapForSmsCommand,
    createUserTransaction
}

/* DONT DELETE - SAMPLE MYSQL CALL*/
/*
app.post('/<route>', function (req, res) {
    getMySqlConnection(con => {
        con.connect((err) => {
            if (err) { throw err; }

            var sql = "";
            var params = [];
            con.query(sql, params, function(err, results, fields) {
                if (err) { throw err; }
                // do something with the result

                // close the connection
                con.end();
            })
        });
    });
});
*/