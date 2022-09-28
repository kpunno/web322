const fs = require("fs");

var posts = [];
var publishedPosts = [];
var categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject)=>{
        fs.readFile("./data/posts.json",'utf8',(err,data)=>{
            if(err){
                reject(err);
            }
            else {
                console.log("all good 1");
                posts = JSON.parse(data);
                resolve();
            }
        });
    }).then(function() {
        return new Promise((resolve, reject)=>{
            fs.readFile("./data/categories.json", 'utf8',(err,data)=>{
                if(err){
                    reject(err);
                }
                else {
                    console.log("all good2");
                    categories = JSON.parse(data);
                    resolve();
                }
            })
        })
    });
}

module.exports.getAllPosts = function() {
    return new Promise((resolve,reject)=>{
        if(posts.length == 0) {
            reject("No data exists in posts!");
        }
        else {
            resolve(posts);
        }
    });
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject)=>{
        for (let i = 0; i < posts.length; i++){
            if (posts[i].published) {
                publishedPosts.push(posts[i]);
            }
        }
        if(!publishedPosts.length) {
            reject("No published posts exist!");
        }
        else resolve(publishedPosts);
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