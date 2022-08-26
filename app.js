var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const bodyParser=require('body-parser')
var hbs=require('express-handlebars')
const fileUpload = require('express-fileupload');
const multer = require('multer');
var nodemailer = require('nodemailer');
var upload = multer({ dest: 'uploads/' });
var db=require('./config/connection');
var session=require('express-session');
 
 
 
var id=require('./routes/admin');
const router = require('./routes/users');
const ConnectMongoDBSession = require('connect-mongodb-session');
 
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname +'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(fileUpload());
 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"key",cookie:{maxAge:60000} ,resave:false, Rolling:true, saveUninitialized:false}));
app.use(express.static(path.join(__dirname, 'public')));
process.env.PWD=app.use(express.static(process.env.PWD +'./public/product-images/')); 
app.use(express.static(`${__dirname}/product-images`));
app.use('/images', express.static('images'));

app.use('/', userRouter);
app.use('/admin', adminRouter);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
 
  
   



  db.connect((err)=>{
    if(err)
    console.log('Connection Error');
    else
    console.log('Database Connected')
  } )

app.use(fileUpload( ));
  


 
  
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
