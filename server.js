require('dotenv').config();

const express = require('express');
const bodyParser = require("body-parser");
const port = 3080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// prod-only
app.use(express.static(process.cwd() + "/app-ux/dist/app-ux/"));
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/app-ux/dist/app-ux/index.html");
});

// Import other services
require('./jslibs/auth-service')(app);
require('./jslibs/helper-service')(app);
require('./jslibs/data-service')(app);
require('./jslibs/sms-verification-service')(app);
require('./jslibs/phone-service')(app);
require('./jslibs/proxy-service')(app);
require('./jslibs/admin-tasks')(app);

// for direct routing fix
app.use('*', (req, res, next) => {
    //res.sendFile(path.join(__dirname, "/app-ux/dist/app-ux/index.html"));
    res.sendFile(process.cwd() + "/app-ux/dist/app-ux/index.html");
    //res.sendFile("/app-ux/dist/app-ux/index.html");
});


// These middlewares must be just before the app.listen after declaring all routes
// This is for 404 handling
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// error handler middleware
app.use((error, req, res, next) => {
    console.log("Catch error");
    console.log(error);
    if (error.status == 400) {

    } else {
        res.status(error.status || 500).send({
            error: {
                status: error.status || 500,
                message: error.message || 'Internal Server Error',
            },
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});