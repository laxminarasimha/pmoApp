var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT||3000;
var router = express.Router();
var appRoutes = require('./server/routes/api')(router);
var path = require('path');

app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public')); // Giving Access
app.use('/api',appRoutes);



//var mongodbUri = 'mongodb://laxmi:Laxmi123@ds119810.mlab.com:19810/pmodb';
var mongodbUri = 'mongodb://10.109.7.156:27017/pmodev';
var connection = mongoose.connect(mongodbUri, function(err) {	
	if(err){
		console.log('Not Connected to the databse:' + err);
	} else {
		console.log('Connection Successful');
	}
}); 




/*app.get('/', function(req, res) {
  res.send('Hello World');
});*/

app.get('*', function(req,res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
})
app.listen(port, function(){
	console.log('Running the Server on port : ' + port);
});

