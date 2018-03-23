const express 	= require('express');
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
var upload = require('express-fileupload');
const path = require('path');

const jwt    = require('jsonwebtoken'); 
const config = require('./config'); 

const user = require('./routes/user.js');
const filetransfer = require('./routes/filetransfer.js');

const port = process.env.PORT || config.serverport;

const app = express();
app.use(upload()); // configure middleware
// Enable CORS from client-side
app.use(function(req, res, next) {  
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if ('OPTIONS' === req.method) { res.sendStatus(204); } else { next(); }
  });

app.use(express.static(path.join(__dirname, 'public')));

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(require('body-parser').json({ type : '*/*' })); --> this can make error in JSON
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// basic routes
app.get('/', function(req, res) {
	res.send('Kaxet File transfer API is running at api-kxfiletrf:' + port + '/api');
});

// express router
var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRoutes.use(user.authenticate); // route middleware to authenticate and check token

// authenticated routes
apiRoutes.get('/', function(req, res) {
	res.status(201).json({ message: 'Welcome to the authenticated routes!' });
});

apiRoutes.post('/inputfileupload', filetransfer.inputfileupload); //API to upload input file
apiRoutes.post('/inputfiledelete', filetransfer.inputfiledelete); //API to delete input file

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// kick off the server 
app.listen(port);

console.log('Kaxet file transfer app is listening at api-kxfiletrf:' + port);