const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-abhi:test123@cluster0.x51oq.mongodb.net/todolistDB");
const listschema={
name:{
    type:String,
    require:[true,"This has been added"]
}
};
const Item = mongoose.model("Item",listschema);
const list1 = new Item({
    name:"Welcome to todolist"
});
const list2 = new Item({
    name:"Click on + button to add new item"
});
const list3 = new Item({
    name:"<----Click to delete item"
});

const randomlistschema={
    name:String,
    items:[listschema]
};
const randomList = mongoose.model("RandomList",randomlistschema);
const defaultItems = [list1,list2,list3];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",function(req,res){

Item.find({},function(err,result){
if(result.length==0){
    Item.insertMany(defaultItems,function(err){
        if(err){
            console.log("err occurred");
        }
        else{
            console.log("successfully saved Data in db");
        }
        });
        res.redirect("/");
}
else{
    res.render("list",{day:"Today",newListItem:result});
}
});
});

app.get("/:randomroute",function(req,res){
const randomroute = _.capitalize(req.params.randomroute);
randomList.findOne({name:randomroute},function(err,results){
if(err){
    console.log("exists");
}
else{ 
    if(!results){
    const item = new randomList({
        name:randomroute,
        items:defaultItems
    });
    item.save();
    res.redirect("/"+randomroute);
}
else{
    res.render("list",{day:results.name,newListItem:results.items});
}
}
});

});
app.post("/",function(req,res){
 const data = req.body.data;
 const list = req.body.list;
 const item = new Item({
     name:data
 });
 if(list==="Today"){
    item.save();
    res.redirect("/");
 }
 else{
     randomList.findOne({name:list},function(err,results){
       if(!err){
           results.items.push(item);
           results.save();
           res.redirect("/"+list);
       } 
     });
 }

 

});
app.post("/delete",function(req,res){
const id =req.body.checkbox;
const list = req.body.list;
if(list==="Today"){
    Item.findByIdAndDelete(id,function(err){
        if(!err){
            console.log("deleted");
        }
        else{
            console.log("not deleted");
        }
    })
    res.redirect("/");
}
else{
    
    randomList.findOneAndUpdate({name:list},{$pull:{items:{_id:id}}},function(err,result){
        if(!err){
            res.redirect("/"+list);
        }
    });
}

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
console.log("Port start listening at 3000");
});