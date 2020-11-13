const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {loginValidation, registerValidation} = require('../utils/validate');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {authVerify, notAuthVerify} = require('../utils/verify');

// Login Route - GET
router.get('/login', notAuthVerify, (req, res) => {
    res.render('user/login', {errors:[]});
})

// Handle login form - POST
router.post('/login', notAuthVerify, async(req, res, next) => {
    // Validate the data
    const {error} = loginValidation(req.body);
    if(error) return res.render('user/login', {errors: [error.details[0].message]});
    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect:'/user/login'
    })(req, res, next);
    
})

// Register Route - GET
router.get('/register',notAuthVerify,  (req, res) => {
    res.render('user/register', {errors: []});
})


// Handle Register form - POST
router.post('/register',notAuthVerify, async(req, res) => {
    console.log(req.body)

    // Errors
    let errors = [];

    // Validate the data
    const {error} = registerValidation(req.body);
    if(error) {
        errors.push(error.details[0].message)
    }

    // check two password are same or not
    if(req.body.password !== req.body.password2){
        errors.push("Password doesn't match")
    }

    // Check the email already exists in db
    const emailExists = await User.findOne({email: req.body.email})
    if(emailExists){
        errors.push("Email Already Exists")
    } 

    
    // Check the errors
    if(errors.length > 0){
        return res.render('user/register', {
            errors: errors
        })
    }

    // hash the password
    let hashedPassword;
    try{
        let salt = await bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(req.body.password, salt);
    }catch(err){
        return res.send("Server Error")
    }

    // Create new User
    isTeacher = req.body.role === 'teacher'
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        isTeacher : isTeacher,
        password: hashedPassword
    });

    await newUser.save();
    return res.redirect('/user/login');

});

// Logout - GET
router.get('/logout', authVerify, (req, res) => {
    req.logout();
    res.redirect('/user/login');
})

module.exports = router;