/**
 * Created by Jibin_ism on 31-Dec-15.
 */

var fs = require('fs');

var sendFile = function (res, file, options) {
    fs.readFile(file, function (err, html) {
        if (err) {
            throw err;
        } else {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length});
            res.write(html);
            res.end();
        }
    });
};

var loginForm = function (req, res) {
    sendFile(res, './public/authen/login.html');
};

var signupForm = function (req, res) {
    sendFile(res, './public/authen/signup.html');
};

var sendUserFeed = function (req, res) {
    sendFile(res, './public/remedyFeed.html');
};

var sendNewRemedyForm = function (req, res) {
    sendFile(res, './public/myRemedies.html')
};


exports.sendLoginForm = loginForm;
exports.sendSignUpForm = signupForm;
exports.sendUserFeed = sendUserFeed;
exports.sendNewRemedyForm = sendNewRemedyForm;