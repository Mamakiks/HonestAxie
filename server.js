const express = require('express');
const path = require('path');
const routes = require('./routes');
const dotenv = require('dotenv');

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));




dotenv.config();


// Set the default views directory to html folder
app.set('views', path.join(__dirname, 'html'));

// Set the folder for css, java scripts & images
app.use(express.static(path.join(__dirname,'CSS')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'images')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', routes);

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running at ${process.env.SERVER_PORT}`);
});
