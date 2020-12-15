var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 8000
var MongoClient = mongodb.MongoClient;
var ejs = require('ejs');
const { resetWarningCache } = require('prop-types');
var ObjectID = require('mongodb').ObjectID;

var app = express();

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// Page 1  : 
// login page
app.get('/', (req, res) => {
    res.sendFile('loginpage.html', {
        root: path.join(__dirname, './public/') // creates path to access the login.html file
    });
});

// registrationpage to loginpage
// push registration data in DB and redirect to login page
// TODO : do not allow registration with same username
// TODO : do not allow duplicate registration ( same username and password ) - probably covered in above TODO
app.post('/',  function(req, res) {

    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;

      var db = client.db('test');
      db.collection('users').insertOne(req.body, function (findErr, result) {
        if (findErr) throw findErr;

        console.log("request",req.body);
        console.log('I am printing on line 101');
        res.send(true);
        // res.render("loginpage.html") - does not work
        // res.send('Login data received:\n' + JSON.stringify(req.body));
        // res.sendFile(path.join(__dirname + '/public/loginpage.html'));

        // if this is done, we go back to login page, but after every refresh data is inserted in DB

        res.sendFile('loginpage.html', {
            root: path.join(__dirname, './public/') // creates path to access the login.html file
        });

        client.close();
      }); 
    });

});

// page 2
// loginpage to registrationpage
app.get('/register-data', function (req, res) {
    res.sendFile('registerpage.html', {
        root: path.join(__dirname, './public/') // creates path to access the login.html file
    });

    // MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    
    //   if (err) throw err;
  
    //   var db = client.db('test');
    //   db.collection('courses').find({}).toArray().then(function(courses) {
    //     console.log("courses from db", courses)
    //     res.render('register',{data : courses});
    // }); 
    
    // });
  
  });

// page 3
// login page to home page
// TODO : if details in DB - go to homepage else show incorrect details on loginpage
// consider correct details for now
app.post('/post-home-data', function (req, res) { // why does this need to be post?

   console.log("this is my current registration", req.body);
//    console.log("this is my current registration", res.body);

//    res.send('user Data received:\n' + JSON.stringify(req.body));

    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;

      var db = client.db('test');
      db.collection('users').find({"username": req.body["username"], "password" : req.body["username"]}).toArray()
      .then(function(userdata) {
        console.log("userdata on line 89", userdata)
        res.render('homepage',{data : userdata[0]});
    })
    .catch((e) => {
                  console.log("go back to login page, details not found");
                  console.log(e);
              });
});

});

// page 4
// homepage to create groups
// TODO : by default : If a collection does not exist, just show create button on create groups page
// TODO : if collection exists, pull all previous groups and show on create groups page
// request body will contain : login object [{"_id":"5fcdb756153cbf35ace9bee1","username":"sapalep","password":"sapalep"}]


app.post('/get-home-data/post-create-groups', function (req, res) {

    console.log(JSON.parse(req.body.userdata));
    var user_course_data = JSON.parse(req.body.userdata);

    // after console log
    // user_course_data = {
    //             _id: '5fd2acd78dba975988352fea',
    //             username: 'sapalep1',
    //             password: 'sapalep1'
    // }

    console.log('user Data received from home page :\n' , user_course_data);
    console.log('user Data received from home page :\n' , user_course_data.username);
   

    
    // fetch for teacherdata in mongo here, if it exists, pass courses, else pass only the object
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;

        var db = client.db('test');    
        db.collection('teacherdata').find({"user-id": user_course_data._id}).count()
            .then(
                function(count) {
                console.log("count of data found", count);
                console.log(user_course_data._id);

                if(count == 1){ // collection found

                    db.collection('teacherdata').find({"user-id": user_course_data._id }).toArray()
                    .then(function(teacherdata_doc){

                        var teacherdata_doc_obj = teacherdata_doc[0] // gets object
                        console.log("existing courses  in teacherdata to be passed",teacherdata_doc_obj.courses); // array of courses
                        // append the course object to request body
                        var courses = "courses"
                        user_course_data[courses] = teacherdata_doc_obj.courses

                        console.log("updated request with courses",user_course_data);
                        res.render('creategroups',{data : user_course_data});
                        //res.render('creategroups',{data : JSON.parse(req.body.userdata)});
                    })
                    .catch((e) => {
                        console.log("error in finding course");
                        console.log(e);
                    }); 
        
                }

            // course not found ( probably can put this in catch TODO** later)
            else  res.render('creategroups',{data : user_course_data});
                
            })
            .catch((e) => {
                console.log("error in getting count");
                console.log(e);
            }); 

    });


 //    console.log("this is my current registration", res.body);
 
 //    res.send('user Data received:\n' + JSON.stringify(req.body));
 
