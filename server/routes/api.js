var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'secret';
module.exports = function(router){	
	//User registration
	router.post('/users', function(req, res){
		var user = new User();
		user.username = req.body.username;
		user.emailID = req.body.email;
		user.password = req.body.password;
		if(req.body.username == null || req.body.username == '' || req.body.email == null || req.body.email == '' || req.body.password == null || req.body.password == ''){
			res.json({success:'false',message:'Ensure Username, email and password were provided'});
		}else{
			user.save(function(err){
				if(err){
					res.json({success:'false',message:'Username or Email already Exist'});
				}
				else{
					res.json({success:'true',message:'User created successfully'});
				}
			});
		}
	});

	//User Login Route
	router.post('/authenticate', function(req,res){
		User.findOne({username:req.body.username}).select('emailID username password').exec(function(err,user){
			if(err) throw err;
			if(!user){
				res.json({success:false,message:'could not authenticate user'});			
			}else if (user){
				if(req.body.password){
					var validPassword = user.comparePasswords(req.body.password);		
				}else{
					res.json({success:false,message:'No password Provided'});			
				}				
				if(!validPassword){
					res.json({success:false,message:'could not authenticate user'});			
				}else{
					var token = jwt.sign({username:user.username, email:user.email},secret,{expiresIn: '24h'});
					res.json({success:true,message:'User Authenticates',token: token});			
				}
			}
		});
	});

	router.use(function(req, res, next){
		var token = req.body.token || req.body.query || req.headers['x-access-token'];
		if(token){
			jwt.verify(token,secret, function(err, decoded){
				if(err) {
					res.json({success:false, message: 'Token Invalid'});
				}else{
					req.decoded = decoded;
					next();
				}
			});
		}else{
			res.json({success:false, message: 'Token Not Found'});
		}
	});

	router.post('/me', function(req, res){
		res.send(req.decoded);
	});


//routes for skill set api
router.use("/skillset", require("../controllers/skillsetController.api"));

    //routes for resource set api
router.use("/resource", require("../controllers/resourceController.api"));

//routes for status api
router.use("/status", require("../controllers/statusController.api"));

//routes for designation api
router.use("/designation", require("../controllers/designationController.api"));

//routes for role api
router.use("/role", require("../controllers/roleController.api"));

//routes for region api
router.use("/region", require("../controllers/regionController.api"));

//routes for location api
router.use("/location", require("../controllers/locationController.api"));

//routes for project api
router.use("/project", require("../controllers/projectController.api"));

router.use("/holiday", require("../controllers/holidayListController.api"));

router.use("/leave", require("../controllers/leaveController.api"));

router.use("/resourceType", require("../controllers/resourceTypeController.api"));

router.use("/mappedresource", require("../controllers/resourceMappingController.api"));

router.use("/allocation", require("../controllers/allocationController.api"));
return router;
}