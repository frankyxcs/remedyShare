/*
    Author : Akas Antony
    Date : 14/05/2015
*/

'use strict';
var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    db: {
        uri: 'mongodb://localhost/remedyShare',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        }
    },
    server: {
        port: 3000
    },
    keys: {
		token: 'jazziness'
    },
	image: {
		cdnURL: 'https://upload.uploadcare.com/base/',
		imageBaseURL: 'https://ucarecdn.com/'
	},
    mailserver:{
        service: "Gmail",
        email: "jazzy.architects@gmail.com",
        password: "jazzy@architects",
        sender: "jazzyarchitects@gmail.com"
    }
};
