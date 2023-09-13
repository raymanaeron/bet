const https = require('https');

module.exports = function (app) {

    app.get('/proentire', (req, res) => {
        const api_key = "86b17191d64318c100afd23799071269";
        const currentDateUTC = new Date();
        const futureDateUTC = new Date(currentDateUTC);
        futureDateUTC.setHours(currentDateUTC.getHours() + 72);
        
        var fromDateParam = '&commenceTimeFrom=' + currentDateUTC.toISOString().slice(0, -5) + 'Z';;
        var toDateParam = '&commenceTimeTo='+ futureDateUTC.toISOString().slice(0, -5) + 'Z';;
        var entiregameurl = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=' 
            + api_key 
            + '&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=draftkings,betmgm,williamhill_us,fanduel'
            + fromDateParam + toDateParam;

        https.get(entiregameurl, (httpresponse) => {
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

    app.get('/properiodical', (req, res) => {
        var api_key = "86b17191d64318c100afd23799071269";
        var gameid = req.query.gameid;
        var periodicalgameUrl ='https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/'+ gameid +'/odds?apiKey=' + api_key + '&oddsFormat=american&markets=spreads_q3,spreads_q1,spreads_h1,h2h_h1,h2h_q1,h2h_q3&regions=us&oddsFormat=american&bookmakers=draftkings,betmgm,williamhill_us,fanduel';
          
        https.get(periodicalgameUrl, (httpresponse) => {
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
