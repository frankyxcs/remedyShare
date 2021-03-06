/**
 * Created by Jibin_ism on 26-Nov-15.
 */

'use strict';

var mongoose = require('mongoose');
var User = requireFromModule('users/userModel');
var PAGE_LIMIT = 5;




var getUserData = function (user_id, callback) {
    if(!mongoose.Types.ObjectId.isValid(user_id)){
        try {
            user_id = mongoose.Types.ObjectId(user_id);
        }catch (e){
            errorJSON(602, "Mongo error - invalid objectId: /user/operations/operations/getUserData", e);
        }
    }
    User.findOne({_id: user_id}, function (err, doc) {
        //console.log("UserOperations: "+JSON.stringify(doc)+ " \nfor user:"+user_id);
        if (err) {
            callback(errorJSON(601, "MONGO_ERROR", err));
        } else {
            callback(successJSON(doc==null?{}:doc));
        }
    });
};

var getUserProfile = function(user_id, callback){
  User.findOne({_id: user_id})
      .populate([{
          path: "remedies",
          select: "title description stats"
      },{
          path: "bookmarks.remedies",
          select: "title description"
      }]).exec(function(err, doc){
          if(err){
              callback(errorJSON(601, "MONGO_ERROR_GETTING_USER_PROFILE", err));
          }else{
              callback(successJSON(doc==null?{}:doc));
          }
      })
};


var addComment = function (user_id, comment_id, callback) {
    User.update({
        _id: user_id,
        comments: {$ne: comment_id}
    }, {
        $inc: {"stats.comments": 1},
        $push: {comments: comment_id}
    }, function (err, doc) {
        if (err) {
            callback(errorJSON(err));
        } else {
            callback(successJSON(doc==null?{}:doc));
        }
    });
};

var deleteComment = function (user_id, comment_id, callback) {
    User.update({
        _id: user_id,
        comments: comment_id
    }, {
        $inc: {"stats.comments": -1, "stats.deleted.comments": 1},
        $pull: {comments: comment_id},
        $push: {"deleted.comments": comment_id}
    }, function (err, doc) {
        if (doc) {
            callback(true);
        } else {
            callback(false);
        }
    })
};

var linkProfilePicture = function (user, file, callback) {
    User.update({
        _id: user
    }, {
        $set: {
            "image.filename": file.filename,
            "image.path": file.path
        }
    }, {
        safe: true,
        upsert: false
    }, function (err, doc) {
        if (doc) {
            User.findOne({_id: user}).select("_id email image").exec(function (err, doc) {
                if (doc) {
                    callback(successJSON(doc));
                } else {
                    callback(errorJSON(501, "GENERAL_ERROR", err));
                }
            });
        } else {
            callback(errorJSON(501, "GENERAL_ERROR", err));
        }
    });
};



exports.getUserData = getUserData;
exports.addComment = addComment;
exports.deleteComment = deleteComment;
exports.linkProfilePicture = linkProfilePicture;
exports.getUserProfile = getUserProfile;