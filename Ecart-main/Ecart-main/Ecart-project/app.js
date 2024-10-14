var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');

// Connect to db
mongoose.connect(process.env.DB_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Init app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static('public'));
app.locals.errors = null;
//body parser middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//fileupload middleware
app.use(fileUpload());
// get page model
var Page=require('./models/page');
var Category=require('./models/category');
// Move the Page.find() function inside the app.locals middleware
app.use(function(req, res, next) {
    Page.find().then(function(pages) {
        app.locals.pages = pages;
        next();
    });
});

// Move the Category.find() function inside the app.locals middleware
app.use(function(req, res, next) {
    Category.find().then(function(categories) {
        app.locals.categories = categories;
        next();
    });
});
// Move the Page.find() function inside the app.locals middleware
app.use(function(req, res, next) {
    Page.find().then(function(pages) {
        app.locals.pages = pages;
        next();
    });
});

// Move the Category.find() function inside the app.locals middleware
app.use(function(req, res, next) {
    Category.find().then(function(categories) {
        app.locals.categories = categories;
        next();
    });
});

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }))

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next)
{
    // console.log(typeof req.session.cart);
    
    res.locals.cart=req.session.cart;
    res.locals.user=req.user||null;
    next();
})
app.get('/contact',function(req,res)
{
    res.render('contact',{title:"Contact Us"});
})
//set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);
app.listen(3000,function()
{
    console.log("server started at port : 3000!!!!")
})
