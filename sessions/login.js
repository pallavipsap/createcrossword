var express = require('express');
const session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 2000
var MongoClient = mongodb.MongoClient;
var ejs = require('ejs');
var ObjectID = require('mongodb').ObjectID;
//var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

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
const users = [ // hash passords
      { id:'1', username : 'sapalep1', password:'sapalep1'},
      { id:'2', username : 'sapalep2', password:'sapalep2'},
      { id:'3', username : 'sapalep3', password:'sapalep3'}
]

var app = express();

// initially, session contains only the cookie no data
app.use(session({

  name : SESS_NAME,
  resave : false, // forces the session to be saved back to the store, by default is true, false: now we are not storing 
  saveUninitialized : false, // Forces a session that is "uninitialized" to be saved to the store, false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie
  secret : SESS_SECRET, // secret used to sign the session ID cookie. signature will be based on content of cookie, if content of cookie is modified they will no longer match the signature of the cookie
  cookie : { // by default http only
    maxAge: SESS_LIFETIME, // after which the cookie expires , to use when calculating the Expires Set-Cookie attribute
    sameSite: true, // true will set the SameSite attribute to Strict for strict same site enforcement
    secure: IN_PROD // true only in production mode, false in development mode
    
  }
}
))

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

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // changed to true

// app.use(express.static(path.resolve(__dirname, 'public')));

// login route
app.get('/', (req, res) => {
 const {userId} = req.session
 console.log(req.session);
 console.log(userId) // if we do this without starting a session, says underfined, because a session has not started for any user
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

  // decide which links to show based on the session
  res.send(`
  <h1>welcome page</h1>
  ${userId ? `
  <a href = '/home'>Home</a>
  <form method = 'POST' action = '/logout'>
    <button>Logout</button>
  <form>`
  :` 
  <a href = '/login'>Login</a>
  <a href = '/register'>Register</a>
    `}
  `)

   // res.sendFile('login.html', {
  //     root: path.join(__dirname, './public/') // creates path to access the login.html file
  // });

});

// executes before any routes, this can be used for multiple routes
app.use((req,res,next)=>{
 const {userId} = req.session

 // if valid session, grab id from session
 if(userId){
  // shared among all routes
  res.locals.user = users.find(
    user => user.id === userId
    )
 }
 next()

})

// For page 3 in crossword app: this is going to be for "play" and "create" button page 
app.get('/home', redirectLogin, (req,res)=>{ // so this is a protection against home route

  // const user = users.find(user => user.id === req.session.userId) // this has to be done in every route hence we create app.use
  const {user} = res.locals;
  res.send(`
    <h1>Home page</h1>
    <a href = '/'>Main page - welcome page</a>
    <ul>
      <li>username: ${user.username} </li>
      <li>password: ${user.password} </li>
    </ul>
  `)


})

// if user is already logged in they will be redirected to home page, so showing login page is not needed
app.get('/login',redirectHome, (req,res) =>{

  res.send(`
    <h1>Login</h1>
    <form method = 'POST' action = '/login'>
      <input type = 'text' name = 'username' placeholder = 'Enter username' required/>
      <input type = 'text' name = 'password' placeholder = 'Enter password' required/>
      <input type = 'submit'/>
    </form>
    <a href = '/register'>Register here</a>
  `)


});


// register route
app.get('/register', redirectHome, (req, res) => {
  res.send(`
    <h1>Register</h1>
    <form method = 'POST' action = '/register'>
      <input type = 'text' name = 'username' placeholder = 'Enter username' required/>
      <input type = 'text' name = 'password' placeholder = 'Enter password' required/>
      <input type = 'submit'/>
    </form>
    <a href = '/login'>You can login now</a>
  `)
  // res.sendFile('register.ejs', {
  //     root: path.join(__dirname, './views/')
  // });

});

// login only when u are not authenticate, if already logged in, redirectHome
app.post('/login', redirectHome,(req,res) =>{

  // starting a new session ?? 
  const { username, password } = req.body

  if(username && password){
    // find user which matches the username and password from the store
    const user = users.find(
      user => user.username === username && user.password === password 
    )

    if(user){
      // assign userId to session object, userid  is present in users array
      req.session.userId = user.id
      return res.redirect('/home'); // redirect to home if authenticated
    }

    // if login fails
    res.redirect('/login');
  } // end of outer if
});

// makes sense to add new user only when not aunthenticated
app.post('/register', redirectHome,(req,res) =>{
  const { username, password } = req.body

  // do proper validation
  if(username && password){
    // verify if we can verify a matching object
    const exists = users.some(
      user => user.username === username && user.password === password 
    )

    // if user does not exist, create new user, with a userId
    if(!exists){
      const user = {
        id : users.length + 1,
        username,
        password
      }
      users.push(user);
      req.session.userId = user.id;
      return res.redirect('/home');
    } 
    }

    // if anything fails, show error message : query string errors - error.auth.userExists
    res.redirect('/register');

  });

// 
app.post('/logout',redirectLogin, (req,res) =>{ // make sure you are aunthenticated

  console.log('before destroy ', req.session);
  
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
app.get('/canvas', (req, res) => {
  // this redirects to canvaspage

  res.sendFile('teachercanvas.html', {
      root: path.join(__dirname, './public/')
  });
});

app.get('/', (req, res) => {
  res.sendFile('register.ejs', {
      root: path.join(__dirname, './views/')
  });
});

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


// app.set('view engine', 'ejs');



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
/*
app.listen(port, (req,res) => {
    console.log("Server listening on port " + port);
});

*/
