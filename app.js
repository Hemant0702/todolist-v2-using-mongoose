//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todolistDB",() => console.log("Connected to database"));

const itemSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2,item3];

const ListSchema = mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model("List", ListSchema);

// Item.deleteOne({_id : "62c804fb81d9bafd6f97acc2"}, function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else{
//     console.log("succesfully deleted");
//   }
// });

app.get("/", function(req, res) {
  
  Item.find({},{id: 0} ,function(err,result){

    if(result.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("succesfully added");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const inputItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    inputItem.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(inputItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req,res){
  const toDelId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);

  if(listName === "Today"){
    Item.findByIdAndRemove({_id: toDelId}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("deleted succesfully");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: toDelId}}}, function(err, foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }

  
      //  it worked well !
  // Item.deleteOne({_id: todel}, function(err){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     console.log("deleted succesfully");
  //   }
  // });  

});

app.get("/:customList", function(req,res){
  const customListName = req.params.customList;

  List.findOne({name: customListName}, function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
