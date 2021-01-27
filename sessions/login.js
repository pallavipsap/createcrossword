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
// const { title } = require('process');
// const { func } = require('prop-types');

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
  console.log("My request body in redirectLogin", req)
  console.log(req.url); // gives the url from which the user has come to login page
  console.log(next)
  //console.log(req.query.params)
  if(!req.session.userId){
    res.redirect('/login/?url=' + req.url); // if not authenticated
  }
  else{
    req.session.counter = 0
    console.log("In else of redirectLogin ,counter in redirectlogin", req.session.counter);
    next() // if authenticated go to home route
  }
}

const redirectHome = (req,res, next) =>{

  console.log("In redirect home, my url?",req.url)
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
    //res.redirect('/home'); // should redirect to url route
    console.log("I am logged in, give me next route")
  }
  else {
    res.redirect('/login/?url=blank'); // if not logged in go to get method
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
// login route
// if user is already logged in they will be redirected to home page, so showing login page is not needed
app.get('/login',redirectHome, (req,res) =>{

  //do not check url here
  console.log("in get login",req.url) // prints url as /login/?url=/play/check1-check1/5fe6619b2aaedc40d812bd49
  console.log("my url passed to get function",req.query.url)
  var blank_data = {
      next_url : req.query.url, // sends the url from which login page is called
      message : ''
  }
  res.render('login',{data:blank_data})
  //   res.sendFile('login.html', {
  //     root: path.join(__dirname, './public/') // creates path to access the login.html file
  // });
});


// page 2 : 
// register route
app.get('/register', redirectHome, (req, res) => {

  // submit data as blank {}
  console.log("in get register",req.url) // prints url as /login/?url=/play/check1-check1/5fe6619b2aaedc40d812bd49
  console.log("my url passed to get register function",req.query)
  var data = {
    next_url : req.query.url, // sends the url from which login page is called ( eg. if someone clicks on quiz link and is not registered already, quiz link is the url passed to register page)
    message : ''
  }
  res.render('register',{data:data})

//   res.sendFile('register.html', {
//     root: path.join(__dirname, './public/') // creates path to access the login.html file
// });

});

// login only when u are not authenticate, if already logged in, redirectHome
app.post('/login',redirectHome,(req,res) =>{ // passed url in query string

  // starting a new session ?? 
  console.log("my url in login post",req.query)
  var next_url = req.query.url;
  console.log("in post / login route", req.body); // contains username and password
  // in login post { username: 'sapalep1', password: 'sapalep1' }

  var data = {
    next_url : req.query.url,
    message : ''
  }
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

                // if url is present go to that route else go to home route

                if(next_url == "blank" || next_url == "/logout")
                  return res.redirect('/home'); // redirect to home if authenticated
                else {
                  var str_array = next_url.split("/");
                  str_array_len = str_array.length;
                  var quiz_id = str_array[str_array_len-1]
                  var course = str_array[str_array_len-2]
                  console.log("split array",str_array);
                  console.log("quiz_id",quiz_id)
                  console.log("course",course)
                  console.log("type of quiz id", typeof(quiz_id))
                  db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.quiz_id":ObjectID(quiz_id),"username":username}}]).toArray()
                  .then(function(studentdata_doc){

                    console.log(studentdata_doc)
                    console.log(typeof(studentdata_doc))
                    studentdata_doc = JSON.stringify(studentdata_doc)
                    console.log("type of studentdata_doc",typeof(studentdata_doc))

                    if(studentdata_doc == '[]'){
                      return res.redirect(next_url);
                    }
                    else{
                      return res.redirect("/grades/"+ course +"/" + "?quiz_id="+ quiz_id)
                    }
                  })
                  .catch((e) => { // catch for inner db query
                    console.log("problem in getting count for student");
                    console.log(e);
                  });
                }
          })
          .catch((e) => { // catch for inner db query
            console.log("problem in getting count");
            console.log(e);
          });
        } // end of if

          else{ // no user found
            // if login fails - AJAX call here
            data.message = 'Worng username or password';
            res.render('login',{data:data})
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
app.post('/register', redirectHome,(req,res) =>{ //?url passed as query string

  // console.log("request body normal")
  console.log("my url in register post",req.query.url)
  var next_url = req.query.url;
  var data = {
    next_url : req.query.url,
    message : ''
  }
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

           // if url is present go to that route else go to home route

          
          if(next_url == "blank" || next_url == "/logout")
            return res.redirect('/home'); // redirect to home if authenticated
          else
            return res.redirect(next_url);  // quiz page
          
          // if(next_url =='')
          //   return res.redirect('/home'); // redirect to home if authenticated
          // else
          //   return res.redirect(next_url);  

          //res.redirect('/home');

        });
       
      } 
      else {   // some user already exists ( double registration )
      
        // AJAX call here
        // if anything fails, show error message : query string errors - error.auth.userExists

        // console.log("already exists");
        // res.send('existing');
        //console.log('after sending response back to register.html');

        // res.render for existing
        data.message = 'Oops! Sorry, try a different username or password';
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
                        console.log("inside second then",allCourses) // this query : array of full objects, userid and courses
                        console.log("course_id_list",course_id_list) // past query : array of ids

                        for(var i = 0; i < course_id_list.length; i++ ){ // from past query to get ids
                          console.log("current course_id in array", course_id_list[i]);
                          var id_list_course = JSON.stringify(course_id_list[i]) // course id from past query

                          for(j=0; j<allCourses.length; j++){  // current query to get all courses
                            console.log("current course_id in allCourses", allCourses[j].courses);
                            console.log("USERID of the owner for this course",allCourses[j]["user-id"] )
                            var full_course = JSON.stringify(allCourses[j].courses.course_id)
                            var course_owner_userid = allCourses[j]["user-id"];

                            if(full_course == id_list_course){
                              console.log("Pass this courses object", allCourses[j].courses ) // only courses
                              if (user_data.userId == course_owner_userid ){
                                console.log("I am the owner for this course, I created the course")
                                allCourses[j].courses.role = "group_owner"
                              }
                              else{
                                console.log("I am only the player for course")
                                allCourses[j].courses.role = "group_player"
                              }
                              render_courses.push(allCourses[j].courses) // push only matched courses to be rendered finally
                              break; // breaks out of inner for loop only
                            }
                          console.log("I am out")
                          }
                        }

                      user_data["courses"] = render_courses
                      console.log("my user_data",user_data)
                      console.log("check the passing object", render_courses); // consists of course id, course no, course name
                      res.render('playedgroups', {data:user_data})
                    })
                    .catch((e) => {
                      console.log("error in finding course_id");
                      console.log(e);
                    });  // end of query 
      
                  }
                  else { // no student collection found, so no past groups which are played
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
 
               // OR update courses field with new course, 
               // if teacher already exists, just update courses
               console.log("update value", update)
               if (update){
                var uuid =  uuidv4()
                 teacherdata_doc_obj.courses.push({ // create new course
                   "course_id": uuid,
                   "course_no" : req.body.course_no,
                   "course_name" : req.body.course_name
                }) // push in courses array of object
  
                console.log("my added courses",teacherdata_doc_obj.courses); // gives array of
                console.log("updated object?",teacherdata_doc);
                
                // how can this be avoided??, I want to update in above promise , ask***
                // update teacherdata with new course
                db.collection('teacherdata').updateOne(
                      {"user-id": userId},
                      {$set: {"courses" : teacherdata_doc_obj.courses}}
                  )
                  .then(function(check){
                    console.log("my teacherdata successful?",check);
                  })
                 res.send(uuid); // send uuid back to displaygroups.ejs

                //  res.send('success')
                 // res.status(status).send(body)
               } // end of if
              
             })
           }
           
           else { // create document in teacher is creating group for the first time, and insert new document
             var uuid =  uuidv4()
             db.collection('teacherdata').insertOne({
                     "user-id": userId,
                     "courses" : [
                       { //"course_id" : uuidv4(),
                         "course_id" : uuid,
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
                 res.send(uuid); // send uuid back to displaygroups.ejs
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
        // var only_quiz_ids = []
        // take edit button status while displaying quizzes
        for(i=0 ; i<=quizdata.length-1;i++){
            var quiz = {
                quiz_id : quizdata[i]._id,
                quiz_title : quizdata[i].title, // this is the name that appears on the display quiz page
                quiz_edit_disable : quizdata[i].edit_disable //"yes" or "no"
            }
            //only_quiz_ids.push(quiz_id)
            quizzes.push(quiz);
            console.log("this is my array", quizzes);
        }
            course_data["quizzes"] = quizzes;
            console.log("data to be sent to 2nd then", course_data);
            //return [only_quiz_ids,course_data]
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



// page 5 : 
// show saved quiz

app.get('/create/save/:course', function(req,res){ // quiz_id as query parameter
  console.log("came from createquiz.ejs to go to savedquiz.ejs", req.body);
  var checkparams = req.params; // coursename
  var checkquery = req.query; // quiz id
  console.log(checkparams) // { course: 'check1-check1' }
  console.log(checkquery) // { course_id: 'b115c339-8d3b-46e0-ac38-0cf9d1416688' }
  // res.send('true');

  const{userId} = req.session;
  const{username} = req.session;
  var course_data = {
    userId: userId,
    username : username,
    // password : req.body.groupdata['password'],
    quizid : req.query.quiz_id,
    course : req.params.course
 }

 MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  if (err) throw err;
  var db = client.db('test');
  db.collection('quizdata').find({"_id": ObjectID(course_data.quizid)}).toArray()
    .then(function(quizdata){
        console.log("this is my data from db", quizdata); // this is an array of quiz objects

        quizdata_obj = quizdata[0]
        var quiz_data = {
          userId : userId,
          username : username,
          course : course_data.course,
          course_id : quizdata_obj.course_id,
          quizid : quizdata_obj._id,
          title : quizdata_obj.title,
          points : quizdata_obj.points,
          instructions : quizdata_obj.instructions,
          quizdata : quizdata_obj.quizdata
        }

        console.log("This is passed to savedquiz.ejs",quiz_data);
        res.render('savedquiz.ejs',{data:quiz_data})
        //res.send(true)

    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    });

})

});

// page 5 :EDIT and DUPLICATE

// go to crossword page to edit it
// pull data from db and send to crossword page again

app.get('/create/:mode/:course', function(req,res){ // quizid as query

  console.log("came from displayquizzes to ?? ", req.body);
  const{userId} = req.session;
  const{username} = req.session;
  var checkparams = req.params; // course name, mode ( edit / duplicate)
  var checkquery = req.query; // quizid

  console.log(checkparams);
  console.log(checkquery);
  var course_data = {
    userId: userId,
    username : username,
    // password : req.body.groupdata['password'],
    quizid : req.query.quiz_id,
    course : req.params.course,
    mode : req.params.mode // edit or duplicate
 }
 console.log("request to edit / duplicate", course_data)

 MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  if (err) throw err;
  var db = client.db('test');

  db.collection('quizdata').find({"_id": ObjectID(course_data.quizid)}).toArray()
    .then(function(quizdata){
        console.log("this is my data from db", quizdata); // this is an array of quiz objects

        quizdata_obj = quizdata[0]
        var quiz_data = {
          userId : userId,
          username : username,
          course : course_data.course,
          course_id : quizdata_obj.course_id,
          quizid : quizdata_obj._id,
          title : quizdata_obj.title,
          points : quizdata_obj.points,
          instructions : quizdata_obj.instructions,
          quizdata : quizdata_obj.quizdata,
          mode :  course_data.mode // "edit" // "duplicate"
        }

        console.log("This is passed to createquiz.ejs",quiz_data);
        res.render('createquiz.ejs',{data:quiz_data})
        //res.send(true)

    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    });

})

})





// page 6 : Main create crossword page
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
    course : req.params.course,
    mode : "create"
}

  console.log("use this to create quiz", course_data);
  res.render('createquiz',{data : course_data});
})


