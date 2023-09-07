const fs = require('fs');
const os = require('os');
const path = require('path');

const jsonstorepath = "/json-data/";

module.exports = function (app) {
    app.get('/jsonstore', (req, res) => {
        createFolderIfNotExist(getTempFolderPath());
        const fileName = getTempFolderPath() + req.query.filename;
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send({ 'data': err.message });
            } else {
                res.status(200).send({ 'data': data });
            }
        })
    })

    app.post('/jsonstore', (req, res) => {
        createFolderIfNotExist(getTempFolderPath());
        const fileName = getTempFolderPath() + req.query.filename;
        const content = req.body.content.data;

        fs.writeFile(fileName, JSON.stringify(content), 'utf8', (err) => {
            if (err) {
                res.status(500).send({ 'data': err.message });
            } else {
                res.status(200).send({ 'data': 'File written : ' + fileName });
            }
        })
    })

    function getTempFolderPath() {
        const tempDir = os.tmpdir();
        return tempDir + jsonstorepath;
    }

    function createFolderIfNotExist(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdir(folderPath, { recursive: true }), (err) => {
                if (err) {
                    console.log(err);
                }
            }
        }
    }
}