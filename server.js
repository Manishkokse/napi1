var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors = require('cors');
var jwt    = require('jsonwebtoken'); 
var config = require('./config/config');
var API_KEY = "oxjkTZsQr*Mpl54N&73#WqfYls@fdsw";
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);
var db = mongoose.connect(config.database,{
  useMongoClient:true,
});
db.on('error', console.error.bind(console, 'connection error:'));
app.set('superSecret', config.secret); // secret variable
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.all('*',function(req,res,next){
    var key = req.headers['api-key'] || null;
	if(key == API_KEY){
		next();
	}
	else{
	 return res.sendStatus(401);
	}
});
/*
app.all('/*', function(req, res,next) {
	var key = req.headers['api-key'] || null;
	if(key == API_KEY){
		next();
	}
	else{
	 res.status(404).json({error:'Bad or Unauthorized Request'});
	}	
	//console.log(key);	
});
*/

app.get('/', function(req, res) {
	res.json({ message: 'Welcome to the jobaxy' });
});

var checkJobAuth = require('./config/checkJobAuth');
var checkEmpAuth = require('./config/checkEmpAuth');

require('./routes/front_end')(app);
require('./routes/jobseeker')(app,checkJobAuth);
require('./routes/employer')(app,checkEmpAuth);




var port = process.env.PORT || 3210;
app.listen(port);
console.log('listening on http://localhost:'+port);
