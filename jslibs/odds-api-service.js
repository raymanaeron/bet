const https = require('https');

module.exports = function (app) {

    app.get('/profootball', (req, res) => {
        var api_key = "b43e9b75b99d382d7bf597fdd245033e";
        var url = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=b43e9b75b99d382d7bf597fdd245033e&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=draftkings,betmgm,williamhill_us,fanduel';
        https.get(url, (httpresponse) => {
            let data = '';

            // A chunk of data has been received.
            httpresponse.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. 
            httpresponse.on('end', () => {
                var result = JSON.parse(data);
                res.status(200).send({ 'data': result });
            });
        }).on("error", (err) => {
            res.status(200).send({ 'data': err.message });
        })
    })

}
