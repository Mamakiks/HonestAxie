const dbconn = require('../model/dbconn');
const api = require('../services/api');
const axios = require('axios').default;
const fs = require('fs');

module.exports.home_get = function (req, res) {
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
          api.rankings().then((result) =>  {
                res.render('index', { /* name : req.user.name, */ scholarRankingsList : result, price : api.result, coins : coins });
          });       
    })
}

module.exports.tools_get = function (req, res) {
    res.render('tools');
}

module.exports.gallery_get = function (req, res) {
    let list = new Array();
    fs.readdir("images/pictures/", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (file) {
            list.push(file);
        });
        res.render('gallery', { list : list });
    });
}

module.exports.scholarlist_get = function (req, res) {
    console.log('Request for Scholar list page recieved');
    const sqlSelect = "SELECT * FROM scholar";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        res.render('allscholars', { data : result });
    })
}

module.exports.scholarlist_compact_get = function (req, res) {
    console.log('Request for Scholar list page recieved');
    const sqlSelect = "SELECT * FROM scholar";
    dbconn.conn.query(sqlSelect, (err, result) => {
        if(err) throw err;
        res.render('compactList', { data : result });
    })
 }

 module.exports.new_scholar_get = function (req, res) {
    console.log('Request for New Scolar page recieved');
    res.render('newscholar');
  }

module.exports.new_scholar_post = function (req, res) {
    var formData = { username : req.body.username, account : req.body.account, email : req.body.email, 
        scholar_ronin : req.body.scholar_ronin, manager_ronin : req.body.manager_ronin, start_date : req.body.start_date, picture : req.file.filename,
        note : req.body.note, password : req.body.password, manager_idmanager : Number(req.body.manager) };
    formData = api.checkApostrophe(formData);
    const sqlPut = "INSERT INTO scholar SET ? ";
    const query = dbconn.conn.query(sqlPut, formData, (err, results) => {
        if(err) throw err;
        console.log("New Scholar created " + formData.username);
        res.redirect('/allscholars');
    })
}

module.exports.edit_scholar = function (req, res) {
    const id = req.params.id;
    var formData = { username : req.body.username, account : req.body.account, email : req.body.email, 
        scholar_ronin : req.body.scholar_ronin, manager_ronin : req.body.manager_ronin, start_date : req.body.start_date,
        note : req.body.note, password : req.body.password, manager_idmanager : Number(req.body.manager) };
    formData = api.checkApostrophe(formData);
    const sqlUpdate = "UPDATE scholar SET username='"+formData.username+"', account='"+formData.account+"', email='"+formData.email+"', scholar_ronin='"+formData.scholar_ronin+"', manager_ronin='"+formData.manager_ronin+"', start_date='"+formData.start_date+"', note='"+formData.note+"', password='"+formData.password+"', manager_idmanager='"+formData.manager_idmanager+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect('/allscholars');
    })
}  

module.exports.delete_scholar = function (req, res) {
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
}

module.exports.save_edit_scholar = function (req, res) {
    const id = req.params.id;
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        const getObj = result[0];
        res.render('editscholar', { data : getObj });
    })
}
module.exports.select_profile_scholar = function (req, res) {
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
            console.log("Scholar " + getScholar.username + " selected");
            api.rankings().then((result) =>  {
            res.render('profile', { data : getScholar, scholarRankingsList : result,
                 scholUSD : calc[0], scholDKK : calc[1], scholSLP : calc[2], 
                 manUSD : calc[3], mandkk : calc[4], manslp : calc[5], dkk : dkk, usd : usd });
            })
        })
    });
}

module.exports.profile_earned = function (req, res) {
    const id = req.params.id;
    // Get scholar to calculate avg earning
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        let getScholar = result[0];
        // Get scholar data from form
        let total_slp = Number(req.body.slp_earned) + Number(getScholar.total_slp_account);
        let total_earning = Number(getScholar.total_earning) + Number(req.body.slp_earned);
        let total_slp_account =+ Number(req.body.slp_earned);
        // Update total_earning and pass it to the function
        var avgPerDay = api.AverageEarnings(getScholar.start_date, total_earning);
        const sqlUpdate = "UPDATE scholar SET total_slp_account='"+total_slp+"', total_earning='"+total_earning+"', last_month_earning='"+total_slp_account+"', avg_earning='"+avgPerDay+"' WHERE idscholar='"+id+"'";
        dbconn.conn.query(sqlUpdate, (err, result) => {
            if(err) throw err;
            res.redirect(`/profile/${id}`);
        })
    })
}
//Withdraw from earnings
module.exports.select_earned_withdraw = function (req, res) {
    const id = req.params.id;
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => {
        if(err) throw err;
        let getScholar = result[0];
        let total_earning = Number(getScholar.total_earning) - Number(req.body.profile_earned_withdraw);
        var avgPerDay = api.AverageEarnings(getScholar.start_date, total_earning);
        const sqlUpdate = "UPDATE scholar SET total_earning='"+total_earning+"', avg_earning='"+avgPerDay+"' WHERE idscholar='"+id+"'";
        dbconn.conn.query(sqlUpdate, [id], (err, result) => { 
            if(err) throw err;
            console.log(result);
            res.redirect(`/profile/${id}`);
        })
    });
}
// withdraw from account
module.exports.profile_withdrawn = function (req, res) {
    const id = req.params.id;
    const sqlSelect = "SELECT * FROM scholar WHERE idscholar = ? ";
    dbconn.conn.query(sqlSelect, [id], (err, result) => { 
        if(err) throw err;
        let getScholar = result[0];
        let total_slp = Number(getScholar.total_slp_account - req.body.slp_account_withdrawn);
        const sqlUpdate = "UPDATE scholar SET total_slp_account='"+total_slp+"' WHERE idscholar='"+id+"'";
        dbconn.conn.query(sqlUpdate, (err, result) => {
            if(err) throw err;
            console.log(result);
            res.redirect(`/profile/${id}`);
        })
    })

}

module.exports.profile_cut = function (req, res) {
    const id = req.params.id;
    const formData = { scholar_cut : req.body.scholar_cut  };
    console.log(formData.slp_account)
    const sqlUpdate = "UPDATE scholar SET scholar_cut='"+formData.scholar_cut+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
}

module.exports.profile_change_picture = function (req, res) {
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
}

module.exports.profile_edit_note = function (req, res) {
    const id = req.params.id;
    var note = { note : req.body.note }
    note = api.checkApostrophe(note)
    const sqlUpdate = "UPDATE scholar SET note='"+note.note+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.redirect(`/profile/${id}`);
    })
}

module.exports.profile_change_axie1 = function (req, res) {
    const id = req.params.id;
    const formData = { axie_1 : req.body.axie_1 };
    console.log(formData.axie_1)
    const sqlUpdate = "UPDATE scholar SET axie_1='"+formData.axie_1+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
}

module.exports.profile_change_axie2 = function (req, res) {
    const id = req.params.id;
    const formData = { axie_2 : req.body.axie_2 };
    console.log(formData.axie_2)
    const sqlUpdate = "UPDATE scholar SET axie_2='"+formData.axie_2+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
}

module.exports.profile_change_axie3 = function (req, res) {
    const id = req.params.id;
    const formData = { axie_3 : req.body.axie_3 };
    console.log(formData.axie_3)
    const sqlUpdate = "UPDATE scholar SET axie_3='"+formData.axie_3+"' WHERE idscholar='"+id+"'";
    dbconn.conn.query(sqlUpdate, [id], (err, result) => {
        if(err) throw err;
        res.redirect(`/profile/${id}`);
    })
}