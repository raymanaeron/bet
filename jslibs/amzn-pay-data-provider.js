const fs = require('fs');
const uuidv4 = require('uuid/v4');
const amznClient = require('@amazonpay/amazon-pay-api-sdk-nodejs');
const mockDataProvider = require('./mock-data-provider');
const mysqlDataProvider = require('./mysql-data-provider');

// Retrieves buyer details from Amazon
function getBuyer(token, callback) {
    var config = getApiConfig();
    const client = new amznClient.WebStoreClient(config);
    const buyer = client.getBuyer(token).then((b) => {
        callback(b.data);
    });
};

// Gets login button signature
function getLoginButtonSignature(callback) {
    const config = getApiConfig();
    const client = new amznClient.AmazonPayClient(config);
    //const payload = `{"signInReturnUrl":"${process.env.AMZN_SANDBOX_SIGN_IN_URL}","storeId":"${process.env.AMZN_SANDBOX_STORE_ID}","signInScopes":["name", "email", "phoneNumber"]}`;
    
    // shippingAddress
    // billingAddress
    const payload = {
        "signInReturnUrl": process.env.AMZN_SANDBOX_SIGN_IN_URL,
        "storeId": process.env.AMZN_SANDBOX_STORE_ID,
        "signInScopes": ["name", "email", "phoneNumber", "billingAddress"]
    };
    
    const signature = client.generateButtonSignature(payload);
    callback({ 'payload': payload, 'signature': signature });
}

// Gets a checkout session details
function getCheckoutSession(checkoutSessionId, callback) {
    // get config
    var config = getApiConfig();

    // set id key
    const headers = getIdempotencyKey();
    const client = new amznClient.WebStoreClient(config);
    client.getCheckoutSession(checkoutSessionId, headers).then((b) => {
        callback(b.data);
    });
}

// Reads checkout session detail from a checkout session and settles the transaction
function completeCheckoutSession(checkoutSessionId, callback) {
    getCheckoutSession(checkoutSessionId, (cb) => {
        if (cb != null) {
            var checkoutState = cb.statusDetails.state;
            if (checkoutState != null && checkoutState.toUpperCase() == "OPEN") {
                var amount = cb.paymentDetails.chargeAmount.amount;
                var currency = cb.paymentDetails.chargeAmount.currencyCode;
                var buyerId = cb.buyer.buyerId;
                var constraintCount = cb.constraints.length;

                // console.log(`In complete checkout----> amount: ${amount}, currency: ${currency}, buyerId: ${buyerId}, checkoutState: ${checkoutState}, constraintCount: ${constraintCount}`);

                const payload = `{"chargeAmount":{"amount":"${amount}","currencyCode":"${currency}"},"totalOrderAmount":{"amount":"${amount}","currencyCode":"${currency}"}}`;
                var config = getApiConfig();
                const headers = getIdempotencyKey();
                const client = new amznClient.WebStoreClient(config);
                client.completeCheckoutSession(checkoutSessionId, payload).then((b) => {

                    var checkoutCompleteState = b.data.statusDetails.state;
                    var chargePermissionId = b.data.chargePermissionId;
                    var chargeId = b.data.chargeId;
                    var constraints = b.data.constraints;

                    var trn_data = {
                        'transactionType': 'Payment',
                        'transactionDate': new Date(),
                        'processor': 'AMAZON',
                        'transactionState': checkoutCompleteState,
                        'description': 'Payment through amazon',
                        'chargeId': chargeId,
                        'chargePermissionId': chargePermissionId,
                        'currencyCode': currency,
                        'debit': 0.00,
                        'credit': amount
                    };

                    mysqlDataProvider.createUserTransaction(trn_data, buyerId, (sql_result) => {
                        // console.log(sql_result);
                    });

                    callback(b.data);
                });
            } else {
                callback({ 'state': checkoutState, 'message': cb.statusDetails.reasonDescription })
            }
        } else {
            callback({ 'status': 'Error: checkout session not found' });
        }
    });
}

