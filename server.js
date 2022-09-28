var express = require("express");
var path = require("path");
var app = express();
var blogService = require("./blog-service");

app.use(express.static('public'));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

app.get("/", (req,res) => {
    res.redirect("/about");
})



app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/blog", (req,res)=>{
    res.send("<p>This route will return a JSON formatted string containing all of the posts within the posts.json file whose published property is set to true</p>");
}) 

app.get("/posts", (req,res)=>{
    res.send("<p>This route will return a JSON formatted string containing all the posts within the posts.json files</p>");
}) 

app.get("/categories", (req,res)=>{
    res.send("<p>This route will return a JSON formatted string containing all of the categories within the categories.json file</p>");
})

const path404 = path.join(__dirname, "/views/404.html");
app.use((req,res) => {
    res.status(404).sendFile(path404);
});

app.listen(HTTP_PORT, onHttpStart);

