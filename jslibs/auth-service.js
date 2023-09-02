const { encrypt, decrypt } = require('./crypto-provider');
const amznPayDataProvider = require('./amzn-pay-data-provider');
const jwtProvider = require('./jwt-provider');
const mysqlDataProvider = require('./mysql-data-provider');
var middlewareFunctionProvider = require('./middleware-function-provider');

module.exports = function (app) {

    /*
        The purpose of JWT is not to encrypt rather verify signature 
        We do not use JWT because the token can be read by anyone
        JWT Token : https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
    */

    /* Is user logged in
    ----------------------------------------------------------------------------------------------------------
    Workflow
        1. Check if we have an http cookie, if so the user is authenticated
    ----------------------------------------------------------------------------------------------------------
    */
    app.get('/auth/loggedin', middlewareFunctionProvider.checkToken, (req, res) => {
        var authenticated = false;
        if (req.user != null) {
            authenticated = true;
        }
        res.status(200).send({ 'authenticated': authenticated });
    });

    /* Sets sign in cookies
    ----------------------------------------------------------------------------------------------------------
    Workflow
        1. User signs in with Amazon
        2. We call this API with the Amazon Token
        3. We retrieve the buyer info from Amazon with the token
        4. We retrieve the user profile from our database using the Amazon user Id (for us its the AltUserId)
        5. Set http cookies on the response object [token, amznuser, userprofile]
        ----------------------------------------------------------------------------------------------------------
    */
    app.get('/auth/signin', (req, res) => {
        var buyertoken = req.query.token;
        amznPayDataProvider.getBuyer(buyertoken, (buyer) => {
            mysqlDataProvider.getUserByAlternateId(buyer.buyerId, (profile) => {
                // var jwtToken = jwtProvider.generateJwt(profile);
                // If we have a user in the DB
                if (profile != null && profile.UserId != null) {
                    var token = encrypt(JSON.stringify(profile));
                    res.cookie('accesstoken', token, {
                        maxAge: 1000 * 60 * 60,
                        httpOnly: true
                    });
                    res.send({ 'status': 'signed in', token });
                } else {
                    // we need to automatically create a user profile now
                    var user_data = {
                        name: buyer.name,
                        email: buyer.email,
                        primary_phone: buyer.phoneNumber,
                        primary_phone_validated: false,
                        provider: 'AMAZON'
                    };

                    mysqlDataProvider.createOrUpdateUserProfile(user_data, buyer.buyerId, (cb_user_profile) => {
                        // cb_user_profile gives us only primary key so that cannot be a token
                        var profile = cb_user_profile[0][0];
                        //console.log(profile);
                        var token = encrypt(JSON.stringify(profile));
                        res.cookie('accesstoken', token, {
                            maxAge: 1000 * 60 * 60,
                            httpOnly: true
                        });
                        res.send({ 'status': 'signed in', token });
                    });
                }
            });
        });
    });

    /* Clears cookies and signs out a user
    ----------------------------------------------------------------------------------------------------------
    Workflow
        1. User signs out with Amazon
        2. We call this API [No parameter passed]
        3. We clear the http cookies
    ----------------------------------------------------------------------------------------------------------
    */
    app.get('/auth/signout', (req, res) => {
        res.cookie('accesstoken', '', {
            maxAge: -1,
            httpOnly: true
        });
        res.status(200).send({ 'status': 'signed out' });
    });

    // Encrypts a text
    app.get('/auth/encrypt', (req, res) => {
        var text = req.query.text;
        res.status(200).send(encrypt(text));
    });

    // Decrypts a has
    app.get('/auth/decrypt', (req, res) => {
        var iv = req.query.iv;
        var content = req.query.content;
        var hash = {
            'iv': iv,
            'content': content
        };
        res.status(200).send(decrypt(hash));
    });
}