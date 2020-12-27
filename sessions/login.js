var express = require('express');
const session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 2000;
var MongoClient = mongodb.MongoClient;
var ejs = require('ejs');
var ObjectID = require('mongodb').ObjectID;
const MongoStore = require('connect-mongo')(session);
const { v4: uuidv4 } = require('uuid');

const TWO_HOURS = 1000 * 60 * 60 * 2 // in milliseconds

const{
  PORT = 2000,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_LIFETIME = TWO_HOURS, // milliseconds, by default : cookie will expire when browser is closed
  SESS_SECRET = 'thisismysecret'
  // store : // be default memorystore, 
} = process.env

const IN_PROD = NODE_ENV === 'production' // true in production, false in development


// use DB here
// const users = [ // hash passords
//       { id:'1', username : 'sapalep1', password:'sapalep1'},
//       { id:'2', username : 'sapalep2', password:'sapalep2'},
//       { id:'3', username : 'sapalep3', password:'sapalep3'}
// ]

var app = express();

// initially, session contains only the cookie no data
app.use(session({

  name : SESS_NAME,
  resave : false, // forces the session to be saved back to the store, by default is true, false: now we are not storing 
  saveUninitialized : false, // Forces a session that is "uninitialized" to be saved to the store, false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie
  secret : SESS_SECRET, // secret used to sign the session ID cookie. signature will be based on content of cookie, if content of cookie is modified they will no longer match the signature of the cookie
  store: new MongoStore({
    client : MongoClient,
    url : 'mongodb://localhost:27017/',
    ttl : SESS_LIFETIME
  }),
  cookie : { // by default http only
    maxAge: SESS_LIFETIME, // after which the cookie expires , to use when calculating the Expires Set-Cookie attribute
    sameSite: true, // true will set the SameSite attribute to Strict for strict same site enforcement
    secure: IN_PROD // true only in production mode, false in development mode
    
  }
}
))

// REDIRECT METHODS

const redirectLogin = (req,res, next) =>{
  // if we do not have a userid, means its still uninitialised
  if(!req.session.userId){
    res.redirect('/login'); // if not authenticated
  }
  else{
    req.session.counter = 0
    console.log("counter in redirectlogin", req.session.counter);
    next() // if authenticated go to home route
  }
}

const redirectHome = (req,res, next) =>{
  
  if(req.session.userId){
    req.session.counter +=1
    console.log("counter in redirectHome", req.session.counter);
    res.redirect('/home'); // if authenticated, go to home page
  }
  else{
    next() // if not authenticated, proceed with normal cycle
  }
}

// ROUTES

app.use(express.static(path.resolve(__dirname, 'public')));
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // changed to true

// app.use(express.static(path.resolve(__dirname, 'public')));

// which route to display on localhost: 2000/ , based on user is logged in or not
app.get('/', (req, res) => {
 const {userId} = req.session
 console.log("my current session",req.session);
 console.log("my userid",userId) // if we do this without starting a session, says undefined, because a session has not started for any user
  //  Session {
  //   cookie: {
  //     path: '/',
  //     _expires: 2020-12-15T21:39:12.931Z,
  //     originalMaxAge: 7200000,
  //     httpOnly: true,
  //     sameSite: true,
  //     secure: false
  //   }
  // }

  // id userid : show home page, logout button
  // else show login page 

  if (userId){ // is already logged in
    res.redirect('/home');
  }
  else {
    res.redirect('/login'); // if not logged in go to get method
  }
});

// executes before any routes, this can be used for multiple routes

// app.use((req,res,next)=>{
//  const {userId} = req.session
//  console.log("In app.use this is my session", req.session)
//  // if valid session, grab id from session
//  if(userId){
//   // shared among all routes
//   MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//     var db = client.db('test');
//     db.collection('users').find(ObjectID(userId)).toArray()
//       .then(function(user_data){
//         // assign current object to res.locals
//         res.locals.user = {
//           userId : userId,
//           username : user_data[0].username
//         }

//         console.log("my locals");
//         //res.redirect('/home'); // redirect to home if authenticated
//         console.log('after /home in app.use')
//     })// end of outer if
//     .catch((e) => {
//       console.log("problem in app.use route to get res.locals");
//       console.log(e);
//     });
    
//   });
//  }

//    console.log("in else part");
//    next()
 
// })

