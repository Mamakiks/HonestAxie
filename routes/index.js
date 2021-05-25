const express = require('express');
const router = express.Router();
const dbconn = require('../model/dbconn');
const multer = require('multer');
const api = require('./api');
const axios = require('axios').default;
const fs = require('fs');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
/* const dotenv = require('dotenv'); */
const methodOverride = require('method-override');


//Tells multer where to save the image relative to this index.js file.
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/pictures') //Error and destination string
    },
    filename: (req, file, cb) => {
        cb(null, `${api.createDate}` + `-${Math.floor(Math.random() * 10)}-` + file.originalname) //original name has access to the filetype.
    }
});
const upload = multer({ storage : fileStorageEngine });


/* ################################## LOGIN SECTION ################################## */

function logIn() {
    const sqlSelect = "SELECT * FROM manager";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        let users = new Array();
        result.forEach(user => {
                let addUser = { id : user.idmanager, username : user.name, password : user.password}
                users.push(addUser)
        });
        return initializePassport(    
            passport,
            username => users.find(user => user.username === username),
            id => users.find(user => user.id === id)
        )  
    })
}
logIn();

router.use(methodOverride('_method'));
router.use(flash());
router.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));
router.use(passport.initialize())
router.use(passport.session())

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
});

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true, // Sends the message from passport-config
}))

router.get('/changePassword', checkAuthenticated, (req, res) => {
    res.render('changePassword', { message : "" });
});

router.post('/changePassword', checkAuthenticated, async (req, res) => {
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
                logIn();
                res.redirect('/login');
            }
        })
    }
    catch {
        res.render('changePassword');
    }
});

/* router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
}); */

/* router.post('/register', checkNotAuthenticated, async (req, res) => {
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

router.delete('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}


/* ################################## Main Page SECTION ################################### */
// Home Page
router.get('/', checkAuthenticated, (req, res) => {
    console.log('Request for home received');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=SuperFarm%2CEthereum%2Caxie-infinity%2Csmooth-love-potion%2Cbitcoin&vs_currencies=usd';
    axios.get(url).then(response => {
        var obj = response.data;
        let coins = {};
        let i = 0;
        for (const [key, value] of Object.entries(obj)) {
            let coin = { coinId : key, usd : Object.values(value)[0] }
            coins[i] = coin;
            i++;
        }
        let scholarRankingsList = api.scholarRankingsList.sort((b, a) => (a.avg_earning > b.avg_earning) ? 1 : -1);
        res.render('index', { /* name : req.user.name, */ scholarRankingsList : scholarRankingsList, price : api.result, coins : coins });
    })
});

// Scholar List
router.get('/allscholars', checkAuthenticated, (req, res) => {
    console.log('Request for Scholar list page recieved');
    const sqlSelect = "SELECT * FROM scholar";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        res.render('allscholars', { data : result });
    })
});

// Add scholar
router.get('/newscholar', checkAuthenticated, (req, res) => {
    console.log('Request for New Scolar page recieved');
    res.render('newscholar');
});

// Insert new scholar on request /save
router.post('/save', checkAuthenticated, upload.single('picture'), (req, res) => {
    const formData = { username : req.body.username, account : req.body.account, email : req.body.email, 
        scholar_ronin : req.body.scholar_ronin, manager_ronin : req.body.manager_ronin, start_date : req.body.start_date, picture : req.file.filename,
        note : req.body.note, qr_expiry : req.body.qr_expiry, manager_idmanager : Number(req.body.manager) };
    const sqlPut = "INSERT INTO scholar SET ? ";
    const query = dbconn.conn.query(sqlPut, formData, (err, results) => {
        if(err) throw err;
        console.log("New Scholar created " + formData.username);
        res.redirect('/allscholars');

    })
});

// Edit existing scholar ----------------------------------------------------------------------
router.post('/edit/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { username : req.body.username, account : req.body.account, email : req.body.email, 
        scholar_ronin : req.body.scholar_ronin, manager_ronin : req.body.manager_ronin, start_date : req.body.start_date,
        note : req.body.note, qr_expiry : req.body.qr_expiry, manager_idmanager : Number(req.body.manager) };
        const sqlUpdate = "UPDATE scholar SET username='"+formData.username+"', account='"+formData.account+"', email='"+formData.email+"', scholar_ronin='"+formData.scholar_ronin+"', manager_ronin='"+formData.manager_ronin+"', start_date='"+formData.start_date+"', note='"+formData.note+"', qr_expiry='"+formData.qr_expiry+"', manager_idmanager='"+formData.manager_idmanager+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect('/allscholars');
    })
});

// Delete Scholar
router.post('/delete/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    // Delete Picture from drive.
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
       // Check if file exists
       const imgPath = `images/pictures/${result[0].picture}`;
       fs.stat(imgPath, function(err, stat) {
        if(err == null) {
            console.log('File exists');
            // Delete picture
            fs.unlink(imgPath, (err) => {
                if (err) throw err;
                console.log('successfully deleted ' + result[0].picture);
            })
        }  else {
            console.log('Some other error: ', err.code);
        }
    });
    })
    // Delete Scholar from database
    const sqlDelete = "DELETE FROM scholar WHERE idscholar = ?";
    dbconn.conn.query(sqlDelete, [id], (err, result) => {
        if(err) throw err;
        res.redirect('/allscholars');
    })
});

