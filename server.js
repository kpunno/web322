/*********************************************************************************
* 
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically 
*  from any other source (including 3rd party web sites) or distributed to other students.
* 
*  Name:        Kristjan Punno 
*  Student ID:  150695211 
*  Date:        2022-10-11
*
*  Online (Cyclic) Link: https://tasty-headscarf-ox.cyclic.app 
*
********************************************************************************/ 

const multer = require('multer');
const upload = multer();
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const exphbs = require('express-handlebars');

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
        }
    }
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

// does something with app.locals
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// redirects to landing page
app.get("/", (req,res) => {
    res.redirect("/about");
})

// landing page, displays buttons to redirect, and basic info
app.get("/about", (req,res) => {
    res.render('about');
});

// when application links to /blog, fetch and store (published==true) posts
app.get("/blog", (req,res)=>{
    data.getPublishedPosts().then((data)=>{
        res.json(data);
    });
}) 

// when application links to /categories, fetch and display categories.json
app.get("/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    });
})


// POSTS PATH //

// when application links to /posts, fetch and display posts.json
app.get("/posts", (req, res) => {
    let qString = req.query;

    // if the id 'key' exists
    if (qString.minDate) {
        data.getPostsByMinDate(qString.minDate).then((data) => {
            res.render('posts', {posts : data});
        }).catch((err) => {
            res.render("posts", { message: "no results" });
            res.redirect('/posts');
        });
    }

    // if the category 'key' exists
    else if (qString.category) {
        data.getPostsByCategory(qString.category).then((data) => {
            res.render('posts', {posts : data});
        }).catch((err) => {
            console.log(err);
            res.render("posts", { message: "no results" });
        });
    }
    
    // if neither category nor id keys exist
    else {
        data.getPosts().then((data) => {
            res.render('posts', {posts : data});
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
    res.render('addPost');
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
            res.redirect("/posts");
        });
    }
});

// !POSTS PATH

// initializes arrays containing .json data
data.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("Unable to start server: " + err)
});

// displays formatted, yet simple, redirect-to-landing option when 404 occurs
app.use((req,res) => {
    var page404 = (path.join(__dirname,"./views/404.html"));
    res.status(404).sendFile(page404);
});
