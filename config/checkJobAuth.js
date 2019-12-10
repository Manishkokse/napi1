var jwt    = require('jsonwebtoken'); 

module.exports = function(req, res, next){
	
	//res.end();
	var app = req.app;
//	console.log(req.body.token);
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	//console.log(token);
	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				
				//console.log(decoded);
				if(typeof decoded.jobseeker!=='undefined' && decoded.jobseeker===true){
					return next();					
				}
				else{
					return res.json({ success: false, message: 'Unauthorized Jobseeker' });		
				}
				
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});		
	}	
};