//      MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//        if (err) throw err;
 
//        var db = client.db('test');
//        db.collection('logindata').find({"username": req.body["username"], "password" : req.body["username"]}).toArray()
//        .then(function(userdata) {
//          console.log("userdata", userdata)
//          res.render('creategroup',{data : userdata});
//      })
//      .catch((e) => {
//                    console.log("go back to login page, details not found");
//                    console.log(e);
//                });
//  });
 
});

// For page 4 :
// processes data and diplays on the same page, not a new page
// AJAX call to check if course exists in teacher data
 app.post('/get-home-data/postcourses', function(req,res) {
     console.log('came from ajax call',req.body);
    //  res.send('success');

    // if( req.body.course_name == "" || req.body.course_no == "" ) {
    //     console.log("field blank");
    //     res.send("blank"); // may insert "blank" in response packet
    //     res.send("update")
    // }
    // else {

     MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
           if (err) throw err;
     
           
           var db = client.db('test');
    
           // ask*** , need any more field in find query
           db.collection('teacherdata').find({"user-id": req.body["user_id"]}).count()
           .then(
            function(count) {
              console.log("count of data found", count);
    
              if(count == 1){ // collection found
    
                // check if courses exists
    
                db.collection('teacherdata').find({"user-id": req.body["user_id"]}).toArray()
                .then(function(teacherdata_doc){
    
                  var teacherdata_doc_obj = teacherdata_doc[0] // gets object
                  console.log("my current courses in teacherdata",teacherdata_doc_obj.courses); // array of courses
    
                  // if course already exists : show error
                
                  console.log("my new insert value",req.body.course_no );
    
    
                 // how to do this using $in ask***
                  var update = true
                  for (i=0; i < teacherdata_doc_obj.courses.length; i++) {
                      console.log(teacherdata_doc_obj.courses[i].course_no);
    
                    if (teacherdata_doc_obj.courses[i].course_no == req.body.course_no && teacherdata_doc_obj.courses[i].course_name == req.body.course_name ){
                        console.log("return this :  course already exists");
                        // res.send('404');
                        // res.send("error log", 404);
                        // res.status('course exists').send(req.body)
                        res.send('course_error');
                        
                        update = false
                        break
                  }
    
                }
    
                  // else update courses
                  console.log("update value", update)
                  if (update){
                    teacherdata_doc_obj.courses.push({
                      "course_no" : req.body.course_no,
                      "course_name" : req.body.course_name
                   }) // push in courses array of object
     
                   console.log("my added courses",teacherdata_doc_obj.courses); // gives array of
                   console.log("updated object?",teacherdata_doc);
                   
                   // how can this be avoided??, I want to update in above promise , ask***
                   db.collection('teacherdata').updateOne({
                         "user-id": req.body["user_id"]},
                         {$set: {"courses" : teacherdata_doc_obj.courses}}
                     )
                     .then(function(check){
                       console.log("my teacherdata successful?",check);
                       console.log("good response create <input>",check);
                     })
                    res.send('success');
                    // res.status(status).send(body)
                  } // end of if
                  
                  
                })
              }
              
              else { // create collection
                db.collection('teacherdata').insertOne({
                        "user-id": req.body["user_id"],
                        "courses" : [
                          { "course_no" : req.body.course_no,
                            "course_name" : req.body.course_name
                          }
                        ]
                       
                    })
                    .then(function(userdata){
                      console.log("my teacherdata in else",userdata);
                      console.log("good response create <input>",check);
                    })
                    .catch((e) => {
                        console.log("some error in inserting new data");
                        console.log(e);
                    });
                    res.send('success');
              }
            })
           .catch((e) => {
                  console.log("error in getting count");
                  console.log(e);
          }); 

          
          //res.send('test data received:\n' + JSON.stringify(req.body));
        });

    // } 

 });




 // page 5