// page 6 to page 5
// Submit quiz button ( when newly created )
// save quiz data in DB and go back to page 5
//TODO: check if quiz name is already present in DB

// based on the mode update here - edit / duplicate / create - insert in DB
//  link - submitquiz/:mode/:course

app.post('/submitquiz/:mode/:course', function (req, res) { // course_id and quizid in edit mode, only course_id  in duplicate mode

  const{userId} = req.session;
  const{username} = req.session;
  var course_id = req.query.course_id; // course_id , mode = / edit / duplicate / create
  var course = req.params.course;
  var mode = req.params.mode;

  console.log(req.body)
  console.log("querystrings", req.query) // { course_id: 'b115c339-8d3b-46e0-ac38-0cf9d1416688' (& quiz id for edit mode )}
  console.log("params", req.params) // { course: 'check1-check1' , mode : '' } // edit / duplicate / create
  console.log("My mode after submitting quiz")
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
    instructions : req.body["instructions"],
    quizdata : req.body["ques_ans_data"],
    edit_disable : "no"
};

console.log("This data to be put in DB",data)

  // query to insert data

  if(mode === "create" || mode == "duplicate"){

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

  }

  else if(mode === "edit") { // update the quiz
      console.log(mode)
      console.log("data edited so just update")

      MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('test');

        console.log("quiz_id inside", req.query.quizid, "type is", typeof(req.query.quizid))
        db.collection('quizdata').updateOne(
          {"_id": ObjectID(req.query.quizid)},
          {$set: {"title" : data.title,
                  "points" : data.points,
                  "instructions" : data.instructions,
                  "quizdata" : data.quizdata } })
          .then(function(quizdata) {
                    
            console.log('I am printing on line 72');
            console.log(quizdata)
            // display all quizzes for that course
            var link = '/create/groups/' + course + "?course_id=" + course_id;
            res.redirect(link);
            })
            .catch((e) => {
              console.log("there is an error in grabbing quizdata");
              console.log(e);
  });

        
  });
}
  // else if (mode === "duplicate"){
  //   console.log("data duplicated ")
  //   res.send(true)

  // }

});




