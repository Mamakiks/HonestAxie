const fs = require('fs');
const multer = require('multer');
const api = require('../services/api');

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




module.exports.upload = upload;