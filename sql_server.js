//app requirements
var express = require('express')
var app = express();
// set templating engine
var ejs = require('ejs')
app.set("view_engine", "ejs")
// use body parser to parse the body
var bodyParser = require('body-parser')
// tell app which method to use when parsing
app.use(bodyParser.urlencoded({extended: false}))

// allow for method override
var methodOverride = require('method-override')
// tell app which override method to use
app.use(methodOverride('_method'))

// get access to the sqlite3 module
var sqlite3 = require('sqlite3').verbose();
// specify which file is the database
var db = new sqlite3.Database('blog.db');

app.get('/', function(req, res){
	res.redirect('/blog')
})

//show all posts
app.get('/blog', function(req, res) {
	db.all("select * from posts order by id desc", function(err, rows) {
		if(err) {
			throw err;
		}
		res.render('index.ejs', { posts : rows });
	});
});

//show individual post
app.get('/post/:id', function(req, res) {
	//get post id from url, set thisPost to appropriate post
	db.get("select * from posts where id = ?", parseInt(req.params.id), function(err, row) {
        if(err) { 
            throw err; 
        }
		res.render('show_post.ejs', { thisPost: row });
      });
});

//serve up new page for create a post form
app.get('/posts/new', function(req, res) {
	res.render('new_post.ejs');
});

//create a post
app.post('/blog', function(req, res) {
	// save the new post to the db
	if (!req.body.imgurl || req.body.imgurl===undefined || req.body.imgurl==='') {
		req.body.imgurl = null;
	}

	db.run("insert into posts (title, body, imgurl) values (?, ?, ?)", req.body.title, req.body.body, req.body.imgurl, function(err) {
		if(err) { 
			throw err; 
		}
    });
	//go to /blog so we can see our new pet
	res.redirect('/blog');
});

//sending user to edit form
app.get('/post/:id/edit', function(req, res) {
	db.get ("select * from posts where id = ?;", parseInt(req.params.id), function(err, row) {
		if(err) {
			throw err;
		}
		res.render("edit_post.ejs", { thisPost : row })
	});
});

//update a post
app.put('/post/:id', function(req, res) {
	//make changes to appropriate post
	db.run("update posts set title = ?, body = ?, imgurl = ? where id = ?;", req.body.title, req.body.body, req.body.imgurl, parseInt(req.params.id), function (err, data) {
		if(err) {
			throw err; 
		}
	});
	//redirect to this post's page to see changes
	res.redirect('/post/' + parseInt(req.params.id));
});

//delete a post
app.delete('/post/:id', function(req, res) {
	db.run("delete from posts where id = ?;", parseInt(req.params.id), function(err) {
		if(err) { 
			throw err; 
		}
	});
	//go to /pets to see change
	res.redirect('/blog');
});

var port = 3000;
app.listen(port);
console.log('listening on port '+port);
