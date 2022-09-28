const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject)=>{
        fs.readFile("./data/posts.json",'utf8',(err,data)=>{
            if(err){
                reject(err);
            }
            else {
                movies = JSON.parse(data);
                resolve();
            }
        });
    });
}