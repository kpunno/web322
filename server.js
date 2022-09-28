var express = require("express");
var path = require("path");
var app = express();
var data = require("./blog-service");

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
    data.getPublishedPosts().then((data)=>{
        res.json(data);
    });
}) 

app.get("/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    });
})

app.get("/posts", (req,res)=>{
    data.getAllPosts().then((data)=>{
        res.json(data);
    });
});

const path404 = path.join(__dirname, "/views/404.html");
app.use((req,res) => {
    res.status(404).sendFile(path404);
});



data.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log("Unable to start server: " + err)
});


