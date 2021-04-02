//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");  //1

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//creating a new database inside mongodb 2
mongoose.connect("mongodb+srv://user3061:rajatmm@cluster0.orrkb.mongodb.net/todolistDb", { useNewUrlParser: true });

//creating new schema 3
const itemsSchema = {
  name: String
}

//creating mongoose model based on the above schema 4
const Item = mongoose.model(
  "Item", itemsSchema
);

//creating new documents 5

const item1 = new Item({
  name: "Wecome to the to do list"
});

const item2 = new Item({
  name: "we are going to be successful"
});

const item3 = new Item({
  name: "just keep faith in god & keep working hard"
});

//putting all document in array 6

const defaultItems = [item1, item2, item3];

//creating new schema for custom - dynamic list 13

const listSchema = {
  name: String,
  items: [itemsSchema]
};

//creating mongoose model 14
const List = mongoose.model("List",listSchema);



//inserting all the above items 7




app.get("/", function (req, res) {

  //finding the items and rendering them into app 8
  Item.find({}, function (err, foundItems) {

    //checking if the array is empty 9

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved items into database.")
        }
      });

      res.redirect("/");

    } else {

      res.render("list", { listTitle: "Today", newListItems: foundItems });

    }


  });



});

app.post("/", function (req, res) {


// 10 -------------------------------------------------
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //17

  if(listName === "Today"){
    item.save();
res.redirect("/"); 
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item.")
        res.redirect("/");
      }
    });
  
  }
  else{
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      })
  }

});

  // 11 -----------------------------
  

//creating dynamic route (express route parameters)  12

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  //find one  16
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)

      }else{
        //show an existing list
        res.render("list",{ listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })

//creating new list document 15







});








app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