// create groups to display quizzes

// TODO : by default : If a quiz does not exist, just show create quiz button
// TODO : if quiz exists, pull all previous quizzes and show three buttons ( q1, try, grade )
// TODO : for now only q1 and grade buttons

// request body will contain : 
// login object
// {"_id":"5fcdb756153cbf35ace9bee1","username":"sapalep","password":"sapalep", courseid : }
// so that for a specific user, with a specific course in quizdata, all quizzes can be pulled
// courseid : "course_no" + "-" + "course_name"
// TODO : generate these courses using autogenerated id
// pass courseid as params

// {"groupdata": {"_id":"5fd2acd78dba975988352fea",
//                 "username":"sapalep1",
//                 "password":"sapalep1",
//                 "courses":[{"course_no":"check","course_name":"check"},
//                             {"course_no":"test1","course_name":"test1"},
//                             {"course_no":"checl","course_name":"chsjvsl"},
//                             {"course_no":"check1234","course_name":"check"},
//                             {"course_no":"test1","course_name":"ffdsggfr"}]},
// "course_id":"check-check"}

app.post('/post-display-quizzes', function(req,res){

    console.log("at the backend done", req.body);

    // body is received in string format
    req.body.groupdata = JSON.parse(req.body.groupdata); // removes 'id' -- id

    console.log("to be checked", req.body);
    console.log("this is my groupdata",req.body.groupdata );
    console.log('this is my courseid', req.body.course_id);
    // var group_quiz_data =  req.body
    // console.log(group_quiz_data._id)
    // console.log(group_quiz_data['_id']) // both works

    // pass this data to next page to render in textarea

    var data = {
        user_id: req.body.groupdata['_id'],
        username : req.body.groupdata['username'],
        password : req.body.groupdata['password'],
        course_id : req.body['course_id']
    }

    console.log("use this data for further process", data);


    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
           if (err) throw err;
     
           
           var db = client.db('test');
    
           // ask*** , need any more field in find query
        //    db.collection('quizdata').find({"login-id": data.user_id}).count()
        //    .then(function(count){

            //db.collection('quizdata').find({"user_id": data.user_id},{"course_id": data.course_id}).toArray()
            db.collection('quizdata').find({$and : [{ "user_id":  data.user_id},{"course_id":data.course_id}]}).toArray()
            .then(function(quizdata){
                console.log("this is my data from db", quizdata); // this is an array of quiz objects
                console.log("length",quizdata.length);


            var quiz_ids = []
            for(i=0 ; i<=quizdata.length-1;i++){
                var quiz_id = {
                    quiz_id : quizdata[i]._id,
                    quiz_name : quizdata[i].title // this is the name that appears on the display quiz page
                }

                quiz_ids.push(quiz_id);
                console.log("this is my array", quiz_ids);
            }
                data["quiz_ids"] = quiz_ids;
                console.log("final data", data);
                res.send(req.body);

           })
           .catch((e) => {
            console.log("error in getting quizdata");
            //console.log("error in getting count");
            console.log(e);
    });

});

});


 

