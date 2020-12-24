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
    res.sendFile('login.html', {
      root: path.join(__dirname, './public/') // creates path to access the login.html file
  });
});


// page 2 : 
// register route
app.get('/register', redirectHome, (req, res) => {
  // res.send('register.html')
  res.sendFile('register.html', {
    root: path.join(__dirname, './public/') // creates path to access the login.html file
});

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
  db.collection('users').find({$and : [{ "username":  username},{"password":password}]}).toArray()
    .then(function(existing_user){

      console.log(existing_user);
      if(existing_user){
        // assign userId to session object, userid  is present in users array
        req.session.userId = existing_user[0]._id
        req.session.username = existing_user[0].username
        return res.redirect('/home'); // redirect to home if authenticated
      }

    // if login fails - AJAX call here
    res.redirect('/login'); // redirects to get method of login by default????
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
       
      } // commented
      else {
        // some user already exists ( double registration )
        // AJAX call here
        // if anything fails, show error message : query string errors - error.auth.userExists

        // console.log("already exists");
        // res.send('existing');
        //console.log('after sending response back to register.html');

        // res.render for existing 
        res.redirect('/register');
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
// console.log("this is my users", user)
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
    // render playedgroups
    // res.render('playedgroups',{data : user_data});
    console.log("playedgroups , render groups groups for which quiz is already played")
  }
  else {
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

app.get('/create/groups/:course', function(req,res){
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
  var checkparams = req.params;
  var checkquery = req.query;

  console.log(checkparams);
  console.log(checkquery);
  console.log("request body to page 6 ", req.body)
  // do  not send quiz id
  // var course_data = {
  //     owner_id: req.body.group_cw_data['owner_id'], // this is the owner id
  //     username : req.body.group_cw_data['username'],
  //     course_id : req.body.group_cw_data['course_id']
  // }

  // just userid, username, course_id and course_name
  const{userId} = req.session;
  const{username} = req.session;
  var course_data = {
    userId: userId,
    username : username,
    course_id : req.query.course_id,
    course : req.params.course
}

  console.log("use this to create quiz", course_data);
  res.render('createquiz',{data : course_data});
})

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
