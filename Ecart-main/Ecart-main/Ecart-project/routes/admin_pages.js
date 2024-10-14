var express = require("express");
var router = express.Router();
var Page = require('../models/page')
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;
router.get("/", isAdmin,function (req, res) {
    Page.find({}).then(function (pages) {
        res.render("admin/pages", { pages: pages })
    })
})

// adding page
router.get("/add-page",isAdmin,function (req, res) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })

})
router.post('/add-page',function (req, res) {

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    Page.findOne({ slug: slug }).then(function (page) {
        if (page) {
            res.render('admin/add_page', {
                title: title,
                slug: slug,
                content: content
            });
        } else {
            var page = new Page({
                title: title,
                slug: slug,
                content: content,
                sorting: 100
            });

            page.save();
            Page.find().then(function (pages) {
                req.app.locals.pages = pages;
            })
            res.redirect('/admin/pages');
        }
    });

});

//editing the page
router.get('/edit-page/:id',isAdmin, function (req, res) {
    Page.findById(req.params.id).then(function (page) {
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        })
    })

})

router.post('/edit-page/:id',function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors();
     {
        Page.findOne({ slug: slug, _id: { '$ne': id } }).then(function (page) {
            if (page) {
                // req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {

                Page.findById(id).then(function (page) {
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.save();
                    Page.find().then(function (pages) {
                        req.app.locals.pages = pages;
                    })
                    res.redirect('/admin/pages/edit-page/' + id);


                });


            }
        });
    }
    
});



//deleting the page
router.get('/delete-page/:id',isAdmin,function (req, res) {
    Page.findByIdAndRemove(req.params.id).then(function () {
        Page.find().then(function (pages) {
            req.app.locals.pages = pages;
        })
        res.redirect('/admin/pages/');
    })

})

module.exports = router;