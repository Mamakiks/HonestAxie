const dbconn = require('../model/dbconn');
const bcrypt = require('bcrypt');
const passport = require('passport');
const api = require('../services/api');
const initializePassport = require('../services/passport-config');

function logIn() {
    const sqlSelect = "SELECT * FROM manager";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        let users = new Array();
        result.forEach(user => {
                let addUser = { id : user.idmanager, username : user.name, password : user.password}
                users.push(api.checkApostrophe(addUser))
        });
        return initializePassport(    
            passport,
            username => users.find(user => user.username === username),
            id => users.find(user => user.id === id)
        )  
    })
}

module.exports.login_get = function (req, res) { res.render('login') };

module.exports.changePassword_get = function (req, res) { res.render('changePassword', { message : "" }) };

module.exports.changePassword_post = async function (req, res) {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log(req.body.username + " and " + req.body.password)
        const sqlUpdate = "UPDATE manager SET password='"+hashedPassword+"' WHERE name='"+req.body.username+"'";
        dbconn.conn.query(sqlUpdate, (err, result) => {
            console.log(result)
            const results = Object.values(JSON.parse(JSON.stringify(result)));
            if(err) throw err; 
            else if (results[1] === 0) { // Checking the okPacket affectedRows
                res.render('changePassword', { message : 'No such user' } );
            } else {
                req.logout();
                logIn()
                res.redirect('login');
            }
        })
    }
    catch {
        res.render('changePassword');
    }
}

module.exports.logout = function(req, res) {
    req.logout();
    res.redirect('login');
}

module.exports.checkAuthenticated = function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('login');
}

module.exports.checkNotAuthenticated = function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}
module.exports.logIn = logIn;
/* loginRouter.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
}); */

/* loginRouter.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id : Date.now().toString(),
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
        })
        res.redirect('/login')
    }
    catch {
        res.redirect('register')
    }
}); */