// For page 3 : home page
// this is going to be for "play" and "create" button page 
// go to homepage, pass only username

app.get('/home', redirectLogin, (req,res)=>{ // so this is a protection against home route

  // const user = users.find(user => user.id === req.session.userId) // this has to be done in every route hence we create app.use
  console.log('in /home route')
  const{userId} = req.session;
  const{username} = req.session;
 
  var user_data = {
                userId : userId,
                username : username
              }
  // console.log("this is my users", user)
  console.log("this is my home page ", userId);
  res.render('home',{data : user_data});
  //res.redirect('/logout');
  //res.redirect('/logout');

})


// page 1 : 
// if user is already logged in they will be redirected to home page, so showing login page is not needed
app.get('/login',redirectHome, (req,res) =>{


  var blank_data = ''
  res.render('login',{data:blank_data})
  //   res.sendFile('login.html', {
  //     root: path.join(__dirname, './public/') // creates path to access the login.html file
  // });
});


// page 2 : 
// register route
app.get('/register', redirectHome, (req, res) => {

  // submit data as blank {}
  var blank_data = ''
  res.render('register',{data:blank_data})

//   res.sendFile('register.html', {
//     root: path.join(__dirname, './public/') // creates path to access the login.html file
// });

});

// login only when u are not authenticate, if already logged in, redirectHome
app.post('/login', redirectHome,(req,res) =>{

  // starting a new session ?? 
  console.log("in post / login route", req.body); // contains username and password
  // in login post { username: 'sapalep1', password: 'sapalep1' }

  const { username, password } = req.body // grab username and password from req.body in same variable names

  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  // check is username password exist in DB
      var db = client.db('test');
      db.collection('users').find({$and : [{ "username":  username},{"password": password}]}).count()
        .then(function(count){

          if(count == 1){

            db.collection('users').find({$and : [{ "username":  username},{"password": password}]}).toArray()
            .then(function(existing_user){

              console.log(existing_user);
           
                // assign userId to session object, userid  is present in users array
                req.session.userId = existing_user[0]._id
                req.session.username = existing_user[0].username
                return res.redirect('/home'); // redirect to home if authenticated
          
          })
          .catch((e) => { // catch for inner db query
            console.log("problem in getting count");
            console.log(e);
          });
        } // end of if

          else{ // no user found
            // if login fails - AJAX call here
            var data = 'Worng username or password';
            res.render('login',{data})
            // res.redirect('/login'); // redirects to get method of login by default????
          } // end of else

        })
    .catch((e) => {
      console.log("problem in post /login route");
      console.log(e);
     });

  }); // end of outer if
});


// page 2 : register route ( POST )
// makes sense to add new user only when not aunthenticated
// TODO : AJAX call when username password already exists

// app.post('/ajax-register', redirectHome,(req,res) =>{

//   console.log("request body in AJAX call")
//   console.log(req.body)
//   const { username, password } = req.body // request body has username and passowrd

//   // if user does not exist, add to DB and redirect to home page
//   // else redirect to register ( think of Ajax call here )

//   console.log("my request body to be inserted in users", req.body)
//   MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//     if (err) throw err;

//     var db = client.db('test');

//     db.collection('users').find({"username": username}).count()
//     .then(function(count){

//       console.log("count for ajax call", count)
//       if(count == 0){
//         console.log("in if for ajax call")
//         res.redirect('/postregister');
       
//       }
//       else{
//         res.send('existing')
        
//       }

//     });


// });


// page 2 :  register route
app.post('/register', redirectHome,(req,res) =>{

  console.log("request body normal")
  const { username, password } = req.body // request body has username and passowrd

  // if user does not exist, add to DB and redirect to home page
  // else redirect to register ( think of Ajax call here )

  console.log("my request body to be inserted in users", req.body)
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw err;

    var db = client.db('test');

    db.collection('users').find({"username": username}).count() // commented
    .then(function(count){

      console.log("count found in DB in user", count)

      if(count == 0){ // new user : add user to DB and assign userID as ObjectID in DB  // commented

        db.collection('users').insertOne(req.body, function (findErr, result) {
          if (findErr) throw findErr;

          console.log("new user : request body in register",req.body); // this contains _id
          console.log('my new userid', req.body._id);
          req.session.userId = req.body._id; // for now userid is username
          req.session.username = req.body.username;
          console.log("my updated session data after registration",req.session)
          res.redirect('/home');

        });
       
      } 
      else {   // some user already exists ( double registration )
      
        // AJAX call here
        // if anything fails, show error message : query string errors - error.auth.userExists

        // console.log("already exists");
        // res.send('existing');
        //console.log('after sending response back to register.html');

        // res.render for existing
        data = 'Oops! Sorry, try a different username or password';
        res.render('register',{data:data})
        //res.redirect('/register');
      } // commented
      
      })
      .catch((e) => {
        console.log("problem in getting count in post /register route");
        console.log(e);
       });

  });
});


