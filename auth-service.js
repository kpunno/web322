// AUTHORIZATION MODULE //

const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
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

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match.");
        }
        else {
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err) {
                        if (err.code == 11000) {reject("Username is already taken.")}
                        else {reject("Error creating the user: " + err)}
                    }
                    else {
                        resolve();
                    }
                })
            }).catch((err) => {
                reject("Password encryption failed: " + err);
            })

        }
    })
}

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({
            username: userData.username
        })
            .exec()
            .then((users) => {
                if (!users.length) {
                    reject("Unable to find user: " + userData.username);
                }
                else {
                    bcrypt.compare(userData.password, users[0].password)
                        .then((match) => {
                            if (match) {
                                users[0].loginHistory.unshift({
                                    dateTime: (new Date()).toString(),
                                    userAgent: userData.userAgent
                                })
                                User.updateOne({ username: users[0].username }, {
                                    $set: { loginHistory: users[0].loginHistory }
                                })
                                    .exec()
                                    .then(() => {
                                        resolve(users[0]);
                                    }).catch((err) => {
                                        reject("CheckUser(): Failed at updating the new user data: " + err);
                                    })
                            }
                            else {
                                reject('Password is incorrect');
                            }
                        })
                }
            })
    })
}