const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

dotenv.config();

// Set the default views directory to html folder
app.set('views', path.join(__dirname, 'html'));

// Set the folder for css & images, controllers and modules
app.use(express.static(path.join(__dirname,'CSS')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'controllers')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

var loginRouter = require('./routes/login');
var indexRouter = require('./routes/index');

app.use('/', loginRouter);
app.use('/', indexRouter);

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running at ${process.env.SERVER_PORT}`);
});
