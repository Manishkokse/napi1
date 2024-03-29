var jwt    = require('jsonwebtoken'); 

module.exports = function(req, res, next){
	
	var app = req.app;
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				
				
				if(typeof decoded.employer!=='undefined' && decoded.employer===true){
					return next();					
				}
				else{
					return res.json({ success: false, message: 'Unauthorized Employer' });		
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
