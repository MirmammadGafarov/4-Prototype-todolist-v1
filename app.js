const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const  _ = require("lodash");

const app = express();



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://miri571:Test123@cluster0.kim3ui9.mongodb.net/todolistDB");


const itemsSchema = {
  name: String,
};

const Item =  mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Go Shopping"
})

const item2 = new Item({
  name: "Go to GYM"
})

const item3 = new Item({
  name: "Go for a walk"
})

const defaultItems = [item1, item2, item3]

const categoryList = {
  name: String,
  items: [itemsSchema]
}

const Category = mongoose.model("Category",categoryList)



app.get("/", function (req, res) {


Item.find({}, function(err, result){

  if(result.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
       console.log(err)
      } else {
        console.log("defaultItems succesfully saved to todolistDB")
      }
    });
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: result });
  }
})
});



app.get('/:categoryName',function(req,res){
   
  const categoryName = _.capitalize(req.params.categoryName) 


Category.findOne({name: categoryName},function(err, foundName){
  if(!err){
    if(!foundName){
      //reacte new category
      
  const category = new Category({
    name: categoryName,
    items: defaultItems
  })
category.save()
res.redirect("/" + categoryName)
    }else{
      //show exist category
      res.render("list", {listTitle : foundName.name, newListItems: foundName.items })
    }
  }
})
})


app.post("/", function (req, res) {
  
const itemName = req.body.newItem;
const listName = req.body.list;

 const addItem = new Item({
  name: itemName
 });


 if(listName === "Today"){

  addItem.save();
  res.redirect("/")

 }else{
  Category.findOne({name: listName}, function(err, foundName){
    foundName.items.push(addItem);
    foundName.save()
    res.redirect("/" + listName)
  })
 }

});




app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  
  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully deleted checked item")
        res.redirect("/")
      } 
    })

  }else{
   
    Category.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundName){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }
})

 
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
