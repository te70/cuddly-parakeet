const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override')
const connectDB = require('./config/db')
const mongoose  = require('mongoose')
const MongoStore = require('connect-mongo')
 
//load config
dotenv.config({ path: './config/config.env' })

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended:false }))
app.use(express.json())

//Method overide
app.use(methodOverride(function (req, res){
    if (req.body && typeof req.body === 'object'  && '_method' in req.body){
        //look in urlencode POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

//Logging
if (process.env.NODE_ENV === 'developmet') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')


//Handlebars
app.engine('.hbs', exphbs.engine({helpers:{ formatDate, stripTags, truncate, editIcon, select },defaultLayout:'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set global var
app.use(function (req, res, next){
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(`Server running ${process.env.NODE_ENV} mode on port ${PORT}`)
)