// page 7 to page see student grades
// pass some quizdata and student grades
app.get('/quiz/grades/:course', function(req,res){  // quiz_id as query string
  console.log("came from displayquizzes.ejs", req.body);
  var course = req.params.course
  var quiz_id = req.query.quiz_id
  console.log("type of quiz id", quiz_id)
  console.log("course passed by parameter", course)
  console.log("course_id passed by parameter", typeof(quiz_id))

  const{userId} = req.session;
  const{username} = req.session;
  var user_data = {
    userId : userId,
    username : username,
  }
  student_grades = []

  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;
    var db = client.db('test');

    // fetch quiz details to display
    db.collection('quizdata').find({"_id": ObjectID(quiz_id)}).toArray()
    .then(function(quizdata){
        console.log("this is my data from db", quizdata); // this is an array of quiz objects

        quizdata_obj = quizdata[0]
        var quiz_data = {
          course : course,
          title : quizdata_obj.title,
          points : quizdata_obj.points,
        }

        user_data["quiz_data"] = quiz_data
        console.log("This will be passed to userdata",user_data);
    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    }); // end of quizdata find query
    
    // find grades and append to userdata
    db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.quiz_id": ObjectID(quiz_id)}}]).toArray()
    .then(function(student_quiz_grades) { // all grades_list 

      console.log("This is quiz grades grabbed from studentdata",student_quiz_grades) // array of grades object

      for(var i = 0; i < student_quiz_grades.length; i++ ){
        //quiz_ids.push(ObjectID(grades_list[i].grades.quiz_id))
        //console.log(ty(grades_list[i].grades.quiz_id))
        var one_student = {
          serial_number : i+1,
          student_username : student_quiz_grades[i].username,
          student_score : student_quiz_grades[i].grades.final_score
        }
        student_grades.push(one_student)
      }

      user_data["student_grades"] = student_grades
      res.render('studentgrades',{data:user_data});
    })
    .catch((e) => {
      console.log("there is an error in finding quiz student grades");
      console.log(e);
    }); // end of studentdata aggregate query
}); // end of Mongo Client
})

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
  var quiz_final_scores = []
  // quiz_ids [ '"600d5b0d665a1215b8ea1b03"', '"600d5b51665a1215b8ea1b04"' ]
  // quiz final scores [ '2', '0' ]

  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;
    var db = client.db('test');

      // query 1 : 
      // take course_id
      // look into grades array for those course_ids and gather quiz ids
      // get all quiz ids in form of an array, for a given course ( everything from this query will be displayed )
    db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.course_id": course_id,"username":username}}]).toArray()
    .then(function(grades_list) { // all grades_list 
      console.log("This is grades grabbed from studentdata",grades_list) // array of grades object
      for(var i = 0; i < grades_list.length; i++ ){
        // quiz_ids.push(ObjectID(grades_list[i].grades.quiz_id))
        //console.log(ty(grades_list[i].grades.quiz_id))
        quiz_ids.push(JSON.stringify(grades_list[i].grades.quiz_id))
        quiz_final_scores.push(JSON.stringify(grades_list[i].grades.final_score))
      }
      console.log("quiz_ids",quiz_ids)  
      console.log("quiz final scores", quiz_final_scores)
    })
    //.then(function(quiz_ids_array) {

    // query 2 :
    // use these quizids to gather title from quizdata
    // query quiz ids with title name
    db.collection('quizdata').find({}).toArray() // I have to pull entire quizdata because what will you query quizdata with, or this query can be written in for loop for every quizid
    .then(function(quizdata_array){ 

      console.log("this is my quiz_ids array", quiz_ids) // with final_score
      //var quiz_id_object = quizdata_array.find(function(quiz,index){
      console.log("the entire quizdata",quizdata_array);
      console.log(quizdata_array.length) // all quizzes from quizdata array
      played_quizzes = []
      for(var i = 0; i < quiz_ids.length; i++ ){
        // if-else is not needed because definitely played quizid will be present in quizdata collection
        console.log("found")
        var quiz_obj = quizdata_array.find(q => JSON.stringify(q._id) == quiz_ids[i])
        console.log(quizdata_array.find(q => JSON.stringify(q._id) == quiz_ids[i]))//quiz_ids[i]))

        var quiz = {
          quiz_id : JSON.parse(quiz_ids[i]), // parsed because id in the link appears to be a string http://localhost:4000/"5fe666a52aaedc40d812bd50"  // other option:  quiz_id in playedquizzes.ejs will be parsed on front end
          quiz_title : quiz_obj.title,
          quiz_student_final_score : quiz_final_scores[i], // pulled from global variable quiz_final_scores filled in previous query
          quiz_orig_final_score : quiz_obj.points
          // final points can be added here
        }
        played_quizzes.push(quiz)
      }

      // pass to playedquizzes.ejs
      // userID, username, quiz names and quiz ids
      user_data["quizzes"] = played_quizzes
      console.log(user_data);
      res.render('playedquizzes',{data:user_data});
    })
    .catch((e) => {
      console.log("there is an error in finding past quizzes");
      console.log(e);
    }); // end of quizdata find query

  });
});


