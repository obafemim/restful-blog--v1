const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override")
const expressSanitizer = require("express-sanitizer")

mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

let blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

let Blog = mongoose.model("Blog", blogSchema);

// Blog.create(
//   {
//     title: "My Favorite Breath of the Wild Location",
//     image: "https://images.unsplash.com/photo-1485343034225-9e5b5cb88c6b",
//     body: "Mount Nabooru. A location in The Legend of Zelda: Breath of the Wild. It is located in the Gerudo province of Hyrule."
//   }, function(err, campground) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Newly created campground: ");
//       console.log(campground);
//     }
//   });

app.get("/", function(req, res) {
  res.redirect("/blogs");
});

// INDEX route
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

// CREATE route
app.post("/blogs", function(req, res) {
  // create a new blog.
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      res.render("new");
    } else {
        res.redirect("/blogs");
    }
  });
});

// NEW
app.get("/blogs/new", function(req, res) {
  res.render("new.ejs");
});

// SHOW
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      console.log(err);
    } else {
        res.render("show.ejs", {blog: foundBlog});
    }
  })
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
        res.render("edit.ejs", {blog: foundBlog});
    }
  })
});

// UPDATE route
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
        res.redirect("/blogs/" + req.params.id);
    }
  })
});

// DELETE route
app.delete("/blogs/:id", function(req, res) {
  // destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    } else {
        res.redirect("/blogs/");
    }
  })
});

app.listen(3000, function() {
  console.log("Server has started!")
});