// Select Scholar
router.get('/select/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        const getObj = result[0];
        res.render('editscholar', { data : getObj });
    })
});
/* ################################## PROFILE SECTION ################################## */
// Select Profile ----------------------------------------------------------------------
router.get('/profile/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const url = 'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25&vs_currencies=USD%2CDKK';
    axios.get(url).then(response => {
        const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
        dbconn.conn.query(sqlSelect, [id], (err, result) => {
            if(err) throw err;
            currency = Object.values(response.data)
            let dkk = currency[0].dkk;
            let usd = currency[0].usd;
            const getScholar = result[0];
            const calc = api.calc(getScholar.last_month_earning, getScholar.scholar_cut, usd, dkk);
            const scholarRankingsList = api.scholarRankingsList.sort((b, a) => (a.avg_earning > b.avg_earning) ? 1 : -1);
            console.log("Scholar " + getScholar.username + " selected")
            res.render('profile', { data : getScholar, scholarRankingsList : scholarRankingsList,
                 scholUSD : calc[0], scholDKK : calc[1], scholSLP : calc[2], 
                 manUSD : calc[3], mandkk : calc[4], manslp : calc[5], dkk : dkk, usd : usd });
        })
    });
});


// Edit profile Earned ----------------------------------------------------------------------
router.post('/profile_earned/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    // Get scholar to calculate avg earning
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        let getScholar = result[0];
        // Get scholar data from form
        const formData = { input_earned : req.body.slp_earned, total_earning : req.body.total_earning, total_slp_account : req.body.total_slp_account };
        let total_slp = Number(formData.input_earned) + Number(formData.total_slp_account);
        let total_earning = Number(formData.total_earning) + Number(formData.input_earned);
        let total_slp_account = Number(formData.input_earned);
        // Update total_earning and pass it to the function
        getScholar.total_earning = total_earning;
        var avgPerDay = api.AverageEarnings(getScholar);
        const sqlUpdate = "UPDATE scholar SET total_slp_account='"+total_slp+"', total_earning='"+total_earning+"', last_month_earning='"+total_slp_account+"', avg_earning='"+avgPerDay+"' WHERE idscholar='"+id+"'";
        dbconn.conn.query(sqlUpdate, (err, result) => {
            if(err) throw err;
            /* console.log(result); */
            res.redirect(`/profile/${id}`);
        })
    })
  
});
// Edit profile Withdraw ----------------------------------------------------------------------
router.post('/profile_withdrawn/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { slp_account_withdrawn : req.body.slp_account_withdrawn, total_slp_account : req.body.total_slp_account };
    let total_slp = Number(formData.total_slp_account - formData.slp_account_withdrawn);
    const sqlUpdate = "UPDATE scholar SET total_slp_account='"+total_slp+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
});
// Edit profile Scholar cut ----------------------------------------------------------------------
router.post('/profile_cut/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { scholar_cut : req.body.scholar_cut  };
    console.log(formData.slp_account)
    const sqlUpdate = "UPDATE scholar SET scholar_cut='"+formData.scholar_cut+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
});
// Edit earning withdraw ----------------------------------------------------------------------
router.post('/profile_earned_withdraw/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { profile_earned_withdraw : req.body.profile_earned_withdraw, total_earning : req.body.total_earning  };
    let total_earning = Number(formData.total_earning) - Number(formData.profile_earned_withdraw);
    const sqlUpdate = "UPDATE scholar SET total_earning='"+total_earning+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
});

// Edit picture ----------------------------------------------------------------------
router.post('/changePicture/:id', checkAuthenticated, upload.single('picture'), (req, res) => {
    const id = req.params.id;
    // Delete picture
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        const imgPath = `images/pictures/${result[0].picture}`;
        // Check if file exists
        fs.stat(imgPath, function(err, stat) {
            if(err == null) {
                console.log('File exists');
                // Delete picture
                fs.unlink(imgPath, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted ' + result[0].picture);
                })
            }  else {
                console.log('Some other error: ', err.code);
            }
        });

    })
    // Upload new picture, edit database.
    console.log("changepicture")
    const formData = { picture : req.file.filename };
    const sqlUpdate = "UPDATE scholar SET picture='"+formData.picture+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
});

// Edit Note ----------------------------------------------------------------------
router.post('/editNote/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const sqlUpdate = "UPDATE scholar SET note='"+req.body.note+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
});

// Edit Axie_1 ----------------------------------------------------------------------
router.post('/change_axie_1/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { axie_1 : req.body.axie_1 };
    console.log(formData.axie_1)
    const sqlUpdate = "UPDATE scholar SET axie_1='"+formData.axie_1+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
});

// Edit Axie_2 ----------------------------------------------------------------------
router.post('/change_axie_2/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { axie_2 : req.body.axie_2 };
    console.log(formData.axie_2)
    const sqlUpdate = "UPDATE scholar SET axie_2='"+formData.axie_2+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
});

// Edit Axie_3 ----------------------------------------------------------------------
router.post('/change_axie_3/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const formData = { axie_3 : req.body.axie_3 };
    console.log(formData.axie_3)
    const sqlUpdate = "UPDATE scholar SET axie_3='"+formData.axie_3+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
});


// Compact List ------------------------------------------------------------------------------------------
router.get('/compactList', checkAuthenticated, (req, res) => {
    console.log('Request for Scholar list page recieved');
    const sqlSelect = "SELECT * FROM scholar";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        res.render('compactList', { data : result });
    })
});
module.exports = router;