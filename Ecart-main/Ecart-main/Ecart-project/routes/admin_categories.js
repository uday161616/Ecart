var express = require('express');
var router = express.Router();
// Get Category model
var Category = require('../models/category');
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;
/*
 * GET category index
 */
router.get('/',isAdmin,function (req, res) {
    Category.find().then(function (categories) {
        res.render('admin/categories', {
            categories: categories
        });
    });

});

/*
 * GET add category
 */
router.get('/add-category',isAdmin, function (req, res) {

    var title = "";

    res.render('admin/add_category', {
        title: title
    });

});

/*
 * POST add category
 */
router.post('/add-category',function (req, res) {

    // req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
 {
        Category.findOne({ slug: slug }).then(function (err, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });
                category.save()
                Category.find().then(function (categories) {
                    req.app.locals.categories = categories;
                })
                
                req.flash('success', 'Category added!');
                res.redirect('/admin/categories');
            }
        });
    }

});

/*
 * GET edit category
 */
router.get('/edit-category/:id',isAdmin, function (req, res) {

    Category.findById(req.params.id).then(function (category) {
        if (category) {
            res.render('admin/edit_category', {
                title: category.title,
                id: category._id
            });
        }
    });

});

/*
 * POST edit category
 */
router.post('/edit-category/:id',function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }).then(function (category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id).then(function (category) {
                    category.title = title;
                    category.slug = slug;

                    category.save();
                    Category.find().then(function (categories) {
                        req.app.locals.categories = categories;
                    })
                    req.flash('success', 'Category edited!');
                    res.redirect('/admin/categories/edit-category/' + id);
                });


            }
        });
    }

});

/*
 * GET delete category
 */
router.get('/delete-category/:id',isAdmin,function (req, res) {
    Category.findByIdAndRemove(req.params.id).then();
    Category.find().then(function (categories) {
        req.app.locals.categories = categories;
    })
    res.redirect("/admin/categories");

});
// Exports
module.exports = router;

