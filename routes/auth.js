const express = require('express');
const router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const authCon = require('../controllers/authController');

router.use(methodOverride('_method'));
router.use(flash());
router.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/login', authCon.checkNotAuthenticated, authCon.login_get);

router.post('/login', authCon.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true, // Sends the message from passport-config
}));
authCon.logIn();

router.get('/changePassword', authCon.checkAuthenticated, authCon.changePassword_get);

router.post('/changePassword', authCon.checkAuthenticated, authCon.changePassword_post);

router.delete('/logout', authCon.logout);

module.exports = router;