// Page 7 to  Page 8 - CW page [ owners only ]
// new try link for teacher only: 

app.get('/try/:course/:quizid', redirectLogin, function (req, res) {
  console.log("owners came from playedquizzes.ejs for quiz link ", req.body);
  console.log(req.params)
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
          instructions : quizdata_obj.instructions,
          quizdata : quizdata_obj.quizdata,
          role : "owner"
        }

        console.log("This is passed to playquiz.ejs",quiz_data);
        res.render('playquiz.ejs',{data:quiz_data});
    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    });
    
  });
});



// student quiz link to page 8 ( CS page ) [ students only / teacher can use it  ]
// quiz attempt link - pull quizzes
  
app.get('/play/:course/:quizid', redirectLogin, function (req, res) { //no query string passed
  console.log("came from playedquizzes.ejs for quiz link ", req.body);
  console.log(req.params)
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
          instructions : quizdata_obj.instructions,
          quizdata : quizdata_obj.quizdata,
          role : "player"
        }
        console.log("This is passed to playquiz.ejs",quiz_data);
        res.render('playquiz.ejs',{data:quiz_data})
    })
    .catch((e) => {
                console.log("there is an error in grabbing quizdata");
                console.log(e);
    }); // end of quizdata find query
  });
});


// page 8 CW page - S6 [ show grades after submission - teacher only]
// squiz grades link - teacher only

