var jwt    = require('jsonwebtoken');
var md5 = require('md5');
var mongoose = require('mongoose');
var Jobseeker = require('../models/jobseeker');
var JobPosting = require('../models/jobposting');
var Company = require('../models/company');
var ScheduledInterview = require('../models/ScheduledInterview');
var Test = require('../models/test');
var PreTest = require('../models/pre_test');

module.exports = function(app,checkJobAuth) {

app.post('/jobseeker_login',(req, res) => {

  Jobseeker.findOne({
    email: req.body.email
  }, function(err, user) {
    console.log(user);
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // to convert json values into double quoted string
      user = JSON.stringify(user);
      user = JSON.parse(user);    
      //res.json({'user':user});  
      if(typeof req.body.social!=="undefined")  {
        enc_password = req.body.password;
      }else{
        enc_password = md5(req.body.password);
      }
            
      if (user.password != enc_password) {        
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var payload = {
          jobseeker: true
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }

  });
});

app.post('/jobseeker_social_login',(req, res) => {

  Jobseeker.findOne({
    provider_user_id: req.body.provider_user_id
  }, function(err, user) {
    console.log(user);
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // to convert json values into double quoted string
      user = JSON.stringify(user);
      user = JSON.parse(user);    
      //res.json({'user':user});  
  // if user is found and password is right
        // create a token
        var payload = {
          jobseeker: true
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      
    }

  });
});

app.get('/savedjob/:id',checkJobAuth,(req, res) => {

       JobPosting.find({'bookmark.jobseeker_id': mongoose.Types.ObjectId(req.params.id),'status':'Active'})
  .populate('company_profile_id','company_name company_logo')
  .select('bookmark.$.jobseeker_id technology company_profile_id.company_name company_profile_id.company_logo job_title salary salary1 employer_id education industry experience city country job_desc salary_as_per_industry  curr_type compensation job_level job_type date_created')
            .exec(function(error, jobpost) {
              res.json({ jobpost: jobpost});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/savedjob_count/:id',checkJobAuth,(req, res) => {

       JobPosting.count({'bookmark.jobseeker_id': mongoose.Types.ObjectId(req.params.id),'status':'Active'})
          .exec(function(error, savedjob) {
              res.json({ savedjob: savedjob});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});
app.get('/deletesavejob/',checkJobAuth,(req, res) => {
    let id=mongoose.Types.ObjectId(req.query.p_ide)
    console.log(req.query.p_ide);
    console.log(req.query.j_id);
      // JobPosting.findByIdAndUpdate(id, {$pull:{"bookmark.$.jobseeker_id":mongoose.Types.ObjectId(req.query.j_id)}},{multi: true},)
      JobPosting.update({_id: id},  
       {$pull: {'bookmark':{ 'jobseeker_id': mongoose.Types.ObjectId(req.query.j_id) } } })
      .exec(function(error, jobpost) {
              res.json({ jobpost: jobpost});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/appliedjob/:id',checkJobAuth,(req, res) => {

       JobPosting.find({'applied.jobseeker_id': mongoose.Types.ObjectId(req.params.id),'status':'Active'})
  .populate('company_profile_id','_id company_name company_logo')
  .select('applied.$.jobseeker_id job_type expiry_date technology company_profile_id._id company_profile_id.company_name company_profile_id.company_logo  job_title salary salary1 employer_id education industry experience city date_created job_desc fun_area')
            .exec(function(error, jobpost) {
              res.json({ jobpost: jobpost});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/appliedjob_count/:id',checkJobAuth,(req, res) => {

       JobPosting.count({'applied.jobseeker_id': mongoose.Types.ObjectId(req.params.id),'status':'Active'})
        .exec(function(error, applied) {
              res.json({ applied: applied});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});


app.get('/test_list_count/',checkJobAuth,(req, res) => {
          //console.log(req.query.id)
          Test.aggregate([
          { $unwind : "$candidates" },
          {$match: {
          "candidates.jobseeker_id": mongoose.Types.ObjectId(req.query.id),
          "candidates.finished":false,
          is_deleted:false
          }},
          { $group: {
          _id: '',
          count: { $sum: 1 }
          }
          }],function(err,results) {
           // console.log(results);
          if(err){
          res.json({"success":false,"data":0});
          }
          if(results.length > 0){
          res.json({"success":true,"data":results[0].count});
          }
          else{
          res.json({"success":false,"data":0});
          }
          });
});
app.get('/deleteappliedjob/',checkJobAuth,(req, res) => {
    let id=mongoose.Types.ObjectId(req.query.p_ide)
    console.log(req.query.p_ide);
    console.log(req.query.j_id);
      // JobPosting.findByIdAndUpdate(id, {$pull:{"bookmark.$.jobseeker_id":mongoose.Types.ObjectId(req.query.j_id)}},{multi: true},)
      JobPosting.update({_id: id},  
       {$pull: {'applied':{ 'jobseeker_id': mongoose.Types.ObjectId(req.query.j_id) } } })
      .exec(function(error, jobpost) {
              res.json({ jobpost: jobpost});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/upcominginterviews/',checkJobAuth,(req, res) => {
      var cDate = new Date();
           ScheduledInterview.find({'jobseeker_id': mongoose.Types.ObjectId(req.query.j_id),'interview_date':{'$gte':cDate }})
           .populate("job_post_id",'city job_title job_type company_profile_id fun_area')
           //.deepPopulate("job_post_id.company_profile_id")
           //.select('id city')
            .exec(function(error, scheduled) {
              res.json({ scheduled: scheduled});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/upcominginterviews_count/',checkJobAuth,(req, res) => {
      var cDate = new Date();
           ScheduledInterview.count({'jobseeker_id': mongoose.Types.ObjectId(req.query.j_id),'interview_date':{'$gte':cDate }})
           //.deepPopulate("job_post_id.company_profile_id")
           //.select('id city')
            .exec(function(error, scheduled_count) {
              res.json({ scheduled_count: scheduled_count});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/deleteinterview/',checkJobAuth,(req, res) => {
    let id=mongoose.Types.ObjectId(req.query.sc_id)
      // JobPosting.findByIdAndUpdate(id, {$pull:{"bookmark.$.jobseeker_id":mongoose.Types.ObjectId(req.query.j_id)}},{multi: true},)
      ScheduledInterview.remove({_id: id})
      .exec(function(error, jobpost) {
              res.json({ jobpost: jobpost});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});

app.get('/recommendedjob/',checkJobAuth,(req, res) => {
  var cDate = new Date();
    let id=mongoose.Types.ObjectId(req.query.js_id)
      // JobPosting.findByIdAndUpdate(id, {$pull:{"bookmark.$.jobseeker_id":mongoose.Types.ObjectId(req.query.j_id)}},{multi: true},)
      Jobseeker.findOne({_id: id})
      .exec(function(error, jobpost) {
        jobpost = JSON.stringify(jobpost);
      jobpost = JSON.parse(jobpost);  
      if(typeof jobpost.personal_info!= 'undefined'){
        if(typeof jobpost.personal_info.keyword!='undefined'){
          var keyword=jobpost.personal_info.keyword ;
        }else{
          var keyword=null;
        }
       }else{
        var keyword=null;
       }
      //var keyword=JSON.parse(keyword);
      //var keyword=keyword.split("|");
	regex=[];
	if(keyword){
	regex = keyword.map(function (e) { return new RegExp(e,"i"); });
	}
      //regex = keyword.map(function (e) { return new RegExp(e,"i"); });
      //console.log(regex);
      	// { $regex: new RegExp("^" + keyword +".*$","i") }
//{ $regex: new RegExp("^" +keyword+"$","i") }
             JobPosting.find({"technology": { "$in": regex },'expiry_date':{'$gte':cDate },'status':'Active','is_approved':true})
             .populate('company_profile_id','company_name company_logo')
  .select('job_type expiry_date technology company_profile_id.company_name company_profile_id.company_logo job_title salary salary1 employer_id education industry experience city state country date_created job_desc fun_area job_level job_catagory')
                       
            .exec(function(error, recommendedjob) {
             // console.log(recommendedjob);
              res.json({ recommendedjob: recommendedjob});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
   });
});

app.get('/recommendedjob_count/:id',checkJobAuth,(req, res) => {
  var cDate = new Date();
    let id=mongoose.Types.ObjectId(req.params.id)      // JobPosting.findByIdAndUpdate(id, {$pull:{"bookmark.$.jobseeker_id":mongoose.Types.ObjectId(req.query.j_id)}},{multi: true},)
      Jobseeker.findOne({_id: id})
      .exec(function(error, jobpost) {
        jobpost = JSON.stringify(jobpost);
      jobpost = JSON.parse(jobpost);
       //console.log(jobpost);  
       if(jobpost['personal_info']){
        if(typeof jobpost.personal_info.keyword!='undefined'){
          var keyword=jobpost.personal_info.keyword ;
        }else{
          var keyword=null;
        }
       }else{
        var keyword=null;
       }
      
      //var keyword=JSON.parse(keyword);
      //var keyword=keyword.split("|");
	regex=[];
	if(keyword){
	regex = keyword.map(function (e) { return new RegExp(e,"i"); });
	}
      
      //console.log(keyword);
      
             JobPosting.count({"technology": { "$in": regex },'expiry_date':{'$gte':cDate },'status':'Active','is_approved':true})
             .populate('company_profile_id','company_name')
  .select('job_type expiry_date technology company_profile_id.company_name job_title salary salary1 employer_id education industry experience city date_created job_desc fun_area')
                       
            .exec(function(error, recommendedjob) {
             // console.log(recommendedjob);
              res.json({ recommendedjob: recommendedjob});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
   });
});
app.post('/deny_interview',checkJobAuth,(req, res) => {
if(req.body.id){
 ScheduledInterview.update({_id: mongoose.Types.ObjectId(req.body.id)},  
       {$set: {'status':'denied' } })
      .exec(function(error, deny) {
              res.json({ deny: deny});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
    }else{

res.json({ error: "Error Id Is Not Provided"});

}
});

app.post('/confirm_interview',checkJobAuth,(req, res) => {
//console.log(req.body.id);
  if(req.body.id){
 ScheduledInterview.update({_id: mongoose.Types.ObjectId(req.body.id)},  
       {$set: {'status':'accepted' } })
      .exec(function(error, accept) {
    console.log(accept)
              res.json({ accept: accept});
               //console.log(JSON.stringify(posts, null, "\t"))
   });

}else{

res.json({ error: "Error Id Is Not Provided"});

}
});


app.get('/deny_interview',checkJobAuth,(req, res) => {
if(req.body.id){
 ScheduledInterview.update({_id: mongoose.Types.ObjectId(req.body.id)},  
       {$set: {'status':'denied' } })
      .exec(function(error, deny) {
              res.json({ deny: deny});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
    }else{

res.json({ error: "Error Id Is Not Provided"});

}
});

app.get('/confirm_interview',checkJobAuth,(req, res) => {
console.log(req.body.id);
  if(req.body.id){
 ScheduledInterview.update({_id: mongoose.Types.ObjectId(req.body.id)},  
       {$set: {'status':'accepted' } })
      .exec(function(error, accept) {
              res.json({ accept: accept});
               //console.log(JSON.stringify(posts, null, "\t"))
   });

}else{

res.json({ error: "Error Id Is Not Provided"});

}
});


app.post('/schedule_interview',checkJobAuth,(req, res) => {
  if(req.body.id){
 ScheduledInterview.update({_id: mongoose.Types.ObjectId(req.body.id)},  
       {$set: {'reschedule_request_date':new Date(req.body.interview_date*1000),'reschedule_request':1} })
      .exec(function(error, scheduled) {
              res.json({ scheduled: scheduled});
               //console.log(JSON.stringify(posts, null, "\t"))
   });

}else{

res.json({ error: "Error Id Is Not Provided"});

}
});

app.get('/test_list/',checkJobAuth,(req, res) => {
          console.log(req.query.id)
           Test.find({'candidates.jobseeker_id': mongoose.Types.ObjectId(req.query.id),'is_deleted':false},{'candidates.$.jobseeker_id':1,'name':1,'is_active':1,'questions':1})
           .populate('company_profile_id','company_name')
           .sort({'candidates.expected_date':'desc'})
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":0});
            }
          }
        });
});

app.get('/test_detail/:test_id/:jobseeker_id',checkJobAuth,(req, res) => {
	//console.log(req.params)
           Test.find({'_id':mongoose.Types.ObjectId(req.params.test_id),'candidates.jobseeker_id': mongoose.Types.ObjectId(req.params.jobseeker_id),'is_deleted':false})
           .populate('employer_id','email fname')
           .select('candidates.$.jobseeker_id name questions employer_id')
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":""});
            }
          }
        });
});

app.get('/jobseeker_answers_detail/:test_id/:jobseeker_id',checkJobAuth,(req, res) => {
  var test_id = req.params.test_id;
  var jobseeker_id = req.params.jobseeker_id;
  
  if(test_id && jobseeker_id){
    
  /*
  ///// Tried aggregate ////////  
  Test.aggregate([  
  {$match: {
    "_id": mongoose.Types.ObjectId(test_id),
    "candidates.jobseeker_id": mongoose.Types.ObjectId(jobseeker_id),
    "is_deleted":false,
  }},
  
  ],function(err,results) {
    console.log(result);
    if(err){
      res.json({"success":false,"data":0});
    }
    if(results.length > 0){
      res.json({"success":true,"data":results});
    }
    else{
      res.json({"success":false,"data":0});
    }
  });
  ///// Tried aggregate ////////
  */
  Test.findOne(
    {
      '_id':mongoose.Types.ObjectId(test_id),
      'candidates.jobseeker_id':mongoose.Types.ObjectId(jobseeker_id),
      'is_deleted':false},
    {
      'name':1,'questions':1,
      'candidates.jobseeker_id.$': 1,
      'candidates.answers':1,
      'candidates.expected_date':1,
      'candidates.finished':1,
      'candidates.finished_on':1,
      'candidates.resulted':1
    })
    .populate({
      path: 'candidates.jobseeker_id',
      select: 'fname lname email mobile personal_info.city',
    })    
    .exec(function (err, test) {
      if(err){
        res.json({"success":false,"message":"Not found"});
      }
      else{
        if(test){
          test = JSON.stringify(test);
          test = JSON.parse(test);          
          res.json({"success":true,"message":"Data found","data":test});
        }
        else{
          res.json({"success":false,"message":"Not found"});
        }
      }
      
    });
  }
  else{
    res.json({"success":false,"message":"Please provide test id and jobeeker id"});
  }
});

app.get('/pre_test_detail/:job_post_id',checkJobAuth,(req, res) => {
  console.log(req.params)
           PreTest.find({'job_post_id':mongoose.Types.ObjectId(req.params.job_post_id)})
           .populate('employer_id','email fname')
           .populate('company_profile_id','company_name')
           //.select('candidates.$.jobseeker_id name questions employer_id')
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":""});
            }
          }
        });
});

app.get('/pre_test_detail_get/:_id/:jobseeker_id',checkJobAuth,(req, res) => {
  console.log(req.params)
           PreTest.findOne({'_id':mongoose.Types.ObjectId(req.params._id),'candidates.jobseeker_id': mongoose.Types.ObjectId(req.params.jobseeker_id),'is_deleted':false},{
      'name':1,'questions':1,'job_post_id':1,
      'candidates.jobseeker_id.$': 1,
      'candidates.answers':1,
      'candidates.expected_date':1,
      'candidates.finished':1,
      'candidates.finished_on':1,
      'candidates.resulted':1
    })
           .populate('employer_id','email fname')
           .populate('company_profile_id','company_name')
           //.select('candidates.$.jobseeker_id name questions employer_id')
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":""});
            }
          }
        });
});


app.get('/pre_test_list/',checkJobAuth,(req, res) => {
          console.log(req.query.id)
           PreTest.find({'candidates.jobseeker_id': mongoose.Types.ObjectId(req.query.id),'is_deleted':false},{'candidates.$.jobseeker_id':1,'name':1,'is_active':1})
           .populate('company_profile_id','company_name')
           //.populate('job_post_id','job_title')
           .sort({'candidates.expected_date':'desc'})
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":0});
            }
          }
        });
});


app.get('/pre_jobseeker_answers_detail/:test_id/:jobseeker_id',checkJobAuth,(req, res) => {
  var test_id = req.params.test_id;
  var jobseeker_id = req.params.jobseeker_id;
  
  if(test_id && jobseeker_id){
    
  /*
  ///// Tried aggregate ////////  
  Test.aggregate([  
  {$match: {
    "_id": mongoose.Types.ObjectId(test_id),
    "candidates.jobseeker_id": mongoose.Types.ObjectId(jobseeker_id),
    "is_deleted":false,
  }},
  
  ],function(err,results) {
    console.log(result);
    if(err){
      res.json({"success":false,"data":0});
    }
    if(results.length > 0){
      res.json({"success":true,"data":results});
    }
    else{
      res.json({"success":false,"data":0});
    }
  });
  ///// Tried aggregate ////////
  */
  PreTest.findOne(
    {
      '_id':mongoose.Types.ObjectId(test_id),
      'candidates.jobseeker_id':mongoose.Types.ObjectId(jobseeker_id),
      'is_deleted':false},
    {
      'name':1,'questions':1,
      'candidates.jobseeker_id.$': 1,
      'candidates.answers':1,
      'candidates.expected_date':1,
      'candidates.finished':1,
      'candidates.finished_on':1,
      'candidates.resulted':1
    })
    .populate({
      path: 'candidates.jobseeker_id',
      select: 'fname lname email mobile personal_info.city',
    })    
    .exec(function (err, test) {
      if(err){
        res.json({"success":false,"message":"Not found"});
      }
      else{
        if(test){
          test = JSON.stringify(test);
          test = JSON.parse(test);          
          res.json({"success":true,"message":"Data found","data":test});
        }
        else{
          res.json({"success":false,"message":"Not found"});
        }
      }
      
    });
  }
  else{
    res.json({"success":false,"message":"Please provide test id and jobeeker id"});
  }
});

app.post('/jobseeker_auto_login',(req, res) => {

  Jobseeker.findOne({
    email: req.body.email
  }, function(err, user) {
    //console.log(user);
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // to convert json values into double quoted string
      user = JSON.stringify(user);
      user = JSON.parse(user);    
      //res.json({'user':user});  
      // if user is found and password is right
      // create a token
        var payload = {
          jobseeker: true
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });      
    }

  });
});

};