// start for testing ---------------------------------------------------------------------
// click on "+" button
// TODO : insert a new document in teacher collection, if the document does not exist
// TODO : update document if it exists
// test route
// this was post earlier with form
app.get('/test', function (req, res) {

    console.log("this is my current test object", req.body);
 //    console.log("this is my current registration", res.body);
    
    var dummy = JSON.parse(req.body.userdata);
    console.log(dummy);
    req.body.userdata = dummy;
    console.log("printing in test route", req.body);

    res.send(true);

    // test data received: {"course_no":"testno","course_name":"testname","userdata":{"_id":"5fcdb756153cbf35ace9bee1","username":"sapalep","password":"sapalep"}}
    // db.teacherdata.find({"user-id":"test"},{"courses":1}).pretty()

    // res.send('test data received:\n' + JSON.stringify(req.body));

    /** commented from here */

    //  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    //    if (err) throw err;
 
       
    //    var db = client.db('test');

    //    // ask*** , need any more field in find query
    //    db.collection('teacherdata').find({"user-id": req.body.userdata["_id"]}).count()
    //    .then(
    //     function(count) {
    //       console.log("count of data found", count);

    //       if(count == 1){ // collection found

    //         // check if courses exists

    //         db.collection('teacherdata').find({"user-id": req.body.userdata["_id"]}).toArray()
    //         .then(function(teacherdata_doc){

    //           var teacherdata_doc_obj = teacherdata_doc[0] // gets object
    //           console.log("my current courses in teacherdata",teacherdata_doc_obj.courses); // array of courses

    //           // if course already exists : show error
            
    //           console.log("my new insert value",req.body.course_no );


    //          // how to do this using $in ask***
    //           var update = true
    //           for (i=0; i < teacherdata_doc_obj.courses.length; i++) {
    //               console.log(teacherdata_doc_obj.courses[i].course_no);

    //             if (teacherdata_doc_obj.courses[i].course_no == req.body.course_no && teacherdata_doc_obj.courses[i].course_name == req.body.course_name ){
    //                 console.log("return this :  course already exists");
    //                 update = false
    //                 break
    //           }

    //         }

    //           // else update courses
    //           console.log("update value", update)
    //           if (update){
    //             teacherdata_doc_obj.courses.push({
    //               "course_no" : req.body.course_no,
    //               "course_name" : req.body.course_name
    //            }) // push in courses array of object
 
    //            console.log("my added courses",teacherdata_doc_obj.courses); // gives array of
    //            console.log("updated object?",teacherdata_doc);
               
    //            // how can this be avoided??, I want to update in above promise , ask***
    //            db.collection('teacherdata').updateOne({
    //                  "user-id": req.body.userdata["_id"]},
    //                  {$set: {"courses" : teacherdata_doc_obj.courses}}
    //              )
    //              .then(function(check){
    //                console.log("my teacherdata successful?",check);
    //                console.log("good response create <input>",check);
    //              })

    //           } // end of if
              
    //         })
    //       }
          
    //       else { // create collection
    //         db.collection('teacherdata').insertOne({
    //                 "user-id": req.body.userdata["_id"],
    //                 "courses" : [
    //                   { "course_no" : req.body.course_no,
    //                     "course_name" : req.body.course_name
    //                   }
    //                 ]
                   
    //             })
    //             .then(function(userdata){
    //               console.log("my teacherdata in else",userdata);
    //               console.log("good response create <input>",check);
    //             })
    //             .catch((e) => {
    //                 console.log("some error in inserting new data");
    //                 console.log(e);
    //             });
    //       }
    //     })
    //    .catch((e) => {
    //           console.log("error in getting count");
    //           console.log(e);
    //   }); 
      
    //   res.send('test data received:\n' + JSON.stringify(req.body));
    // });
    /***commented until here***/
});

// end : for testing--------------------------------------------
  
      


app.listen(process.env.PORT || 8000, process.env.IP || '0.0.0.0' );