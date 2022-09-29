const fs = require("fs");

var posts = [];
var categories = [];


/*
read and parse posts.json, 
then, if successful, 
read and parse categories.json
*/
// initalizes data, rejects promise if failure occurs when reading file
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

// returns a resolved promise if the posts array is NOT empty
module.exports.getPosts = function() {
    return new Promise((resolve,reject)=>{
        if(posts.length) {
            resolve(posts);
        }
        else reject("No data exists in posts!");
    });
}

// returns a resolved promise if the categories array is NOT empty
module.exports.getCategories = function() {
    return new Promise((resolve,reject)=>{
        if(categories.length) {
            resolve(categories);
        }
        else {
            reject("No categories exist!");
        }
    });
}

/*
loops through the posts array, creating a new array on the 
condition that each element is (published==true)
*/
// returns a resolved promise if the publishedPosts array is NOT empty
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