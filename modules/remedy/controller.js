/**
 * Created by Jibin_ism on 26-Nov-15.
 */
'use strict';

var RemedyOperations = require('./operations');
var UserOperations = requireFromModule('users/operations');
var CommentOperations = requireFromModule('comments/operations');
var Comment = requireFromModule('comments/commentModel');
var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');

var insert = function (user, remedy, callback) {
    RemedyOperations.insert(user, remedy, function (result) {
        if (result.success) {
            UserOperations.Remedy.linkRemedy(user, result.remedy, function (success) {
                if (!success) {
                    RemedyOperations.removeRemedy(remedy._id);
                    callback(errorJSON(501, "Error Linking remedy to user"));
                } else {
                    callback(successJSON(result.remedy));
                }
            });
        } else {
            callback(errorJSON(501, result.err));
        }
    });
};

var getRemedy = function (user, remedy_id, callback) {
    RemedyOperations.getRemedy(user, remedy_id, function (result) {
        callback(result);
    });
};

var update = function (user_id, remedy, callback) {
    RemedyOperations.getRemedy(user_id, remedy._id, function (result) {
        if (result.success && result.data.author._id.equals(user_id)) {
            RemedyOperations.update(remedy, function (result) {
                callback(result);
            });
        } else {
            callback(errorJSON(603, "NOT_ALLOWED", "YOUR_ARE_NOT_THE_AUTHOR"));
        }
    });
};

var del = function (user, remedy_id, callback) {
    RemedyOperations.getRemedy(user, remedy_id, function (result) {
        if (result.success) {
            var remedy = result.data;
            var user = remedy.author._id;
            RemedyOperations.deactivateRemedy(remedy_id);
            UserOperations.Remedy.unlinkRemedy(user, remedy._id, function (success) {
                if (success) {
                    callback(successJSON({deleted: true}));
                } else {
                    callback({success: true, data: errorJSON(501, "GENERAL_ERROR", "ERROR_UNLINKING")});
                }
            });
        } else {
            callback(result);
        }
    }, true);
};

var upvote = function (user_id, remedy_id, callback) {
    RemedyOperations.upvote(user_id, remedy_id);
    UserOperations.Remedy.upvoteRemedy(user_id, remedy_id);
    callback(successJSON({upvoted: true}));
};

var downvote = function (user_id, remedy_id, callback) {
    RemedyOperations.downvote(user_id, remedy_id);
    UserOperations.Remedy.downvoteRemedy(user_id, remedy_id);
    callback(successJSON({downvoted: true}));
};

var insertComment = function (user_id, remedy_id, comment, callback) {
    user_id = mongoose.Types.ObjectId(user_id);
    remedy_id = mongoose.Types.ObjectId(remedy_id);
    CommentOperations.insert(comment, user_id, remedy_id, function (result) {
        if (result.success) {
            var finalComment = result.data;
            RemedyOperations.insertComment(finalComment._id, remedy_id, function (result) {
                if (result.success) {
                    UserOperations.Operations.addComment(user_id, finalComment._id, function (result) {
                        if (result.success) {
                            Comment.populate(finalComment,{
                                path: "author",
                                model: "User",
                                select: "name"
                            }, function(err, doc){
                                callback(successJSON(doc));
                            });
                        } else {
                            callback(result);
                        }
                    })
                } else {
                    callback(result);
                }
            });
        } else {
            callback(errorJSON(501, "GENERAL_ERROR", "ERROR_INSERTING_COMMENT"));
        }
    });
    //Insert Comment
    //Add in comment module
    //Link comment to user
};

var findRemedyByDisease = function (disease, page, callback) {
    RemedyOperations.findRemedyByDisease(disease, page, function (result) {
        callback(result);
    });
};

var search = function (query, page, callback) {
    RemedyOperations.search(query, page, function (result) {
        callback(result);
    });
};

var getAllRemedies = function (user, page, callback) {
    RemedyOperations.getAllRemedies(user, page, function (result) {
        callback(result);
    });
};

var registerView = function (_id) {
    RemedyOperations.registerView(_id);
};

var importFromJSON = function (user, file, callback) {
    fs.readFile(file.path, function (err, content) {
        if (err) {
            callback(errorJSON(501, "GENERAL_ERROR", err));
        } else {
            //content=(content.toString()).replace(/\\/g,"\\\\");
            content = JSON.parse(content);
            RemedyOperations.importFromJSON(user, content.data, function (result) {
                callback(result);
            });
        }
    });
};

var getCommentList = function (remedy_id, callback) {
    RemedyOperations.getCommentList(remedy_id, function (result) {
        callback(result);
    })
    ;
};

var bookmarkRemedy = function(user_id, remedy_id, callback){
  var remedyBookmark = function(callback) {
      RemedyOperations.bookmarkRemedy(user_id, remedy_id, callback);
  };
    var userBookmark = function(callback){
        UserOperations.Remedy.bookmarkRemedy(user_id, remedy_id, callback);
    };

    async.parallel([remedyBookmark, userBookmark], function(errs, results){
       if(results[0] || results[1]){
           callback(true);
       }else if(errs[0] || errs[1]){
           callback(false)
       }else{
           callback(true);
       }
    });
};

exports.insert = insert;
exports.update = update;
exports.delete = del;
exports.upvote = upvote;
exports.downvote = downvote;
exports.insertComment = insertComment;
exports.getRemedy = getRemedy;
exports.searchRemedy = search;
exports.findRemedyByDisease = findRemedyByDisease;
exports.getAllRemedies = getAllRemedies;
exports.registerView = registerView;
exports.importFromJSON = importFromJSON;
exports.getCommentList = getCommentList;
exports.bookmarkRemedy= bookmarkRemedy;