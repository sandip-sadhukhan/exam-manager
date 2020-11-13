const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session')
const dotenv = require('dotenv');
const path = require('path');

if(process.env.NODE_ENV != 'production'){
    dotenv.config();
}

// Passport Config
require('./utils/passport-config')(passport);

// Load our model
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const examRouter = require('./routes/exam');

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("Mongodb connected.."))
.catch(e => console.log(e));

// Initilize our app
const app = express();

// Express middlewars
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// passport middlewars
app.use(session({
    secret: process.env.SESSION_TOKEN,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next()
})

// Ejs middlewars
app.set('view engine', 'ejs');

// Use routes
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/exam', examRouter);


// listen on port
const port = 5000;
app.listen(port, () => console.log(`Server is live on port ${port}`));
