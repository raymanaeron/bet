const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Webma$ter1',
    server: 'localhost', 
    database: 'BetApp',
    options: {
        encrypt: true,
        trustServerCertificate: true  // Use this only if you're sure about your server's certificate
    }
};


async function getGameData(callback) {
    try {
        let connection = await sql.connect(config);
        let result = await connection.request().execute('GetGameData');
        
        callback(result.recordset[0].data);
        
    } catch (err) {
        console.error('SQL error', err);
    }
}

module.exports = {
    getGameData
}