// Gets a button signature based on a given product Id
function getStoreButtonSignature(productId, callback) {
    if (productId == null) {
        throw new Error("Product Id not set");
    }

    var p = mockDataProvider.getProducts().find(product => product.id == productId);
    if (p == null) {
        throw new Error("Server rejected the product id.");
    }

    var price = p.price;
    var currency = p.currency;
    var productName = p.name;

    const config = getApiConfig();
    const headers = getIdempotencyKey();

    const payload = `{"webCheckoutDetails":{"checkoutReviewReturnUrl":"${process.env.AMZN_SANDBOX_CHECKOUT_REVIEW_URL}","checkoutResultReturnUrl":"${process.env.AMZN_SANDBOX_CHECKOUT_RESULT_URL}","checkoutCancelUrl":"${process.env.AMZN_SANDBOX_CHECKOUT_CANCEL_URL}"},"storeId":"${process.env.AMZN_SANDBOX_STORE_ID}","chargePermissionType":"OneTime","scopes":["name","email","phoneNumber","billingAddress"],"paymentDetails":{"paymentIntent":"AuthorizeWithCapture","presentmentCurrency":"${currency}","chargeAmount":{"amount":"${price}","currencyCode":"${currency}"},"totalOrderAmount":{"amount":"${price}","currencyCode":"${currency}"}},"merchantMetadata":{"merchantReferenceId":"${productName}","merchantStoreName":"proxytel","noteToBuyer":"Thanks for your purchase"},"providerMetadata":{}}`;
    const client = new amznClient.WebStoreClient(config);
    var signature = client.generateButtonSignature(payload, headers);
    callback({ 'payload': payload, 'signature': signature });
}

// Builds Amazon Pay API Config
function getApiConfig() {
    return {
        publicKeyId: process.env.AMZN_SANDBOX_PUBLIC_KEY,
        privateKey: fs.readFileSync(process.cwd() + process.env.AMZN_SANDBOX_PRIVATE_KEY_LOC),
        region: 'us'
    };
}

// Gets a header with a key
function getIdempotencyKey() {
    const id_key = uuidv4().toString().replace(/-/g, '');
    const header = { 'x-amz-pay-idempotency-key': id_key };
    return header;
}

// Export the functions
module.exports = {
    getBuyer,
    getLoginButtonSignature,
    getStoreButtonSignature,
    getCheckoutSession,
    completeCheckoutSession
}

/* SAMPLE RESPONSE OBJECTS */

/* Buyer Details 
    {
        buyerId: 'amzn1.account.AHFO4BVNSSGPNBN2JFSQ6KCLECDA',
        name: 'proxyteluser1',
        email: 'proxyteluser1@proxytel.net',
        postalCode: '60602',
        countryCode: 'US',
        phoneNumber: '4259415758',
        shippingAddress: {
            name: 'Susie Smith',
            addressLine1: '10 Ditka Ave',
            addressLine2: 'Suite 2500',
            addressLine3: null,
            city: 'Chicago',
            county: null,
            district: null,
            stateOrRegion: 'IL',
            postalCode: '60602',
            countryCode: 'US',
            phoneNumber: '800-000-0000'
        },
        billingAddress: null,
        primeMembershipTypes: null
    }
*/

