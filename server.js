const express = require("express");
const path = require("path");
const app = express();
const data = require("./blog-service");

app.use(express.static('public'));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

// redirects to landing page
app.get("/", (req,res) => {
    res.redirect("/about");
})

// landing page, displays buttons to redirect, and basic info
app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
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

// when application links to /posts, fetch and display posts.json
app.get("/posts", (req,res)=>{
    data.getPosts().then((data)=>{
        res.json(data);
    });
});

// displays formatted, yet simple, redirect option when 404 occurs
app.use((req,res) => {
    res.status(404).send("<div class=\"container\"><h1>No Man\'s Land</h1><a style=\"color:grey\" href=\"/about\"><h2>Get me out of here!</h2></a></div>")
});

// initializes arrays containing .json data
data.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log("Unable to start server: " + err)
});