app.post('/grades/owner-try/:course', function (req, res) { //course_id and quiz_id passed as query strings
  console.log("teacher came from playquiz.ejs for grades link", req.body);
  req.body["student_data_json"] = JSON.parse(req.body["student_data_json"]);

  var query_params = req.query;
  var course = req.params.course;
  console.log("parameter passed is", query_params)
  console.log(req.body)
  req.query.quiz_id = ObjectID(req.query.quiz_id)
  console.log(typeof(req.query.quiz_id ))

  const{userId} = req.session;
  const{username} = req.session;
  var user_data = {
    userId : userId,
    username : username
  }

  var qa = req.body.student_data_json.qa_data; // gives qa_array
  var ques_ans_data = []
  var total_ques_ans_data = []
  for( var i=0; i<=qa.length-1; i++){
      var one_qa_data = {
          qa_id : qa[i].qa_id,
          myans : qa[i].student_ans,
          qa_score: qa[i].qa_score,
      }
      ques_ans_data.push(one_qa_data);  
      one_qa_data.correct_ans = qa[i].correct_ans
      one_qa_data.orig_qa_score = qa[i].orig_qa_score
      total_ques_ans_data.push(one_qa_data);
    }

  // for general use
  var data = {
    username : user_data.username,
    course_id : req.query.course_id, // student data
    course : req.params.course,
    quiz_id : req.query.quiz_id, // student data
    final_score : req.body.student_data_json.final_score,
    orig_final_score : req.body.student_data_json.orig_final_score,
    ques_ans_data : ques_ans_data, // with only student ans ans student score
    total_ques_ans_data : total_ques_ans_data, // with orig score and correct ans
    title : req.body["student_data_json"].title,
    instructions : req.body["student_data_json"].instructions
}
console.log("Deal with this data for general use ",data);

// to insert in student data // update
var grades_obj = {
  quiz_id : data.quiz_id,
  course_id: data.course_id,
  final_score: data.final_score,
  ques_ans_data : data.ques_ans_data
}

console.log("Deal with this grades_obj to insert in studentdata for teacher",grades_obj);

MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;
      var db = client.db('test');

      // check if username exists in student data
      db.collection('studentdata').find({"username": user_data.username}).count()
      .then(function(playercount) {
          console.log("count of data found", playercount);

          if(playercount == 1){ // player collection found in studentdata

            // this is the second attempt
            console.log("player count is 1")
            db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.quiz_id": ObjectID(req.query.quiz_id),"username": user_data.username}}]).toArray()
            .then(function(student_grades_data_doc){

                console.log("I am here")
                // this should return only one array // unique quiz id
                student_grades_data_doc = JSON.stringify(student_grades_data_doc)
                console.log("Check now if this is empty",student_grades_data_doc)
                console.log("typeof",typeof(student_grades_data_doc))

                if(student_grades_data_doc != '[]'){
                  console.log("I am logged in, this is my grades data for 2nd attempt, please update grades for that quiz",student_grades_data_doc);
                  // UPDATE specific quiz , do not insert
                  student_grades_data_doc = JSON.parse(student_grades_data_doc)
                  console.log("type of student data doc",typeof(student_grades_data_doc))
                  // do not update courses, as quiz is already found

                  var student_grades_data_obj = student_grades_data_doc[0]
                  console.log("student data obj",student_grades_data_obj)
                  console.log("student data obj grades",student_grades_data_obj.grades)
                  student_grades_data_obj.grades = grades_obj; 
                
                  // update in DB
                  db.collection('studentdata').find({"username":data.username}).toArray()
                  // get the grades object ready for next then
                  .then(function(grades_list) {
                    console.log("gives the student collection");
                    console.log("gives array of the student grades obj", grades_list[0].grades); //[ {   }, {  }]
                    student_grades_list = grades_list[0].grades;

                    //console.log("found",student_grades_list.find(q => JSON.stringify(q._id) == JSON.stringify(grades_obj.quiz_id)))

                    for(var i = 0; i < student_grades_list.length; i++ ){
                        // quiz_ids.push(ObjectID(grades_list[i].grades.quiz_id))
                        //console.log(ty(grades_list[i].grades.quiz_id))
                        //quiz_ids.push(JSON.stringify(grades_list[i].grades.quiz_id))
                        console.log("inside for",student_grades_list[i])
                        if(JSON.stringify(grades_obj.quiz_id) == JSON.stringify(student_grades_list[i].quiz_id )){
                          console.log("found",student_grades_list[i])
                          student_grades_list[i] = grades_obj;
                          console.log("changed object",student_grades_list[i])
                          break;
                        }
                    } 
                      console.log("pass this to 2nd then",student_grades_list)
                      return student_grades_list;

                    })
                    .then(function(final_studentdata){
                      console.log("in 2nd then",final_studentdata)

                      // update in student collection
                      db.collection('studentdata').updateOne(
                        {"username": data.username},
                        {$set: {"grades" : final_studentdata}}
                        )
                        .then(function(studentdata_doc){
                        var passed_data = {
                            qa_data : req.body.student_data_json.qa_data,
                            username : data.username,
                            course : data.course,
                            title : data.title,
                            instructions : data.instructions,
                            final_score : data.final_score,
                            orig_final_score : data.orig_final_score
                        }
                        console.log("updated data , now render",studentdata_doc) // only grades
                        return res.render('scoreboard', {data: passed_data});
                        }) 
                        .catch((e) => {
                          console.log("some error in inserting updated owner data in studentdata");
                          console.log(e);
                      }); // end of update que
                    }) // end of then for update query
                    .catch((e) => {
                        console.log("some error in updating teacher");
                        console.log(e);
                    });
                  } // end of 2nd attempt procedure

                  else{ // document found in studentdata collection
      
                      // find the specific studentdata
                      db.collection('studentdata').find({"username": user_data.username}).toArray()
                      .then(function(studentdata_doc){
      
                          var studentdata_doc_obj = studentdata_doc[0] // gets object
      
                          // update course if it does not exist, else do not do anything to courses array
                          console.log("current courses in student data",studentdata_doc_obj.courses);
                          console.log("current courses in student data typeof",typeof(studentdata_doc_obj.courses))
                          console.log("to be checked courseid",data.course_id);
      
                          var stringified_courseid = JSON.stringify(data.course_id)
                          console.log('stringified_courseid?yes',stringified_courseid)
                          //var exists = 'no';
                          var not_exists = true
      
                          for(var i=0 ; i<studentdata_doc_obj.courses.length ; i++ ){
      
                              console.log("inside for loop")
                              console.log("stringified_courseid",stringified_courseid);
                              console.log("in_course_array",studentdata_doc_obj.courses[i]);
      
                              var in_course_array = JSON.stringify(studentdata_doc_obj.courses[i])
                              console.log("in_course_array stringified",in_course_array);
                              
                              if(stringified_courseid == in_course_array){ // TODO : check if this works
                                  console.log("COURSE ALREADY EXISTS")
                                  not_exists = false ; // course exists
                                  //break;
                              }
                          }     
                          console.log("check not_exists status", not_exists)
                          //if (exists == 'no'){
                          // do this if not_exists is true
      
                          // course does not exist, so add course to courselist
                          if(not_exists){
                              studentdata_doc_obj.courses.push(data.course_id); // update with new course here
                              console.log("UPDATED course array",studentdata_doc_obj.courses)
                              console.log("UPDATED course collection",studentdata_doc);
                              var x = studentdata_doc_obj.grades;
                              // update the grades and course ids if necessary
                              x.push(grades_obj); // push in courses array of object
                              //console.log("my added grades",studentdata_doc_obj.grades); // gives array of grades
                              //console.log("updated grades object ( collection ) ?",studentdata_doc); // the entire student collection
      
                              // update grades and courses list for this username ( new or old course both)
                              db.collection('studentdata').updateOne(
                              {"username": data.username},
                              {$set: {"grades" : studentdata_doc_obj.grades,
                                      "courses" : studentdata_doc_obj.courses } }
                              )
                              .then(function(check){
                              // console.log("my teacherdata successful?",check);
                              // render data 
                              var passed_data = {
                                  qa_data : req.body.student_data_json.qa_data,
                                  username : data.username,
                                  course : data.course,
                                  title : data.title,
                                  instructions : data.instructions,
                                  final_score : data.final_score,
                                  orig_final_score : data.orig_final_score
                              }
                              console.log(studentdata_doc_obj.grades) // only grades
                              return res.render('scoreboard', {data: passed_data});
                              }) // end of update query
                          } // end of not_exists
                          else{
                              // update grades and courses list for this username ( new or old course both)
                              var x = studentdata_doc_obj.grades;
                              // update the grades and course ids if necessary
                              x.push(grades_obj); // push in courses array of object
                              db.collection('studentdata').updateOne(
                                  {"username": data.username},
                                  {$set: {"grades" : studentdata_doc_obj.grades,
                                          "courses" : studentdata_doc_obj.courses } }
                              )
                              .then(function(check){
                                  // console.log("my teacherdata successful?",check);
                                  // render data 
                                  console.log("I am updating grades only, course exists")
                                  console.log("updated data",check)
                                  var passed_data = {
                                    qa_data : req.body.student_data_json.qa_data,
                                    username : data.username,
                                    course : data.course,
                                    title : data.title,
                                    instructions : data.instructions,
                                    final_score : data.final_score,
                                    orig_final_score : data.orig_final_score
                                }
                                  console.log(studentdata_doc_obj.grades) // only grades
                                  return res.render('scoreboard', {data: passed_data});
                              }) 
                          }  // end of else
                      }) // end of studentdata query for course update
                      } // end of else for 1st attempt
                  })// end  of aggregate
                  .catch((e) => {
                      console.log("some error in finding studentdata");
                      console.log(e);
                  });
          } // end of if for player count = 1

          // new student user
          // insert new student document if count == 0
          else{
              db.collection('studentdata').insertOne({
                  //"player_id": req.body["user_id"],
                  "username" : user_data.username,
                  "courses" : [data.course_id],
                  "grades" : [grades_obj]
                  
              })
              .then(function(userdata){
                  console.log("my teacherdata in else",userdata);
                  var passed_data = {
                      username : user_data.username,
                      course : data.course,
                      title : data.title,
                      instructions : data.instructions,
                      qa_data : req.body.student_data_json.qa_data,
                      final_score : data.final_score,
                      orig_final_score : data.orig_final_score,          
                  }
                  res.render('scoreboard', {data: passed_data});
                  // res.render('scoreboard', {data: req.body.student_data_json});
              })
              .catch((e) => {
                  console.log("some error in inserting new data");
                  console.log(e);
              });
          } // end of else for player count = 0
       })  // end of player count query
  }) // endof mongo client
});



