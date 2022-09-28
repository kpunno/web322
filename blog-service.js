const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject)=>{
        fs.readFile("./data/posts.json",'utf8',(err,data)=>{
            if(err){
                reject("Error occured reading from posts.json: " + err);
            }
            else {
                posts = JSON.parse(data);
                resolve();
            }
        });
    }).then(function() {
        return new Promise((resolve, reject)=>{
            fs.readFile("./data/categories.json", 'utf8',(err,data)=>{
                if(err){
                    reject("Error occured reading from categories.json: " + err);
                }
                else {
                    categories = JSON.parse(data);
                    resolve();
                }
            })
        })
    });
}

module.exports.getPosts = function() {
    return new Promise((resolve,reject)=>{
        if(posts.length) {
            resolve(posts);
        }
        else reject("No data exists in posts!");
    });
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject)=>{
        var publishedPosts = [];
        for (let i = 0; i < posts.length; i++){
            if (posts[i].published) {
                publishedPosts.push(posts[i]);
            }
        }
        if(publishedPosts.length) {
            resolve(publishedPosts);
        }
        else reject("No published posts exist!");
    })
}

module.exports.getCategories = function() {
    return new Promise((resolve,reject)=>{
        if(categories.length == 0) {
            reject("No categories exist!");
        }
        else {
            resolve(categories);
        }
    });
}