var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 8000
var MongoClient = mongodb.MongoClient;
var ejs = require('ejs');
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

        //res.send('Login data received:\n' + JSON.stringify(req.body));

        // res.sendFile('loginpage.html', {
        //     root: path.join(__dirname, './public/') // creates path to access the login.html file
        // });

        // res.sendFile(path.join(__dirname + '/public/loginpage.html'));

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
// TODO : by default : If a collection does not exist, just show create button
// TODO : if collection exists, pull all previous groups and show on create groups page
// request body will contain : login object [{"_id":"5fcdb756153cbf35ace9bee1","username":"sapalep","password":"sapalep"}]


app.post('/get-home-data/post-create-groups', function (req, res) {

  
    console.log('user Data received:\n' , req.body.userdata);
    res.render('creategroups',{data : JSON.parse(req.body.userdata)});
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

// click on "+" button
// TODO : insert a new document in teacher collection, if the document does not exist

// test route

app.post('/test', function (req, res) {

    console.log("this is my current test object", req.body);
 //    console.log("this is my current registration", res.body);
    
    var dummy = JSON.parse(req.body.userdata);
    console.log(dummy);
    req.body.userdata = dummy;


    // test data received: {"group_no":"testno","group_name":"testname","userdata":{"_id":"5fcdb756153cbf35ace9bee1","username":"sapalep","password":"sapalep"}}
    // db.teacherdata.find({"user-id":"test"},{"courses":1}).pretty()

    // res.send('test data received:\n' + JSON.stringify(req.body));


     MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
       if (err) throw err;
 
       
       var db = client.db('test');
       db.collection('teacherdata').find({"user-id": req.body.userdata["_id"]}).count()
       .then(
        function(count) {
          console.log("count of data found", count);

          if(count == 1){

            db.collection('teacherdata').find({"user-id": req.body.userdata["_id"]},{"courses": 1}).toArray()
            .then(function(teacherdata_doc){

              var teacherdata_doc_obj = teacherdata_doc[0] // gets object
              console.log("my current courses in teacherdata",teacherdata_doc_obj.courses);

              teacherdata_doc_obj.courses.push({
                 "course_no" : req.body.group_no,
                "course_name" : req.body.group_name
              }) // push in courses array of object

              console.log("my added courses",teacherdata_doc_obj.courses); // gives array of
              console.log("updated object?",teacherdata_doc);

              // how can this be avoided??, I want to insert in above promise
              db.collection('teacherdata').insertOne({
                "user-id": req.body.userdata["_id"],
                "courses" : teacherdata_doc_obj.courses
            })
            .then(function(check){
              console.log("my teacherdata successful?",check);
            })
            })
          }
          
          else {
            db.collection('teacherdata').insertOne({
                    "user-id": req.body.userdata["_id"],
                    "courses" : [
                      { "course_no" : req.body.group_no,
                        "course_name" : req.body.group_name
                      }
                    ]
                   
                })
                .then(function(userdata){
                  console.log("my teacherdata in else",userdata);
                })
                .catch((e) => {
                    console.log("some error in inserting new data");
                    console.log(e);
                });
          }
        })
       .catch((e) => {
              console.log("error in getting count");
              console.log(e);
      }); 
      
      res.send('test data received:\n' + JSON.stringify(req.body));
      });
});
  
      //  if (x==0) {

      //   db.collection('teacherdata').insertOne({
      //       "user-id": req.body.userdata["_id"],
      //       "group_no" : req.body.group_no,
      //       "group-name" : req.body.group_name
      //   })
      //   .then(function(userdata){

      //     console.log("my teacherdata in else",userdata);
      //   })
      //   .catch((e) => {
      //       console.log("some error in inserting new data");
      //       console.log(e);
      //   });

      //  }

      //  else {

      //   db.collection('teacherdata').find({"user-id": req.body.userdata["_id"]}).toArray()
      //   .then(function(userdata){

      //     console.log("my teacherdata in else",userdata);
      //   })
      //   .catch((e) => {
      //       console.log("some error in finding existing data");
      //       console.log(e);
      //   });
      // }
       

       



      //  db.collection('users').insertOne(req.body, function (findErr, result) {
      //   if (findErr) throw findErr;

      //   console.log("request",req.body);
      //   console.log('I am printing on line 101');
      //   res.send(true);
      // });



    //    .then(function(userdata) {
    //      console.log("userdata", userdata[0].courses[0]) // gives courses
         
         
    //  })
    //  .catch((e) => {
    //                console.log("go back to login page, details not found");
    //                console.log(e);
    //            });
    // console.log("check", x);
 
 




app.listen(process.env.PORT || 8000, process.env.IP || '0.0.0.0' );