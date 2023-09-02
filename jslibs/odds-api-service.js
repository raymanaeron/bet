const https = require('https');

module.exports = function (app) {
    
    app.get('/profootball', (req, res) => {
        var url = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=01a3ecc0d81e878c777dd52c7d518540&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=draftkings,betmgm,williamhill_us,fanduel';
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
        }).on("error", (err)=>{
            res.status(200).send({ 'data': err.message });
        })
    })

}
