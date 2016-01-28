/**
 * Created by Jibin_ism on 27-Jan-16.
 */

var mongoose = require('mongoose');
var User = requireFromModule('users/userModel');
var Hash = requireFromModule('clients/cryptoOperations');
var request = require('request');
var PAGE_LIMIT = 5;

var signUp = function (userDetails, callback) {
    User.findOne({$or: [{email: userDetails.email}, {mobile: userDetails.mobile}]}, function (err, doc) {
        if (doc) {
            callback(errorJSON(601, "INVALID_DATA_PASSED", "EMAIL_OR_MOBILE_REGISTERED"));
        } else {
            var user = new User(userDetails);
            Hash.hash(user, user.created_at.toString(), function (result) {
                if (result.success) {
                    user.password = result.hash;

                    user.save(function (err) {
                        if (err) {
                            callback(errorJSON(501, err));
                        } else {
                            callback(successJSON(user))
                        }
                    });
                } else {
                    callback(errorJSON(501, result.error));
                }
            });
        }
    });
};


/**
 * User SignUp Function
 * @param userDetails - json object containing all the fields
 * @param callback - callback function
 */

function __login(query, user, callback) {
    //console.log("__login: "+JSON.stringify(query)+" "+JSON.stringify(user));
    User.findOne(query, "+password", function (err, userDoc) {
        if (userDoc) {
            Hash.hash(user, userDoc.created_at.toString(), function (result) {
                //console.log("Hashing: "+JSON.stringify(result)+" \n"+userDoc.created_at.toString()+" \n"+userDoc.password);
                if (result.success) {
                    if (userDoc.password == result.hash) {
                        userDoc.password = undefined;
                        //console.log("Object: "+JSON.stringify(userDoc));
                        callback(successJSON(userDoc));
                    } else {
                        callback(errorJSON(602, "AUTHENTICATION_ERROR", "EMAIL/MOBILE AND PASSWORD COMBINATION IS INCORRECT"));
                    }
                } else {
                    callback(errorJSON(501, result.error))
                }
            });
        } else {
            callback(errorJSON(601, "INVALID_DATA_PASSED", "USER_NOT_REGISTERED"));
        }
    });
}

var loginWithEmail = function (user, callback) {
    //console.log("Login With Email...");
    __login({email: user.email}, user, callback)

};


var loginWithMobile = function (user, callback) {
    console.log("Login with mobile...");
    __login({mobile: user.mobile}, user, callback);
};


var update = function (user, callback) {
    delete user.password;
    if (user._id) {
        User.update({_id: user._id}, user, function (err, doc) {
            if (doc) {
                callback(successJSON(doc));
            } else {
                callback(errorJSON(501, err));
            }
        });
    } else {
        callback(errorJSON(602, "AUTHENTICATION_ERROR", "USER_NOT_LOGGED_IN"));
    }
};

var del = function (user, callback) {
    User.remove({_id: user._id}, function (err, doc) {
        if (doc) {
            callback(successJSON(doc));
        } else {
            callback(errorJSON(501, err));
        }
    });
};

function __login_google(accesstoken, callback) {
    //console.log("Logging in Google: " + accesstoken);
    var url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + accesstoken;
    request({
        url: url
    }, function (err, response, body) {
        if (err) {
            console.log("User crud operations: err" + JSON.stringify(err));
            callback(errorJSON(err, "GOOGLE_SIGNIN_ERROR", err));
        } else {
            body = JSON.parse(body);
            console.log("User crud operations: body:" + JSON.stringify(body));
            //console.log("Email of user: " + body.email);
            User.findOne({email: body.email}, function (err, doc) {
                if (doc) {
                    callback(successJSON(doc));
                } else {
                    callback(errorJSON(err));
                }
            });
        }
    });
}

function __login_fb(accesstoken, callback) {

}

var loginSocial = function (stream, accesstoken, callback) {
    if (stream === "google") {
        __login_google(accesstoken, callback);
    } else {
        __login_fb(accesstoken, callback);
    }
};

exports.signUp = signUp;
exports.loginWithEmail = loginWithEmail;
exports.loginWithMobile = loginWithMobile;
exports.updateUser = update;
exports.delete = del;
exports.loginSocial = loginSocial;