// page 3 ( make/play) to page 4 : 
// decide where to go create or play
// onclick for create and play
// this is from a href
app.get('/home/:todo', redirectLogin, function (req, res) {
  console.log("came from creategraoups.ejs", req.body);
  var todo = req.params.todo;
  console.log("parameter passed is", todo)
  const{userId} = req.session;
  const{username} = req.session;
  var user_data = {
    userId : userId,
    username : username
  }

  var course_id_list = [] // for play mode
  var allCourses = [] // for play mode
  
  
console.log("this is my create group page, check userId", userId);

  if(todo == "create"){

    // send courses along with user_data if collection exists

    // fetch for teacherdata in mongo here, if it exists, pass courses, else pass only the object
    // TODO : check "user-id" format here
    // this is form data
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;

        var db = client.db('test');    
        db.collection('teacherdata').find({"user-id": userId}).count()
            .then(
                function(count) {
                console.log("count of data found", count);
                console.log(userId);

                if(count == 1){ // collection found

                    db.collection('teacherdata').find({"user-id": userId}).toArray()
                    .then(function(teacherdata_doc){

                        var teacherdata_doc_obj = teacherdata_doc[0] // gets object
                        console.log("existing courses  in teacherdata to be passed",teacherdata_doc_obj.courses); // array of courses
                        // append the course object to user_data
                        var courses = "courses"
                        user_data[courses] = teacherdata_doc_obj.courses

                        console.log("updated request with courses",user_data);
                        res.render('displaygroups',{data : user_data});
                        //res.render('displaygroups',{data : JSON.parse(req.body.userdata)});
                    })
                    .catch((e) => {
                        console.log("error in finding course");
                        console.log(e);
                    }); 
        
                }

            // course not found ( probably can put this in catch TODO** later)
            else  {
              console.log("no user found, just send userid and username", user_data);
              res.render('displaygroups',{data : user_data});
            }
                
            })
            .catch((e) => {
                console.log("error in getting count");
                console.log(e);
            }); 

    });
  }
  else if(todo == 'play') {
        // TODO : check for userid in the future ??
        // TODO : add user id in the database when student attempts the quiz ??
        // check for student username in the the studentdata collection

        //one way : 
        // take user_id, get all courses from course array
        // find owner in quizdata
        // and then user course_id and owner_id to search course_no and course_name in
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;

      var db = client.db('test'); 

        // check if username exists in student data ( possible it will, because student is forced to login )
        db.collection('studentdata').find({"username": username}).count()
            .then(function(count) {
                console.log("count of data found", count);
                console.log(userId)
                
                if(count == 1){ // student collection found
                  
                    // query 1 : find courses list in studentdata collection
                    db.collection('studentdata').find({"username": username}).toArray()
                    .then(function(studentdata_doc){

                        var studentdata_doc_obj = studentdata_doc[0] // gets object
                        duplicate_studentdata_doc_obj = studentdata_doc_obj
                        console.log("existing courses  in studentdata to be passed",studentdata_doc_obj.courses); // array of course_ids
                        course_id_list = studentdata_doc_obj.courses // global variable : course_id_list
                        console.log("this is my user data",course_id_list) 
                      })
                    .catch((e) => {
                        console.log("error in finding course");
                        console.log(e);
                    });
                  //} // commented here
                  
                  //for(var i = 0; i < studentdata_doc_obj.courses.length; i++ ){ // array of ids
                  // query 2 : get courses from teacherdata and compare with courselist to get no and name
                  console.log("just before aggregate query")
                    db.collection('teacherdata').aggregate([{$unwind:"$courses"}]).toArray()
                      .then(function(eachObject){
                          console.log("inside for loop query",eachObject);
                          // allCourses.push(eachObject);
                          // console.log("push this to user_data",allCourses);
                          // return allCourses;
                          return eachObject;
                      })
                      .then(function(allCourses){
                        var render_courses = []
                        console.log("inside second then",allCourses) // array of full objects
                        console.log("course_id_list",course_id_list) // array of ids

                        for(var i = 0; i < course_id_list.length; i++ ){
                          console.log("current course_id in array", course_id_list[i]);
                          var id_list_course = JSON.stringify(course_id_list[i])

                          for(j=0; j<allCourses.length; j++){
                            console.log("current course_id in allCourses", allCourses[j].courses);
                            var full_course = JSON.stringify(allCourses[j].courses.course_id)

                            if(full_course == id_list_course){
                              console.log("Pass this courses object", allCourses[j].courses )
                              render_courses.push(allCourses[j].courses)
                              break;
                            }
                          console.log("I am out")
                          }
                        }

                      user_data["courses"] = render_courses
                      console.log("my user_data",user_data)
                      console.log("check the passing object", render_courses);
                      res.render('playedgroups', {data:user_data})
                    })
                    .catch((e) => {
                      console.log("error in finding course_id");
                      console.log(e);
                    });  // end of query 
      
                  }
                  else { // no student collection found
                    res.render('playedgroups', {data:user_data})

                  }
          }); 
      })// end of Mongo client
    
      console.log("outside")
    }

  else { // logout path
    console.log("here in else for logging out")
    res.redirect('/logout');
  }

});


