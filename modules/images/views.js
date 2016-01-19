/**
 * Created by Jibin_ism on 08-Jan-16.
 */


var fs = require('fs');


var sendPicture = function (uploadDirectory, filename, res) {
    //console.log("Sending image: "+filename);
    fs.readFile("./uploads/images/" + uploadDirectory + "/" + filename, function (err, file) {
        if (err) {
            fs.readFile("./public/images/stethoscope.jpg", function (err, file) {
                if (err) {
                    res.end();
                } else {
                    res.writeHead(200, {'Content-Type': 'image/png', 'Content-Length': file.length});
                    res.write(file);
                    res.end();
                }
            });
        } else {
            //console.log("Got image file: "+file.length);
            //console.log("File: "+file);
            res.writeHead(200, {'Content-Type': 'image/png', 'Content-Length': file.length});
            res.write(file);
            res.end();
        }
    });
};

var sendUserPic = function (req, res) {
    sendPicture('users', req.params.filename, res);
};

var sendRemedyPic = function (req, res) {
    sendPicture('remedy', req.params.filename, res);
};

exports.sendUserPic = sendUserPic;
exports.sendRemedyPic = sendRemedyPic;



