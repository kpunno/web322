// AUTHORIZATION MODULE //

const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username : {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection('mongodb+srv://kristjan:kristjanpunno@senecaweb.llnhc4s.mongodb.net/web322?retryWrites=true&w=majority');

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match.");
        }
    })
}

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find({
            username: userData.username
        })
        .exec()
        .then((users) => {
            if (!users.length) {
                console.log('no user found');
            }
            else {
                bcrypt.compare(userData.password, users[0].password)
                .then((match) => {
                    if (match) {
                        users[0].loginHistory.push({
                            dateTime : (new Date()).toString(), 
                            userAgent : userData.loginHistory.userAgent
                        })
                        User.updateOne({username: users[0].username}, {
                            $set: {loginHistory : users[0].loginHistory}
                        })
                        .exec()
                        .then(() => {
                            resolve(users[0]);
                        }).catch((err) => {
                            reject("CheckUser(): Failed at updating the new user data!");
                        })
                    }
                    else {
                        reject('Incorrect password');
                    }
                })
            }
        }).catch((err) => {

        })
    })
}