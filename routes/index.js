const express = require('express');
const router = express.Router();
const upload = require('../services/fileUpload');
const loginCon = require('../controllers/loginController');
const indexCon = require('../controllers/indexController');

router.get('/', loginCon.checkAuthenticated, indexCon.home_get);

router.get('/allscholars', loginCon.checkAuthenticated, indexCon.scholarlist_get);

router.get('/compactList', loginCon.checkAuthenticated, indexCon.scholarlist_compact_get);

router.get('/newscholar', loginCon.checkAuthenticated, indexCon.new_scholar_get);
//change to /newscholar
router.post('/save', loginCon.checkAuthenticated, upload.upload.single('picture'), indexCon.new_scholar_post);

router.get('/select/:id', loginCon.checkAuthenticated, indexCon.save_edit_scholar);

router.post('/edit/:id', loginCon.checkAuthenticated, indexCon.edit_scholar);

router.post('/delete/:id', loginCon.checkAuthenticated, indexCon.delete_scholar);

router.get('/profile/:id', loginCon.checkAuthenticated, indexCon.select_profile_scholar);

router.post('/profile_earned/:id', loginCon.checkAuthenticated, indexCon.profile_earned);

router.post('/profile_withdrawn/:id', loginCon.checkAuthenticated, indexCon.profile_withdrawn);

router.post('/profile_cut/:id', loginCon.checkAuthenticated, indexCon.profile_cut);

router.post('/profile_earned_withdraw/:id', loginCon.checkAuthenticated, indexCon.select_earned_withdraw);

router.post('/changePicture/:id', loginCon.checkAuthenticated, upload.upload.single('picture'), indexCon.profile_change_picture);

router.post('/editNote/:id', loginCon.checkAuthenticated, indexCon.profile_edit_note);

router.post('/change_axie_1/:id', loginCon.checkAuthenticated, indexCon.profile_change_axie1);

router.post('/change_axie_2/:id', loginCon.checkAuthenticated, indexCon.profile_change_axie2);

router.post('/change_axie_3/:id', loginCon.checkAuthenticated, indexCon.profile_change_axie3);

module.exports = router;