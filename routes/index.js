const express = require('express');
const router = express.Router();
const upload = require('../services/fileUpload');
const authCon = require('../controllers/authController');
const indexCon = require('../controllers/indexController');

var authRouter = require('./auth');
router.use('/', authRouter);
router.all('/', authCon.checkAuthenticated, indexCon.home_get);

router.get('/tools', authCon.checkAuthenticated, indexCon.tools_get);

router.get('/allscholars', authCon.checkAuthenticated, indexCon.scholarlist_get);

router.get('/compactList', authCon.checkAuthenticated, indexCon.scholarlist_compact_get);

router.get('/newscholar', authCon.checkAuthenticated, indexCon.new_scholar_get);

router.post('/save', authCon.checkAuthenticated, upload.upload.single('picture'), indexCon.new_scholar_post);

router.get('/select/:id', authCon.checkAuthenticated, indexCon.save_edit_scholar);

router.post('/edit/:id', authCon.checkAuthenticated, indexCon.edit_scholar);

router.post('/delete/:id', authCon.checkAuthenticated, indexCon.delete_scholar);

router.get('/profile/:id', authCon.checkAuthenticated, indexCon.select_profile_scholar);

router.post('/profile_earned/:id', authCon.checkAuthenticated, indexCon.profile_earned);

router.post('/profile_withdrawn/:id', authCon.checkAuthenticated, indexCon.profile_withdrawn);

router.post('/profile_cut/:id', authCon.checkAuthenticated, indexCon.profile_cut);

router.post('/profile_earned_withdraw/:id', authCon.checkAuthenticated, indexCon.select_earned_withdraw);

router.post('/changePicture/:id', authCon.checkAuthenticated, upload.upload.single('picture'), indexCon.profile_change_picture);

router.post('/editNote/:id', authCon.checkAuthenticated, indexCon.profile_edit_note);

router.post('/change_axie_1/:id', authCon.checkAuthenticated, indexCon.profile_change_axie1);

router.post('/change_axie_2/:id', authCon.checkAuthenticated, indexCon.profile_change_axie2);

router.post('/change_axie_3/:id', authCon.checkAuthenticated, indexCon.profile_change_axie3);

module.exports = router;