// page 8 CW page - S6 [ show grades after submission - student only for now / teachers can use too]
// quiz grades link - student / teacher can use it

app.post('/grades/:course', function (req, res) { //course_id and quiz_id passed as query strings
  console.log("came from playedquizzes.ejs for grades link", req.body);
  req.body["student_data_json"] = JSON.parse(req.body["student_data_json"]);

  var query_params = req.query;
  var course = req.params.course;
  console.log("parameter passed is", query_params)
  console.log(req.body)
  req.query.quiz_id = ObjectID(req.query.quiz_id)
  console.log(typeof(req.query.quiz_id ))

  const{userId} = req.session;
  const{username} = req.session;
  var user_data = {
    userId : userId,
    username : username
  }

  var qa = req.body.student_data_json.qa_data; // gives qa_array
    var ques_ans_data = []
    var total_ques_ans_data = []
    for( var i=0; i<=qa.length-1; i++){
        var one_qa_data = {
            qa_id : qa[i].qa_id,
            myans : qa[i].student_ans,
            qa_score: qa[i].qa_score,
        }

        var total_one_qa_data = {
          qa_id : qa[i].qa_id,
          myans : qa[i].student_ans,
          qa_score: qa[i].qa_score,
          correct_ans : qa[i].correct_ans,
          orig_qa_score : qa[i].orig_qa_score
      }

        ques_ans_data.push(one_qa_data);  // insert in studentdata
        // total_one_qa_data.correct_ans = qa[i].correct_ans
        // total_one_qa_data.orig_qa_score = qa[i].orig_qa_score
        total_ques_ans_data.push(total_one_qa_data); // pass to scoreboard.ejs

        console.log("my student ques and data", one_qa_data)
        console.log("my total data", total_one_qa_data)
    }

    console.log("my student ques and data", ques_ans_data)
    console.log("my total data", total_ques_ans_data)

  // for general use
  var data = {
    username : user_data.username,
    course_id : req.query.course_id, // student data
    course : req.params.course,
    quiz_id : req.query.quiz_id, // student data
    final_score : req.body.student_data_json.final_score,
    orig_final_score : req.body.student_data_json.orig_final_score,
    ques_ans_data : ques_ans_data, // with only student ans ans student score
    total_ques_ans_data : total_ques_ans_data, // with orig score and correct ans
    title : req.body["student_data_json"].title,
    instructions : req.body["student_data_json"].instructions
}
console.log("Deal with this data for general use ",data);

// to insert in student data
var grades_obj = {
  quiz_id : data.quiz_id,
  course_id: data.course_id,
  final_score: data.final_score,
  ques_ans_data : data.ques_ans_data
}

console.log("Deal with this grades_obj to insert in studentdata",grades_obj);


    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;
      var db = client.db('test');

      // check if username exists in student data
      db.collection('studentdata').find({"username": user_data.username}).count()
      .then(function(playercount) {
          console.log("count of data found", playercount);

          if(playercount == 1){ // player collection found in studentdata

            // this is the second attempt - redirect to grades (even if they attempt 2nd time)
            db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.quiz_id": ObjectID(req.query.quiz_id),"username": user_data.username}}]).toArray()
            .then(function(studentdata_doc){

                studentdata_doc = JSON.stringify(studentdata_doc)
                if(studentdata_doc != '[]'){
                  console.log("I am logged in, this is my grades data for 2nd attempt",studentdata_doc);
                  //return res.redirect("/grades/?quiz_id="+ req.query.quiz_id)
                  return res.redirect("/grades/" + course + "/?quiz_id="+ req.query.quiz_id)
                }

                else{  // This is the first attempt : find the specific studentdata

                  db.collection('studentdata').find({"username": user_data.username}).toArray()
                  .then(function(studentdata_doc){

                      var studentdata_doc_obj = studentdata_doc[0] // gets object

                      // update course if it does not exist, else do not do anything to courses array
                      console.log("current courses in student data",studentdata_doc_obj.courses);
                      console.log("current courses in student data typeof",typeof(studentdata_doc_obj.courses))
                      console.log("to be checked courseid",data.course_id);

                      var stringified_courseid = JSON.stringify(data.course_id)
                      console.log('stringified_courseid?yes',stringified_courseid)
                      //var exists = 'no';
                      var not_exists = true

                      for(var i=0 ; i<studentdata_doc_obj.courses.length ; i++ ){

                          console.log("inside for loop")
                          console.log("stringified_courseid",stringified_courseid);
                          console.log("in_course_array",studentdata_doc_obj.courses[i]);

                          var in_course_array = JSON.stringify(studentdata_doc_obj.courses[i])
                          console.log("in_course_array stringified",in_course_array);
                          
                          if(stringified_courseid == in_course_array){ // TODO : check if this works
                              console.log("COURSE ALREADY EXISTS , I am NOT ON TRY LINK")
                              not_exists = false ; // course exists
                              //break;
                          }
                      }     
                      console.log("check not_exists status", not_exists) // true or false

                      // course does not exist is true, so add course to courselist, AND then update studentdata grades
                      // Different course
                      if(not_exists){
                          studentdata_doc_obj.courses.push(data.course_id); // update with new course here
                          console.log("UPDATED course array",studentdata_doc_obj.courses) // only courses from student collection
                          console.log("UPDATED course collection",studentdata_doc); // the entire student collection
                          var x = studentdata_doc_obj.grades;
                          // update the grades and course ids if necessary
                          x.push(grades_obj); // push in courses array of object
                          //console.log("my added grades",studentdata_doc_obj.grades); // gives array of updated grades

                          // update grades and courses list for this username ( new or old course both)
                          db.collection('studentdata').updateOne(
                            {"username": data.username},
                            {$set: {"grades" : studentdata_doc_obj.grades,
                                    "courses" : studentdata_doc_obj.courses } }
                          )
                          .then(function(check){ 
                            var passed_data = {
                              qa_data : req.body.student_data_json.qa_data,
                              username : data.username,
                              course : data.course,
                              title : data.title,
                              instructions : data.instructions,
                              final_score : data.final_score,
                              orig_final_score : data.orig_final_score,          
                            }
                            console.log("new insert for new course",studentdata_doc_obj.grades) // only grades
                            return passed_data;
                          }) 
                          .then(function(passed_data){

                            // Check if player is owner for edit button changes button 
                            db.collection('quizdata').find({"_id": ObjectID(grades_obj.quiz_id)}).toArray()
                            .then(function(quizdata_doc){ 

                              // if owner is not the player, disable edit
                              if(quizdata_doc[0].owner_id != user_data.userId){ // if player is not the owner - edit disabled
                                
                                //var quizdata_doc_obj = quizdata_doc[0]
                                //quizdata_doc_obj.edit_disable = "yes"
                                //just updating variable as shown below is not enough, data in DB should be updated
                                // Hence the query is written to update edit status    
                                db.collection('quizdata').updateOne(
                                  {"_id": grades_obj.quiz_id},
                                  {$set: { "edit_disable" : "yes"}}
                                  )
                                  .then(function(quizdata_doc){
                                    console.log("New course added, I am the NOT the owner, disable, quizdata edit disabled for new course?", quizdata_doc )
                                    console.log("ready to show scoreboard", passed_data) // only grades
                                    return res.render('scoreboard', {data: passed_data});
                                  }) // end of update query
                              } // end of if
                              else{
                                  console.log("New course added, I am the the owner, do not disable, quizdata edit disabled for new course?", quizdata_doc )
                                  console.log("ready to show scoreboard", passed_data) // only grades
                                  return res.render('scoreboard', {data: passed_data});
                              }
                            })  // end of check player or owner query

                            // start
                            // db.collection('quizdata').find({"_id": ObjectID(grades_obj.quiz_id)}).toArray()
                            // .then(function(quizdata_doc){

                            //   quizdata_doc_obj = quizdata_doc[0]
                            //   quizdata_doc_obj.edit_disable = "yes"

                            //   console.log("quizdata edit disabled ?",quizdata_doc_obj )
                            //   console.log("ready to show scoreboard",passed_data) // only grades
                            //   return res.render('scoreboard', {data: passed_data});
                            // })
                            // end

                          }) // end of then for check player query
                        } // end of not_exists
                        else{  // if course exists already, update grades ( courses list updated just to be safe ) for this username
                            
                            var x = studentdata_doc_obj.grades;
                            // update the grades and course ids if necessary
                            x.push(grades_obj); // push in courses array of object
                            db.collection('studentdata').updateOne(
                              {"username": data.username},
                              {$set: {"grades" : studentdata_doc_obj.grades,
                                      "courses" : studentdata_doc_obj.courses } }
                          )
                          .then(function(check){
                          // console.log("my teacherdata successful?",check);
                          console.log("I am updating grades only, course exists")
                          console.log("updated data",check)
                          var passed_data = {
                            qa_data : req.body.student_data_json.qa_data,
                            username : data.username,
                            course : data.course,
                            title : data.title,
                            instructions : data.instructions,
                            final_score : data.final_score,
                            orig_final_score : data.orig_final_score,          
                          }
                          console.log(studentdata_doc_obj.grades) // only grades
                          console.log("insert for same course, going to scoreboard", passed_data)
                          return passed_data;
                          })
                          .then(function(passed_data){

                          // Check if player is owner for edit button changes button 
                          db.collection('quizdata').find({"_id": ObjectID(grades_obj.quiz_id)}).toArray()
                          .then(function(quizdata_doc){ 

                            // if owner is not the player, disable edit
                            if(quizdata_doc[0].owner_id != user_data.userId){ // if player is not the owner - edit disabled
                              db.collection('quizdata').updateOne(
                                {"_id": grades_obj.quiz_id},
                                {$set: { "edit_disable" : "yes"}}
                                )
                                .then(function(quizdata_doc){
                                  console.log("Same course, grades updated, I am the NOT the owner, disable, quizdata edit disabled for same course?", quizdata_doc )
                                  console.log("ready to show scoreboard", passed_data) // only grades
                                  return res.render('scoreboard', {data: passed_data});
                                })
                            }
                            else{
                                console.log("Same course, grades updated, I am the the owner, do not disable, quizdata edit disabled for same course?", quizdata_doc )
                                console.log("ready to show scoreboard", passed_data) // only grades
                                return res.render('scoreboard', {data: passed_data});
                            }
                          })  // end of check player or owner query
                          }) // end of then for check player query
                        }  // end of else for same course
                    }) // end of studentdata query
                  } // end of else for 1st attempt
                    
              }) // end of aggregate query
                .catch((e) => {
                  console.log("some error in finding studentdata");
                  console.log(e);
              });
                            
          } // end of if for player count = 1

          // if player count = 0
          // insert new student document ( new student )
          else{
              db.collection('studentdata').insertOne({
                  "username" : user_data.username,
                  "courses" : [data.course_id],
                  "grades" : [grades_obj]
              })
              .then(function(userdata){
                  console.log("my teacherdata in else",userdata);
                  var passed_data = {
                      username : user_data.username,
                      course : data.course,
                      title : data.title,
                      instructions : data.instructions,
                      qa_data : req.body.student_data_json.qa_data,
                      final_score : data.final_score,
                      orig_final_score : data.orig_final_score,          
                  }
                  console.log("new insert in studentdata", passed_data)
                  return passed_data
              })
              .then(function(passed_data){

                db.collection('quizdata').find({"_id": ObjectID(grades_obj.quiz_id)}).toArray()
                .then(function(quizdata_doc){ 

                  // if owner is not the player, disable edit
                  if(quizdata_doc[0].owner_id != user_data.userId){
                    db.collection('quizdata').updateOne(
                      {"_id": grades_obj.quiz_id},
                      {$set: { "edit_disable" : "yes"}}
                      )
                      .then(function(quizdata_doc){
                        console.log("I am not the owner, quizdata edit disabled for same course?", quizdata_doc )
                        console.log("ready to show scoreboard", passed_data) // only grades
                        return res.render('scoreboard', {data: passed_data});
                      })
                  } // end of if
                  else{
                      console.log("I am the owner, do not disable", quizdata_doc )
                      console.log("ready to show scoreboard", passed_data) // only grades
                      return res.render('scoreboard', {data: passed_data});
                  }
                })  // end of check player or owner query
              }) // end of then for check player query 
              .catch((e) => {
                  console.log("some error in inserting new data");
                  console.log(e);
              });
          } // end of else for new insertion of document
       }) // end of query to find player count
  }) // end of Mongo client
});

