const sqlprovider = require('./sql-data-provider');

module.exports = function (app) {

    app.get('/gamedata', (req, res) => {
        sqlprovider.getGameData((cb) => {
            res.status(200).send(cb);
        });
    });

}
