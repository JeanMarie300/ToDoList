const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash");
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/todoList');

const itemSchema =new mongoose.Schema({
    name:String
}); 

const Item = mongoose.model('Item', itemSchema);

const listSchema =new mongoose.Schema({
    listName:String,
    items:[itemSchema]
}); 

const list = mongoose.model('List', listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

var defaultList;
var ExistingList;

async function insertDefaultItemList() {
    const exist = await Item.find({}).lean().exec();
    if (exist.length === 0) {
        const item1 = new Item({name:"First item"});
        const item2 = new Item({name:"Second item"});
        const item3 = new Item({name:"Third item"});

    await Item.insertMany([
        item1,
        item2,
        item3
    ]);
    }

    defaultList= await Item.find({}).lean().exec();
}

async function listExist(listName) {
    ExistingList =   await list.findOne({ listName: listName }).exec();
}

async function createList(listitem) {
    await listitem.save();
}

async function removeItem(itemId) {
  await Item.deleteOne({ _id: itemId });
}

async function updateListItem(listName, itemId) {
    await list.updateOne({ listName: listName }, {$pull:{items : {_id : itemId}}},{ isDeleted: true });
}


app.get("/", function(request, response){
    insertDefaultItemList().then(function () {
    response.render("list", {listTitle: "Today", listOfItem : defaultList });
    });
}) 

app.post("/", function(request, response) {

    if (request.body.button === "Today") {
    itemInserted = new Item({name:request.body.listItem});
    itemInserted.save();
    response.redirect("/");
    } else {
        itemInserted = new Item({name:request.body.listItem});
        listExist(request.body.button).then(function () {
            if (ExistingList == null) {
                response.redirect("/"+request.body.button);
            } else {
                ExistingList.items.push(itemInserted);
                ExistingList.save();                
                response.redirect("/"+request.body.button);
            }
        });
    }

});

app.post("/delete", function(request, response) {

    console.log(request.body.listName);
    if (request.body.listName === "Today") {
        removeItem(request.body.checkbox).then(function() {
            response.redirect("/");
        })
    } else {
        updateListItem(request.body.listName, request.body.checkbox).then(function() {
            response.redirect("/"+request.body.listName);
        });
    }
});

app.get("/:listtName", function(request, response) {
    const customListName = _.capitalize(request.params.listtName);
    listExist(customListName).then(function() {
        if ( ExistingList ==null ) {
            insertDefaultItemList().then(function () {
                const listItem = new list({
                    listName:customListName,
                    items:defaultList
                });
                createList(listItem).then(function() {
                    response.render("list", {listTitle: customListName, listOfItem : defaultList });   
                })
            })
        } else {
            response.render("list", {listTitle: ExistingList.listName, listOfItem : ExistingList.items });   
        }
    });

  });


app.get("/about", function(request, response) {
    response.render("about");
})


app.listen(3000, function() {
    console.log("Server is listening on port 3000");
});
