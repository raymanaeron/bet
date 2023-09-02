const twilio = require('twilio');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const phoneDataProvider = require('./phone-data-provider');
const mockDataProvider = require('./mock-data-provider');
const mySqlDataProvider = require('./mysql-data-provider');

module.exports = function (app) {

    app.get('/pricing', (req, res) => {
        var country = req.query.country.toUpperCase();
        phoneDataProvider.getPricing(country, (cb) => {
            res.status(200).send(cb);
        });
    });

    // calls an external API to get available phone numbers
    app.get('/availablenumber', (req, res) => {
        var country = req.query.country.toUpperCase();
        var region = req.query.region;
        var areacode = req.query.areacode;
        var pattern = req.query.pattern;
        phoneDataProvider.getAvailableNumbers(country, region, areacode, pattern, (cb) => {
            res.status(200).send(cb);
        });
    });

    // Get a list of supported countries
    app.get('/country', (req, res) => {
        var countries = mockDataProvider.getAvailableCountries();
        res.status(200).send(countries);
    });

    // Deletes a phone from the provider
    app.get('/delphone', (req, res) => {
        var vp = req.query.p;
        var vphone = phoneUtil.parse(vp, "US");
        var virtual_number = phoneUtil.format(vphone, PNF.E164);

        phoneDataProvider.deletePhoneNumberFromProvider(virtual_number, (cb) => {
            res.status(200).send(cb);
        });
    });

    // get phone details from the provider
    app.get('/phone', (req, res) => {
        var vp = req.query.p;
        var vphone = phoneUtil.parse(vp, "US");
        var virtual_number = phoneUtil.format(vphone, PNF.E164);
        phoneDataProvider.getPhoneNumberDetailsFromProvider(virtual_number, (cb) => {
            if (cb != null && cb.length > 0) {
                res.status(200).send(cb[0]);
            } else {
                res.status(200).send({ 'status': `Phone number ${virtual_number} not found.` });
            }
        })
    });
}