/* Checkout Session Details 
    {
        "response": {
            "checkoutSessionId": "4d7aa444-7c22-4fa0-89c7-4cc6b3ca53ce",
            "webCheckoutDetails": {
            "checkoutReviewReturnUrl": "https://proxytel.ngrok.io/payreview",
            "checkoutResultReturnUrl": null,
            "amazonPayRedirectUrl": null,
            "checkoutCancelUrl": null
            },
            "productType": "PayOnly",
            "paymentDetails": {
            "paymentIntent": "AuthorizeWithCapture",
            "canHandlePendingAuthorization": false,
            "chargeAmount": {
                "amount": "15.00",
                "currencyCode": "USD"
            },
            "totalOrderAmount": null,
            "softDescriptor": null,
            "presentmentCurrency": null,
            "allowOvercharge": null,
            "extendExpiration": null
            },
            "chargePermissionType": "Recurring",
            "recurringMetadata": {
            "frequency": {
                "unit": "Month",
                "value": "1"
            },
            "amount": {
                "amount": "15.00",
                "currencyCode": "USD"
            }
            },
            "merchantMetadata": {
            "merchantReferenceId": null,
            "merchantStoreName": null,
            "noteToBuyer": null,
            "customInformation": null
            },
            "supplementaryData": null,
            "buyer": {
                "name": "proxyteluser1",
                "email": "proxyteluser1@proxytel.net",
                "buyerId": "amzn1.account.AHFO4BVNSSGPNBN2JFSQ6KCLECDA",
                "primeMembershipTypes": null,
                "phoneNumber": "4259415758"
            },
            "billingAddress": null,
            "paymentPreferences": [
            {
                "paymentDescriptor": "Visa ****1111 (Amazon Pay)"
            }
            ],
            "statusDetails": {
                "state": "Open",
                "reasonCode": null,
                "reasonDescription": null,
                "lastUpdatedTimestamp": "20220306T074611Z"
            },
            "shippingAddress": null,
            "platformId": null,
            "chargePermissionId": null,
            "chargeId": null,
            "constraints": [
            {
                "constraintId": "CheckoutResultReturnUrlNotSet",
                "description": "checkoutResultReturnUrl is not set."
            }
            ],
            "creationTimestamp": "20220306T074608Z",
            "expirationTimestamp": "20220307T074608Z",
            "storeId": "amzn1.application-oa2-client.1163ac3f042d473a8c6b9f9941d0ff0f",
            "providerMetadata": {
            "providerReferenceId": null
            },
            "releaseEnvironment": "Sandbox",
            "deliverySpecifications": null
        }
    }
*/

/* Complete Checkout Response 
    {
        "checkoutSessionId": "ac47657f-e1eb-4512-8723-c7c5db9241c5",
        "webCheckoutDetails": null,
        "productType": null,
        "paymentDetails": null,
        "chargePermissionType": null,
        "recurringMetadata": null,
        "merchantMetadata": null,
        "supplementaryData": null,
        "buyer": null,
        "billingAddress": null,
        "paymentPreferences": null,
        "statusDetails": {
            "state": "Completed",
            "reasonCode": null,
            "reasonDescription": null,
            "lastUpdatedTimestamp": "20220306T091425Z"
        },
        "shippingAddress": null,
        "platformId": null,
        "chargePermissionId": "C01-2612863-4691163",
        "chargeId": "S01-5454037-1929856-C015396",
        "constraints": null,
        "creationTimestamp": "20220306T085901Z",
        "expirationTimestamp": null,
        "storeId": null,
        "providerMetadata": null,
        "releaseEnvironment": null,
        "deliverySpecifications": null
    }
*/

/* UPDATE CHECKOUT Payload
    {
    "chargePermissionType": "OneTime",
    "webCheckoutDetails": {
        "checkoutReviewReturnUrl": "http://localhost:4200/checkout",
        "checkoutResultReturnUrl": "http://localhost:4200/finalizecheckout"
    },
    "paymentDetails": {
        "chargeAmount": {
            "amount": "15",
            "currencyCode": "USD"
        },
        "totalOrderAmount": {
            "amount": "15",
            "currencyCode": "USD"
        },
        "paymentIntent": "AuthorizeWithCapture",
        "presentmentCurrency": ""
    },
    "merchantMetadata": {
        "merchantReferenceId": "proxytel15",
        "merchantStoreName": "proxytel",
        "noteToBuyer": "Thanks for your purchase"
    }
    }
*/

/* CONFIRM CHARGE - LAST STEP - MUST BE ON THE SERVER
    {
    "chargeAmount": {
        "amount": "15",
        "currencyCode": "USD"
    },
    "totalOrderAmount": {
        "amount": "15",
        "currencyCode": "USD"
    }
    }
*/