// For page 4 :
// processes data and diplays on the same page, not a new page
// AJAX call to check if course exists in teacher data

// create new teacher collection if it does not exist, else update courses in the correct teacher collection
// gets course data from the form

app.post('/home/ajaxpostcourses',  redirectLogin, function(req,res) {
  console.log('came from ajax call',req.body);
 //  res.send('success');

 // if( req.body.course_name == "" || req.body.course_no == "" ) {
 //     console.log("field blank");
 //     res.send("blank"); // may insert "blank" in response packet
 //     res.send("update")
 // }
 // else {

 console.log("request body for /ajaxpostcourses route", req.body); // contains course_no and name
 const{userId} = req.session;
 const{username} = req.session;
 var user_data = {
   userId : userId,
   username : username
 }

 console.log("user_data in ajaxpostcourses",user_data)
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
  
        var db = client.db('test');

 
        // ask*** , need any more field in find query
        db.collection('teacherdata').find({"user-id": userId}).count()
        .then(
         function(count) {
           console.log("count of data found", count);
 
           if(count == 1){ // teacher collection found
 
             // check if courses exists, send course_error
 
             db.collection('teacherdata').find({"user-id": userId}).toArray()
             .then(function(teacherdata_doc){
 
               var teacherdata_doc_obj = teacherdata_doc[0] // gets object
               console.log("my current courses in teacherdata",teacherdata_doc_obj.courses); // array of courses
 
               // if course already exists : show error
             
               // console.log("my new insert value",req.body.course_no );
               console.log("check request body here", req.body);
 
              // how to do this using $in ask***
              // check if course_no and course_name already exists in DB for this user_id
               var update = true
               for (i=0; i < teacherdata_doc_obj.courses.length; i++) {
                   console.log(teacherdata_doc_obj.courses[i].course_no);
 
                 if (teacherdata_doc_obj.courses[i].course_no == req.body.course_no && teacherdata_doc_obj.courses[i].course_name == req.body.course_name ){
                     console.log("return this : course already exists");
                     // res.send('404');
                     // res.send("error log", 404);
                     // res.status('course exists').send(req.body)
                     res.send('course_error');
                     
                     update = false
                     break
               }
 
             }
 
               // else update courses field with new course
               console.log("update value", update)
               if (update){
                 teacherdata_doc_obj.courses.push({
                   "course_id": uuidv4(),
                   "course_no" : req.body.course_no,
                   "course_name" : req.body.course_name
                }) // push in courses array of object
  
                console.log("my added courses",teacherdata_doc_obj.courses); // gives array of
                console.log("updated object?",teacherdata_doc);
                
                // how can this be avoided??, I want to update in above promise , ask***
                db.collection('teacherdata').updateOne({
                      "user-id": userId},
                      {$set: {"courses" : teacherdata_doc_obj.courses}}
                  )
                  .then(function(check){
                    console.log("my teacherdata successful?",check);
                  })
                 res.send('success');
                 // res.status(status).send(body)
               } // end of if
               
               
             })
           }
           
           else { // create collection
             db.collection('teacherdata').insertOne({
                     "user-id": userId,
                     "courses" : [
                       { "course_id" : uuidv4(),
                         "course_no" : req.body.course_no,
                         "course_name" : req.body.course_name
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
// create quiz and display previous quizzes for specific group

// TODO : by default : If a quiz does not exist, just show create quiz button
// TODO : if quiz exists, pull all previous quizzes and show three buttons ( q1, try, grade )
// TODO : for now only q1 and grade buttons

app.get('/create/groups/:course', function(req,res){ // course_id as query parameter
  console.log("came from displaygroups.ejs to go to displayquizzes", req.body);
  var checkparams = req.params;
  var checkquery = req.query;
  console.log(checkparams) // { course: 'check1-check1' }
  console.log(checkquery) // { course_id: 'b115c339-8d3b-46e0-ac38-0cf9d1416688' }
  // res.send('true');

  const{userId} = req.session;
  const{username} = req.session;
  var course_data = {
    userId: userId,
    username : username,
    // password : req.body.groupdata['password'],
    course_id : req.query.course_id,
    course : req.params.course
}

console.log("use this data to search all quizzes in quizdata collection", course_data);

MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  if (err) throw err;
  var db = client.db('test');

  // ask*** , need any more field in find query
  // db.collection('quizdata').find({"login-id": data.user_id}).count()
  // .then(function(count){

   //db.collection('quizdata').find({"user_id": data.user_id},{"course_id": data.course_id}).toArray()
   // TODO : in the future do not fetch for user id, only course id is okay - Done?
   // TODO : change user_id to owner_id - Done?

   // this query executes, if not found, just appends empty quizdata

   // Now we do not need $and query, since course_ids are unique
   // db.collection('quizdata').find({$and : [{ "owner_id":  userId},{"course_id":course_data.course_id}]}).toArray()
   db.collection('quizdata').find({"course_id":course_data.course_id}).toArray()
   .then(function(quizdata){
       console.log("this is my data from db", quizdata); // this is an array of quiz objects
       console.log("length",quizdata.length);


        // quiz name and title
        var quizzes = []
        for(i=0 ; i<=quizdata.length-1;i++){
            var quiz = {
                quiz_id : quizdata[i]._id,
                quiz_title : quizdata[i].title // this is the name that appears on the display quiz page
            }

            quizzes.push(quiz);
            console.log("this is my array", quizzes);
        }
            course_data["quizzes"] = quizzes;
            console.log("final data to be sent to render in displayquizzes", course_data);
            res.render('displayquizzes',{data : course_data});
            //res.send('true');

        })
        .catch((e) => {
        console.log("probably no past quizzes");
        //console.log("error in getting count");
        console.log(e);
      });

});

});


// page 6
// display quizzes to create quizzes
// send data to page 6 from page 5
// username, password, user_id, course_id, course_name
// TODO :  pass coursename along with course id
// TODO : probably I do not need to send quiz id here
// TODO : change user id to owner id

app.get('/createquiz/:course', function(req,res){

  console.log("came from displayquizzes to create quizzes", req.body);

  const{userId} = req.session;
  const{username} = req.session;
  var checkparams = req.params;
  var checkquery = req.query;

  console.log(checkparams);
  console.log(checkquery);
  console.log("request body to page 6 ", req.body)

  // just userid, username, course_id and course_name
   // do  not send quiz id

  var course_data = {
    userId: userId,
    username : username,
    course_id : req.query.course_id,
    course : req.params.course
}

  console.log("use this to create quiz", course_data);
  res.render('createquiz',{data : course_data});
})


// page 6
// save quiz data in DB and go back to page 5
//TODO: check if quiz name is already present in DB

app.post('/submitquiz/:course', function (req, res) { // course_id in query strings

  const{userId} = req.session;
  const{username} = req.session;
  var course_id = req.query.course_id; 
  var course = req.params.course;

  console.log(req.body)
  console.log("querystrings", req.query) // { course_id: 'b115c339-8d3b-46e0-ac38-0cf9d1416688' }
  console.log("params", req.params) // { course: 'check1-check1' }
  req.body["ques_ans_data"] = JSON.parse(req.body["ques_ans_data"]);
  //res.send('Quiz Data received:\n' + JSON.stringify(req.body));
  console.log(req.body) // correct format

//   console.log("text", text);
//   console.log(typeof(text));
//   var parsed_text = JSON.parse(text);
//   console.log("parsed_text", parsed_text);
//   console.log(typeof(parsed_text));

// commented from here

data = {
    owner_id : userId,
    course_id :  req.query.course_id,
    title : req.body["title"],
    points : req.body["points"],
    quizdata : req.body["ques_ans_data"]
};

console.log("This data to be put in DB",data)


  // query to insert data
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;
    var db = client.db('test');
    db.collection('quizdata').insertOne(data, function (findErr, result) {
      if (findErr) throw findErr;
      console.log('I am printing on line 72');
      // display all quizzes for that course
      var link = '/create/groups/' + course + "?course_id=" + course_id;
      res.redirect(link);
    
    });
  
  });

});

/********************Student routes************************* */


// page S4 -  S5 : 
// for displaying grades, with quiz links( quiz ids ), from studentdata
// TODO : course_name as parameter course_id as query string, 
app.get('/play/groups/:course', function(req,res){ 
  console.log("came from playedgroups.ejs to go to playedquizzes", req.body);

  var course = req.params.course
  var course_id = req.query.course_id

  console.log("course passed by parameter", course)
  console.log("course_id passed by parameter", course_id)

 const{userId} = req.session;
 const{username} = req.session;
 var user_data = {
   userId : userId,
   username : username,
   course : req.params.course
 }
 var quiz_ids = []
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;
    var db = client.db('test');

      // query 1 : 
      // take course_id
      // look into grades array for those course_ids and gather quiz ids
      // get all quiz ids in form of an array
    db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.course_id": course_id,"username":username}}]).toArray()
    .then(function(grades_list) {
      console.log(grades_list) // array of grades object
      for(var i = 0; i < grades_list.length; i++ ){
        // quiz_ids.push(ObjectID(grades_list[i].grades.quiz_id))
        //console.log(ty(grades_list[i].grades.quiz_id))
        quiz_ids.push(JSON.stringify(grades_list[i].grades.quiz_id))
      }
      console.log("quiz_ids",quiz_ids)  
      
      //return quiz_ids
    })
    //.then(function(quiz_ids_array) {

    // query 2 :
    // use these quizids to gather title from quizdata
    // query quiz ids with title name
    db.collection('quizdata').find({}).toArray()
    .then(function(quizdata_array){

      console.log("this is my quiz_ids array", quiz_ids)
      //var quiz_id_object = quizdata_array.find(function(quiz,index){
      console.log(quizdata_array);
      console.log(quizdata_array.length)

// commented**********

      // for(var i = 0; i < quizdata_array.length; i++ ){
        
      //   var quizdata_array_obj = quizdata_array[i]; // one entire object
      //   console.log("one object",quizdata_array_obj)
      //   console.log("id in quizdata_array",quizdata_array_obj._id)

      //   var stringified_quizdata = JSON.stringify(quizdata_array_obj._id)

      //   console.log("stringified",stringified_quizdata , typeof(stringified_quizdata));

      //   // var x = quiz_ids.includes(stringified_quizdata)

      //   // '5fe666a52aaedc40d812bd50'
      //   //var x = quiz_ids.includes("5fe666a52aaedc40d812bd50")
      //   var x = quiz_ids.includes(stringified_quizdata)


      //   console.log(x)

      // //   if(quiz_ids.includes(stringified_quizdata)){

      // //     console.log("found this", quizdata_array_obj.course_id)
      // //     console.log("found the right quiz",quizdata_array_obj)
      // //   }
      // }

      played_quizzes = []
      for(var i = 0; i < quiz_ids.length; i++ ){

        // if-else is not needed because definitely played quizid will be present in quizdata collection
        console.log("found")
        var quiz_obj = quizdata_array.find(q => JSON.stringify(q._id) == quiz_ids[i])
        console.log(quizdata_array.find(q => JSON.stringify(q._id) == quiz_ids[i]))//quiz_ids[i]))

        var quiz = {
          quiz_id : JSON.parse(quiz_ids[i]), // parsed because id in the link appears to be a string http://localhost:4000/"5fe666a52aaedc40d812bd50"  // other option:  quiz_id in playedquizzes.ejs will be parsed on front end
          quiz_title : quiz_obj.title
        }
        played_quizzes.push(quiz)

      }

      // pass to playedquizzes.ejs
      // userDI, username, quiz names and quiz ids
      user_data["quizzes"] = played_quizzes
      console.log(user_data);
      res.render('playedquizzes',{data:user_data});
    })
    .catch((e) => {
      console.log("there is an error in finding past quizzes");
      console.log(e);
    });

  });
});



// page S5 - S6
// quiz attempt link

app.get('/play/:course/:quizid', redirectLogin, function (req, res) {
  console.log("came from playedquizzes.ejs for quiz link ", req.body);
  var quizid = req.params.quizid;
  var course = req.params.course;
  console.log("parameter passed is", quizid , course)

  const{userId} = req.session;
  const{username} = req.session;

  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;
    var db = client.db('test');

    db.collection('quizdata').find({"_id": ObjectID(quizid)}).toArray()
    .then(function(quizdata){
        console.log("this is my data from db", quizdata); // this is an array of quiz objects

        quizdata_obj = quizdata[0]
        var quiz_data = {
          userId : userId,
          username : username,
          course : course,
          course_id : quizdata_obj.course_id,
          quizid : quizdata_obj._id,
          title : quizdata_obj.title,
          points : quizdata_obj.points,
          quizdata : quizdata_obj.quizdata
        }

        console.log("This is passed to playquiz.ejs",quiz_data);
        res.render('playquiz.ejs',{data:quiz_data})
        //res.send(true)

    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    });
    
      //res.send(true)
  });
});


// page S5 - S6
// quiz grades link

app.get('/grades/:quizid', redirectLogin, function (req, res) {
  console.log("came from playedquizzes.ejs for grades link", req.body);
  var quizid = req.params.quizid;
  console.log("parameter passed is", quizid)

const{userId} = req.session;
const{username} = req.session;
var user_data = {
  userId : userId,
  username : username
}

});


// logout on every page
app.get('/logout',redirectLogin, (req,res) =>{ // make sure you are aunthenticated

  console.log('before destroy ', req.session);

  // destroys session with data
  req.session.destroy(err =>{

    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie(SESS_NAME); // clear cookie when session ends
    console.log('after', req.session);
    res.redirect('/login');
  })
  
})

//********************************************************** */



app.get('/register-data', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;

    var db = client.db('test');
    db.collection('courses').find({}).toArray(req,res).then(function(courses) {
      console.log("courses from db", courses)
      res.render('register',{data : courses});
  }); 
  
  });

});


  app.post('/post-user-data',  function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;

      var db = client.db('test');

      db.collection('logindata').insertOne(req.body, function (findErr, result) {
        if (findErr) throw findErr;

        console.log("request",req.body);
        console.log('I am printing on line 101');

        //res.send('Login data received:\n' + JSON.stringify(req.body));
        
        client.close(req,res);
      }); 

      var myObj = {
        login_id : req.body._id,
        // login_id : req.body.ObjectId(req,res).stringify,
        courses : req.body.courses,
        grades : []

      }

      db.collection('studentdata').insertOne(myObj, function (findErr, result) {
        if (findErr) throw findErr;

        console.log("myObj",myObj);
        console.log('I am printing on line 121');

        // res.send('Student data received:\n' + JSON.stringify(req.body));
        res.send('Login data received:\n' + JSON.stringify(req.body));
        
        client.close(req,res);
      })
      // .catch((e) => {
      //           console.log("there is an error in grabbing data to mongodb");
      //           console.log(e);
      //       });

      }); // mongo client closes here
  });


// app.get('/view-feedbacks',  function(req, res) {
//   MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//     if (err) throw err;

//     var db = client.db('test');
//     db.collection('quizdata').find({}).toArray(req,res).then(function(quizdata) {
//       //console.log("req body", req.body);
//       // var x = res.json(quizdata).length;
//       // console.log(x);
//       //console.log("quizdata", res.status(200).json(quizdata[quizdata.length - 1]));
//       // res.status(200).json(quizdata[quizdata.length - 1]);
//       res.render('index.ejs',{quizdata: i}


//     })
//     .catch((e) => {
//         console.log("there is an error in grabbing data to mongodb");
//         console.log(e);
//     });
// });
// });

app.listen(process.env.PORT || 2000, process.env.IP || '0.0.0.0' );
