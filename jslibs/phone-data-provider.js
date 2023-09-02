const twilio = require('twilio');
const mockDataProvider = require('./mock-data-provider');
const mySqlDataProvider = require('./mysql-data-provider');

function isPhoneValid(number) {
    return /^[\d\+\-\(\) ]+$/.test(number);
}

function getPricing(country, callback) {
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    var results = [];
    var prc = client.pricing.v1.phoneNumbers.countries(country)
        .fetch()
        .then(country => {
            results.push(country);
        });
    Promise.all([prc]).then(function () {
        callback(results);
    }).catch(function (err) {
        console.error(err);
    });
}

function getAvailableNumbers(country, region, areacode, pattern, callback) {
    var limit = 50;
    var phones = [];

    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // DONT DELETE
    // .local
    // .tollFree
    // .mobile
    var localNumbers = client.availablePhoneNumbers(country)
        .local
        .list({ areaCode: areacode, inRegion: region, limit: limit, contains: pattern })
        .then(lcl => {
            lcl.forEach(l => phones.push(l))
        });

    Promise.all([localNumbers]).then(function () {
        callback(phones);
    }).catch(function (err) {
        //console.error(err);
        callback({ 'error': err });
    });
};

// Deletes a virtual phone number from Twilio
function deletePhoneNumberFromProvider(phoneNumberToDelete, callback) {
    mySqlDataProvider.getProviderIdentifier(phoneNumberToDelete, (cb) => {
        if (cb != null) {
            var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            var data = cb[0][0];

            if (data != null) {
                client.incomingPhoneNumbers(data.ProviderIdentifier).remove().then(result => {
                    callback(result);
                });
            } else {
                callback({ 'error': 'could not find: ' + phoneNumberToDelete })
            }
        }
    });
}

function buyVirtualPhoneNumber(phoneNumberToPurchase, callback) {
    var results = [];

    // Test only
    // Disable in production
    // var mock_result = mockDataProvider.getMockPhonePurchaseResult();
    // results.push(mock_result);
    // callback(results[0]);

    // Enable in production
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    var new_number = client.incomingPhoneNumbers
        .create({
            phoneNumber: phoneNumberToPurchase,
            smsMethod: process.env.TWILIO_SMS_HTTP_METHOD,
            smsUrl: process.env.TWILIO_SMS_URL,
            voiceMethod: process.env.TWILIO_VOICE_HTTP_METHOD,
            voiceUrl: process.env.TWILIO_VOICE_URL
        })
        .then(virtual_number => {
            results.push(virtual_number);
        });

    Promise.all([new_number]).then(function () {
        callback(results[0]);
    }).catch(function (err) {
        throw err;
    });
}

function getPhoneNumberDetailsFromProvider(phoneNumber, callback) {
    // retrieve the phone number
    var results = [];
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.incomingPhoneNumbers
        .list({ phoneNumber: phoneNumber, limit: 20 })
        .then(incomingPhoneNumbers => {
            incomingPhoneNumbers.forEach(p => results.push(p));
            callback(results);
        });
}

function updatePhoneNumberDetailsAtProvider(phoneSid, callback) {
    var results = [];
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.incomingPhoneNumbers(phoneSid)
        .update(
            {
                smsMethod: process.env.TWILIO_SMS_HTTP_METHOD,
                smsUrl: process.env.TWILIO_SMS_URL,
                voiceMethod: process.env.TWILIO_VOICE_HTTP_METHOD,
                voiceUrl: process.env.TWILIO_VOICE_URL
            })
        .then(update_result => {
            results.push(update_result);
            callback(results);
        });
}

module.exports = {
    isPhoneValid,
    getPricing,
    getAvailableNumbers,
    buyVirtualPhoneNumber,
    deletePhoneNumberFromProvider,
    getPhoneNumberDetailsFromProvider,
    updatePhoneNumberDetailsAtProvider
}

/* Buy Phone Result from Twilio
{
    accountSid: 'AC8b7d8505dac7d9ad3533747bc817dcbd',
    addressSid: null,
    addressRequirements: 'none',
    apiVersion: '2010-04-01',
    beta: false,
    capabilities: { voice: true, sms: true, mms: true, fax: true },
    dateCreated: 2022-03-02T03:45:44.000Z,
    dateUpdated: 2022-03-02T03:45:44.000Z,
    friendlyName: '(360) 323-6868',
    identitySid: null,
    phoneNumber: '+13603236868',
    origin: 'twilio',
    sid: 'PN19fe900934218ff289072da5b65f0907',
    smsApplicationSid: '',
    smsFallbackMethod: 'POST',
    smsFallbackUrl: '',
    smsMethod: 'POST',
    smsUrl: 'https://aeronlab.ngrok.io/message',
    statusCallback: '',
    statusCallbackMethod: 'POST',
    trunkSid: null,
    uri: '/2010-04-01/Accounts/AC8b7d8505dac7d9ad3533747bc817dcbd/IncomingPhoneNumbers/PN19fe900934218ff289072da5b65f0907.json',
    voiceReceiveMode: 'voice',
    voiceApplicationSid: null,
    voiceCallerIdLookup: false,
    voiceFallbackMethod: 'POST',
    voiceFallbackUrl: null,
    voiceMethod: 'POST',
    voiceUrl: 'https://aeronlab.ngrok.io/voice',
    emergencyStatus: 'Active',
    emergencyAddressSid: null,
    emergencyAddressStatus: 'unregistered',
    bundleSid: null,
    status: 'in-use'
}
*/