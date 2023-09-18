const sqlprovider = require('./sql-data-provider');

module.exports = function (app) {

    app.get('/gamedata', (req, res) => {
        sqlprovider.getGameData((cb) => {
            res.status(200).send(cb);
        });
    });

    app.post('/entiregamedata', (req, res) => {
        const json = req.body.data;
        sqlprovider.postEntireGameData(json, (cb) => {
            res.status(200).send(cb);
        });
    });

    app.post('/periodicalgamedata', (req, res) => {
        const json = req.body.data;
        sqlprovider.postPeriodicalGameData(json, (cb) => {
            res.status(200).send(cb);
        });
    });
}
