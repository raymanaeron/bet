const fs = require('fs');
const jsonstorepath = "/json-data/";

module.exports = function (app) {
    app.get('/jsonstore', (req, res) => {
        createFolderIfNotExist();
        const fileName = jsonstorepath + req.query.filename;
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send({'data': err.message});
            }
            res.status(200).send({'data': data});
        })
    })

    app.post('/jsonstore', (req, res) => {
        createFolderIfNotExist();
        const fileName = jsonstorepath + req.query.filename;
        const content = req.body.data;

        fs.writeFile(fileName, content, 'utf8', (err)=>{
            if (err) {
                res.status(500).send({'data': err.message});
            } else {
                res.status(200).send({'data': 'File written : ' + fileName});
            }
        })
    })

    function createFolderIfNotExist(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdir(folderPath, (err) => {
                if (err) throw err;
            })
        }
    }
}