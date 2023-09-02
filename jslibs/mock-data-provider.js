function getProducts() {
    var products = [
        { 'id': 'P-15', 'name': '$15 recharge', 'price': 15, 'currency': 'USD' },
        { 'id': 'P-30', 'name': '$30 recharge', 'price': 30, 'currency': 'USD' },
        { 'id': 'P-45', 'name': '$45 recharge', 'price': 45, 'currency': 'USD' },
        { 'id': 'P-60', 'name': '$60 recharge', 'price': 60, 'currency': 'USD' },
        { 'id': 'P-75', 'name': '$75 recharge', 'price': 75, 'currency': 'USD' },
        { 'id': 'P-100', 'name': '$100 recharge', 'price': 100, 'currency': 'USD' },
    ];

    return products;
};

function getAvailableCountries() {
    var countries = [
        { 'countryCode': 'US', 'countryName': 'United States' },
        { 'countryCode': 'CA', 'countryName': 'Canada' },
    ];

    return countries;
}

function getMockPhonePurchaseResult() {
    return {
        accountSid: 'AC8b7d8505dac7d9ad3533747bc817dcbd',
        addressSid: null,
        addressRequirements: 'none',
        apiVersion: '2010-04-01',
        beta: false,
        capabilities: { voice: true, sms: true, mms: true, fax: true },
        dateCreated: '2022-03-02T03:45:44.000Z',
        dateUpdated: '2022-03-02T03:45:44.000Z',
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
    };
}

module.exports = { 
    getProducts, getAvailableCountries, getMockPhonePurchaseResult
 }