// Got to S6  : Scoreboard in future after attempt 
app.get('/grades/:course', function (req, res) { // quiz id as query string

  console.log("request body",req.body)
  const{userId} = req.session;
  const{username} = req.session;
  var user_data = {
    userId : userId,
    username : username
  }
  var quiz_id = req.query.quiz_id;
  var course = req.params.course;

  console.log("passed quizid",quiz_id)
  console.log("typeof of quizid",typeof(quiz_id))
  console.log("course",course)
  console.log("typeof of quizid",typeof(course))

  MongoClient.connect('mongodb://localhost:27017/',{ useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw err;
    var db = client.db('test');
    db.collection('studentdata').aggregate([{$unwind:"$grades"},{$match: {"grades.quiz_id":ObjectID(quiz_id) ,"username": user_data.username}}]).toArray()
    .then(function(studentdata_doc){

      console.log(studentdata_doc)
      studentdata_doc_obj = studentdata_doc[0]
      console.log(studentdata_doc_obj)
      var student_data = {
        //username : studentdata_doc_obj.username,
        username : user_data.username,
        final_score : studentdata_doc_obj.grades.final_score,
        qa_data : studentdata_doc_obj.grades.ques_ans_data
      }
      console.log("my student_data",student_data)
      return student_data;
    })
    .then(function(student_data){

      console.log("2nd then",student_data) // data passed from 1st then
      db.collection('quizdata').find({"_id" : ObjectID(quiz_id)}).toArray()
      .then(function(quizdata_doc){


        console.log("my db quizdata",quizdata_doc);
        quizdata_doc_obj = quizdata_doc[0];
        console.log("this is quizdata",quizdata_doc_obj.quizdata)

        var passed_data = {
          username : student_data.username,
          title : quizdata_doc_obj.title,
          instructions : quizdata_doc_obj.instructions,
          final_score : student_data.final_score,
          orig_final_score : quizdata_doc_obj.points,
          course : req.params.course,
          qa_data : []
        }
        
        for(i=0; i<quizdata_doc_obj.quizdata.length; i++){
          var one_qa_data = {
            qa_id : student_data.qa_data[i].qa_id,
            ques : quizdata_doc_obj.quizdata[i].question,
            correct_ans : quizdata_doc_obj.quizdata[i].answer,
            student_ans : student_data.qa_data[i].myans,
            qa_score :  student_data.qa_data[i].qa_score,
            orig_qa_score : quizdata_doc_obj.quizdata[i].orig_qascore,
          }
          passed_data.qa_data.push(one_qa_data);
        }

        console.log("my data to be passed to see grades",passed_data)
        res.render('scoreboard',{data:passed_data})
        return passed_data;
      })
      // .then(function(passed_data){
      //   console("inside 3rd then for course");
      //   console.log("my data to be passed to see grades",passed_data)
      //   res.render('scoreboard',{data:passed_data})
      // })
      .catch((e) => {
        console.log("there is an error in grabbing quizdata");
        console.log(e);
    });

    })
    .catch((e) => {
      console.log("there is an error in grabbing studentdata");
      console.log(e);
  });    
});

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
    res.redirect('/login/?url=blank');

    // url=logout, url = /create/ ===
    /// url = blank == 
});
  
});

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
