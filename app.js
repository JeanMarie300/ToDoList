const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

let item = "";

const items = [];

const workItems = [];

app.get("/", function(request, response){

    let day = date.getDate();

    response.render("list", {listTitle: day, listOfItem : items });

}) 

app.post("/", function(request, response) {

    item = request.body.listItem ;
    if (request.body.button === "Work") {
        workItems.push(item);
        response.redirect("work");
    } else {
        items.push(item);
        response.redirect("/");
    }
});

app.get("/work", function(request, response) {
    response.render("list", {listTitle:"Work List", listOfItem:workItems});
})

app.get("/about", function(request, response) {
    response.render("about");
})


app.listen(3000, function() {
    console.log("Server is listening on port 3000");
});
