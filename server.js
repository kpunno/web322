/*********************************************************************************
* 
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically 
*  from any other source (including 3rd party web sites) or distributed to other students.
* 
*  
*  Name:        Kristjan Punno 
*  Student ID:  150695211 
*  Date:        2022-11-18
*
*  Online (Cyclic) Link: https://tasty-headscarf-ox.cyclic.app 
*
********************************************************************************/ 


const multer = require('multer');
const upload = multer();
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

cloudinary.config({
    cloud_name: 'dkjnonulv',
    api_key: '394872553728763',
    api_secret: 'mDYTanKIKahn89A3XFxgryJDokk',
    secure: true
});

const express = require("express");
const path = require("path");
const { emitWarning, mainModule } = require("process");
const app = express();
const data = require("./blog-service");
const { stringify } = require('querystring');

// ASSIGNMENT 6 INCLUSIONS //

const authData = require('./auth-service');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

app.use(express.urlencoded({extended: true}));

mongoose.connect('mongodb+srv://kristjan:kristjanpunno@senecaweb.llnhc4s.mongodb.net/web322?retryWrites=true&w=majority');

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },

        safeHTML: function(context){
            return stripJs(context);
        },

        formatDate: function(date) {
            if (date) {
                let year = date.getFullYear();
                let month = (date.getMonth() + 1).toString();
                let day = date.getDate().toString();
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
    }
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

// stores the active route, most importantly: 
//      <viewingCategory>, which represents the current category id
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// redirects to landing page
app.get("/", (req,res) => {
    res.redirect("/blog");
})

// landing page, displays buttons to redirect, and basic info
app.get("/about", (req,res) => {
    res.render('about');
});


app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }
        else{
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }
    catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await data.getPostByID(req.params.id);
    }
    catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }
    catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// when application links to /categories, fetch and display categories.json
app.get("/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        if (data.length) {
            res.render('categories', { categories: data });
        } else throw("");
    }).catch((err) => {
        console.log(err);
        res.render("categories", { message: "no results" });
    });
})


// POSTS PATH //

// when application links to /posts, fetch and display posts.json
app.get("/posts", (req, res) => {

    // if the minDate 'query key' exists
    if (req.query.minDate) {
        data.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length) {
                res.render('posts', { posts: data });
            }
            else throw("");
        }).catch((err) => {
            console.log(err);
            res.render("posts", { message: "no results" });
        });
    }

    // if the category 'query key' exists
    else if (req.query.category) {
        data.getPostsByCategory(req.query.category).then((data) => {
            if (data.length) {
                res.render('posts', {posts : data});
            }
            else throw("");
        }).catch((err) => {
            console.log(err);
            res.render("posts", { message: "no results" });
        });
    }
    
    // if neither category nor minDate query keys exist in url
    else {
        data.getPosts().then((data) => {
            if (data.length) {
                res.render('posts', {posts : data});
            }
            else throw("");
        }).catch((err) => {
            console.log(err);
            // maybe render something else in accordance with error
            res.render("posts", { message: "no results" });
        });
    }
});

// get post by specified ID
app.get("/post/:id", (req,res) => {
    data.getPostByID(req.params.id).then((data) => {
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.redirect('/posts');
    });
})

// when url path is: /posts/add -> app will send /views/addPost.html
app.get("/posts/add", (req,res) => {
    data.getCategories().then((data) => {
        res.render('addPost', {categories: data});
    }).catch(() => {
        res.render('addPost', {categories: []})
    })
});

app.post("/posts/add", upload.single("featureImage"), (req,res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            req.body.featureImage = uploaded.url;

            // calls addPost, which in turn, adds post to array 
            // then redirects to posts
            data.addPost(req.body).then(function () {
                res.redirect("/posts");
            });
        });
    }
    else {

        // will not process the post, as the feature image is non-existent
        req.body.featureImage = "";
        data.addPost(req.body).then(function () {
            res.redirect("/posts");
        }).catch((err) => {

            // catches the inability to process an empty image
            // then redirects to posts
            console.log(err);
            res.render("posts", {message: "nope"});
        });
    }
});

app.get("/posts/delete/:id", (req,res) => {
    data.deletePostById(req.params.id).then(() => {
        res.redirect("/posts");
        console.log('test');
        resolve();
    }).catch(() => {
        res.status(500).render('500', {type : "post"});
    });
});

// !POSTS PATH

// CATEGORIES PATH

// when url path is: /categories/add -> app will send /views/addCategory.hbs
app.get("/categories/add", (req,res) => {
    res.render('addCategory');
});

app.post("/categories/add", (req, res) => {
    data.addCategory(req.body).then(() => {
        console.log("addCategory() success")
        res.redirect("/categories");
    }).catch((err) => {
        console.log("addCategory() failure")
        console.log(err);
    })
});

app.get("/categories/delete/:id", (req,res) => {
        data.deleteCategoryById(req.params.id).then(() => {
            res.redirect("/categories");
            resolve();
        }).catch((err) => {
            console.log(err);
            res.status(500).render('500', {type : "category"});
        });
});

// !CATEGORIES PATH

// initializes arrays containing .json data
data.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("Unable to start server: " + err)
});

// displays formatted, yet simple, redirect-to-landing option when 404 occurs
app.use((req,res) => {
    res.status(404).render('404');
});
