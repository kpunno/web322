const fs = require("fs");

var maxCategory = 5;
var minCategory = 1;

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

// GET POSTS + ADD POST + A3 FUNCTIONALITIES

// returns a resolved promise if the posts array is NOT empty
module.exports.getPosts = function() {
    return new Promise((resolve,reject)=>{
        if(posts.length) {
            resolve(posts);
        }
        else reject("No data exists in posts!");
    });
}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {

        // minCategory and maxCategory are global variables 
        // defined at top of file

        if (category >= minCategory && category <= maxCategory) {
            var postsByCategory = [];
            for (let i = 0; i < posts.length; i++){

                // if posts[i].category is equal to parameter
                if (posts[i].category == category) {
                    postsByCategory.push(posts[i]);
                }
            }
            if (postsByCategory.length) {
                resolve(postsByCategory);
            }
            else reject ("No data exists in this category: ");
        }
        else {
            reject("Category does not exist: ");
        }
    })
}

module.exports.getPostsByMinDate = function(minDate) {
    return new Promise((resolve, reject) => {
        var postsByMinDate = [];
        for (let post of posts){
            // if posts[i].postDate is greater than parameter
            if (post.postDate > minDate) {
                postsByMinDate.push(post);
            }
        }
        if (postsByMinDate.length) {resolve(postsByMinDate);}
        else {reject("No data exists after supplied date.");}
    });
}

module.exports.getPostByID = function (ID) {
    return new Promise((resolve, reject) => {
        let match = false;
        for (let post of posts) {
            if (post.id == ID) {
                match = true;
                resolve(post);
            }
        }
        if (!match) reject("Post with ID " + ID + ": does not exist.")
    })
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        if (postData.featureImage != "") {

            //producing current date
            var date = new Date;
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            date = (year + '-' + month + '-' + day);

            // assigning a date
            postData.postDate = date;

            // assigning an ID
            postData.id = (posts.length + 1);

            // assigning publishing status
            if (postData.published != "on") {
                postData.published = false;
            }
            else postData.published = true;

            //pushing to posts array
            posts.push(postData);
            resolve(postData);
        }
        else reject(err);
    })
}

// !GET POSTS, !ADD POSTS


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
    });
}

