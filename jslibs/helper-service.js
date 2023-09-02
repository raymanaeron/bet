const uuidv4 = require('uuid/v4');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const crypto = require('crypto');
const jwtProvider = require('./jwt-provider');

module.exports = function (app) {

    /* Generates an Id Key */
    app.get('/idkey', (req, res) => {
        res.send(uuidv4().toString().replace(/-/g, ''));
    });

    /* Generates a secret key -- used as an env variable */
    app.get('/randomsecret',(req,res) => {
        var result = crypto.randomBytes(64).toString('hex');
        res.status(200).send({ 'secret': result });
    });

    // Gets a JWT
    app.get('/getjwt', (req, res) => {
        var payload = req.query.payload;
        var token = jwtProvider.generateJwt(payload);
        res.status(200).send({ 'token': token });
    });

    // Mimic error
    app.get('/err', (req, res) => {
        throw new Error('Error mimic');
    });
}