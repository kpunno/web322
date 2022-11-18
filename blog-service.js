const e = require('express');
const Sequelize = require('sequelize');
const {gte} = Sequelize.Op;

var sequelize = new Sequelize('zcqqvmai', 'zcqqvmai', 'ODHEYCrbCMZwGhrzXaExIHx5GcB3sN56', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

Post.belongsTo(Category, {foreignKey:'category'});


// initalizes data, rejects promise if failure occurs when reading file
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Failure within initialize() -> " + err);
        })
    });
}

// GET POSTS + ADD POST + A3 FUNCTIONALITIES

// returns a resolved promise if the posts array is NOT empty
module.exports.getPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("Failure within getPosts() -> " + err);
        });
    });
}

module.exports.getPostsByCategory = function (catID) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: catID
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("Failure within getPostsByCategory() -> " + err);
        });
    });
}

module.exports.getPostsByMinDate = function (minDate) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {[gte]: new Date(minDate)}
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("Failure in getPostsByMinDate() -> " + err);
        });
    });
}

module.exports.getPostByID = function (ID) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: ID
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("Failure in getPostByID() -> " + err);
        })
    })
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;
        for (let e in postData) {
            if (e == "") e = null;
        }
        postData.postDate = new Date();

        Post.create(postData).then(()=>{
            resolve();
        }).catch((err) => {
            reject("Failure in addPost() -> " + err);
        })
    });
}

// !GET POSTS, !ADD POSTS


// returns a resolved promise if the categories array is NOT empty
module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("Failure within getCategories() -> " + err);
        });
    });
}

/*
loops through the posts array, creating a new array on the 
condition that each element is (published==true)
*/
// returns a resolved promise if the publishedPosts array is NOT empty
module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then((data) => {
            resolve(data);
        }).catch((err)=>{
            reject("Failure within getPublishedPosts() -> " + err);
        });
    });
}

/*
loops through the posts array, creating a new array on the 
condition that each element is:
    (published==true) && (category==<user_supplied_category>)
*/
// returns a resolved promise if the publishedPosts array is NOT empty
module.exports.getPublishedPostsByCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: [{
                published: true,
                category: categoryData
            }]
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("Failure within getPublishedPostsByCategory() -> " + err);
        })
    });
}



module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        for (let e in categoryData) {
            if (e == "") e = null;
        }
        Category.create(categoryData).then((data)=>{
            resolve(data);
        }).catch((err) => {
            reject("Failure in addCategory() -> " + err);
        })
    });
}

module.exports.deleteCategoryById = function(catID) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {id: catID}
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject("Failed to delete category!" + err);
        });
    });
}

module.exports.deletePostById = function(postID) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {id: postID}
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject();
        })
    });
}
