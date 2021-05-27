const express = require('express');
const router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const loginCon = require('../controllers/loginController');

router.use(methodOverride('_method'));
router.use(flash());
router.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/login', loginCon.checkNotAuthenticated, loginCon.login_);

router.post('/login', loginCon.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true, // Sends the message from passport-config
}));
loginCon.logIn();

router.get('/changePassword', loginCon.checkAuthenticated, loginCon.changePassword_get);

router.post('/changePassword', loginCon.checkAuthenticated, loginCon.changePassword_post);

router.delete('/logout', loginCon.logout);

module.exports = router;