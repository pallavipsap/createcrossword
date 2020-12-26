var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 4000
var MongoClient = mongodb.MongoClient
var ejs = require('ejs')
var ObjectId = require('mongodb').ObjectID;
// var domtoimage = require('dom-to-image')

//var router = express.Router();

//var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// console.log(path.dirname)
//app.use(express.static(path.resolve('C:/Users/palla/Desktop/MS_Project/FINAL_FEATURES/version3_backend_connection', './public')));

// app.get('/favicon.ico', function(req, res) { 
//     console.log('inside favicon,ico');
//     res.status(204);
//     res.end();    
// });

app.use(express.static(path.resolve(__dirname, 'public')));

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.get('/', (req, res) => {
    res.sendFile('render_button.html', {
        root: path.join(__dirname, './public/')
    });
});

app.get('/', (req, res) => {
    res.sendFile('render_next.ejs', {
        root: path.join(__dirname, './views/')
    });
});

// page 8
// click on a link to render crossword

// app.get('/:quiz_id',function(req, res){
//     console.log('hit this route');
//     res.send(req.params)
// });

// page 8
// click on a link to render crossword

// force to go to login page once clicked on login button
// take data for a specific quiz id

//app.get('/student-view-quizdata',  function(req, res) {

app.get('/:quizid',function(req, res){

    console.log("pass from link to crossword render page", req.params["quizid"])
 
    //console.log(typeof(req.params.quizid))
    x = req.params.quizid
   
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;
  
      var db = client.db('test');
      
      // "5fdc289204cad9535c6c2670"
      // find data for a specific quiz id // pass quiz_id as parameter ??
      db.collection('quizdata').find(ObjectId(x)).toArray()
      .then(function(quizdata) {
        //console.log("req body", req.body);
        // var x = res.json(quizdata).length;
        // console.log(x);
        //console.log("quizdata", res.status(200).json(quizdata[quizdata.length - 1]));
     
  
        // var quizdata_1 = quizdata[quizdata.length - 1];
        // console.log("reponse from db", quizdata_1._id);
        // res.render('render_next',{data : quizdata_1});
        console.log(quizdata)
        res.render('render_next',{data : quizdata[0]});
        
        //res.status(200).json(quizdata[quizdata.length - 1])
        
      })
      .catch((e) => {
          console.log("there is an error in grabbing data to mongodb");
          console.log(e);
      });
  });
  });


// page S6
// from crossword page to score board

// this func, posts scores on a page from render_next.ejs page
// stores data in db and goes to scoreboard.ejs
// on submitting quiz this page is rendered

// take username to put in correct student collection
// create new student collection if it does not exist, else update courses in the correct teacher collection

// TODO: request body should consist of the quiz id
// TODO : do not allow duplicate submissions

// come to this route if username exists
// insert student data

app.post('/sudent-score-page', function (req, res) {
   
    req.body["student_data_json"] = JSON.parse(req.body["student_data_json"]);
    req.body["quiz_data_json"] = JSON.parse(req.body["quiz_data_json"]);
    console.log(req.body);
    // req.body

    // quiz_data_json: {
    //     _id: '5fdc289204cad9535c6c2670',
    //     owner_id: '5fd18c58feee8860dc762e3c',
    //     course_id: 'check1-check2',
    //     title: 'test abc sapalep2',
    //     points: 'test',
    //     quizdata: [ [Object], [Object] ]
    //   },
    //   student_data_json: { qa_data: [ [Object], [Object] ], final_score: 0 },
    //   player_username: 'sapalep1'
    // }

    // ques_and_data

    var qa = req.body.student_data_json.qa_data; // gives qa_array
    var ques_ans_data = []

    for( var i=0; i<=qa.length-1; i++){
        var one_qa_data = {
            qa_id : qa[i].qa_id,
            myans : qa[i].student_ans,
            qa_score: qa[i].qa_score
        }
        ques_ans_data.push(one_qa_data);   
    }


    // for general use
    var data = {
        username : req.body.player_username,
        course_id : req.body.quiz_data_json.course_id, // student data
        quiz_id : req.body.quiz_data_json._id, // student data
        final_score : req.body.student_data_json.final_score,
        ques_ans_data : ques_ans_data,
    }
    console.log("Deal with this object",data);

    // to insert in student data
    var grades_obj = {
        quiz_id : data.quiz_id,
        course_id: data.course_id,
        final_score: data.final_score,
        ques_ans_data : data.ques_ans_data
    }
   
    // if student collection exists, 
        // check if course exists in the courses
        // update grades field

    // else create a new collection with grades ( like groups )
    MongoClient.connect('mongodb://localhost:27017/', function (err, client) {
        if (err) throw err;
        var db = client.db('test');

        // check if username exists in student data

        db.collection('studentdata').find({"username": req.body["player_username"]}).count()
        .then(function(playercount) {
            console.log("count of data found", playercount);

            if(playercount == 1){ // player collection found in studentdata

                // find the specific studentdata
                db.collection('studentdata').find({"username": req.body["player_username"]}).toArray()
                .then(function(studentdata_doc){

                       
                    var studentdata_doc_obj = studentdata_doc[0] // gets object

                    // update course if it does not exist, else do not do anything to courses array
                    console.log("current courses in student data",studentdata_doc_obj.courses);
                    console.log("current courses in student data typeof",typeof(studentdata_doc_obj.courses))
                    console.log("to be checked courseid",data.course_id);


                    var stringified_courseid = JSON.stringify(data.course_id)
                    console.log('sstringified_courseid?yes',stringified_courseid)
                    //var exists = 'no';
                    var not_exists = true

                    for(var i=0 ; i<studentdata_doc_obj.courses.length ; i++ ){

                        console.log("inside for loop")
                        console.log("sstringified_courseid",stringified_courseid);
                        console.log("in_course_array",studentdata_doc_obj.courses[i]);

                        var in_course_array = JSON.stringify(studentdata_doc_obj.courses[i])
                        console.log("in_course_array stringified",in_course_array);
                        
                        if(stringified_courseid == in_course_array){ // TODO : check if this works
                            console.log("COURSE ALREADY EXISTS")
                            not_exists = false ;
                            break;
                        }

                    }
                    
                    console.log("check not_exists status", not_exists)
                    //if (exists == 'no'){

                    // do this if not_exists is true
                    if(not_exists){
                        studentdata_doc_obj.courses.push(data.course_id); // update with new course here
                        console.log("UPDATED course array",studentdata_doc_obj.courses)
                        console.log("UPDATED course collection",studentdata_doc);
                    }
                        
                    
                    // if(data.course_id in studentdata_doc_obj.courses){ // TODO : check if this works
                    //     console.log("COURSE ALREADY EXISTS")
                    // }
                    // else { // update course with new course
                    //     studentdata_doc_obj.courses.push(data.course_id); // update with new course here
                    //     console.log("UPDATED course array",studentdata_doc);
                    // }

                    // current grades of student passed in request
                    console.log("my current grades in studentdata in request",studentdata_doc_obj.grades); // array of courses
                    var x = studentdata_doc_obj.grades;
                    // update the grades and course ids if necessary
                    x.push(grades_obj); // push in courses array of object
                    console.log("my added grades",studentdata_doc_obj.grades); // gives array of grades
                    console.log("updated grades object ( collection ) ?",studentdata_doc); // the entire student collection
                
                    // update grades for this username ( new or old course both)
                    db.collection('studentdata').updateOne(
                        {"username": data.username},
                        {$set: {"grades" : studentdata_doc_obj.grades,
                                "courses" : studentdata_doc_obj.courses } }
                    )
                    .then(function(check){
                    //   console.log("my teacherdata successful?",check);
                    // render data 
                      var passed_data = {
                        qa_data : req.body.student_data_json.qa_data,
                        final_score : data.final_score,
                        username : data.username
                    }
                    console.log(studentdata_doc_obj.grades) // only grades
                    res.render('scoreboard', {data: passed_data});
                    })
                    
                })
                .catch((e) => {
                    console.log("some error in finding studentdata");
                    console.log(e);
                });
            } // end of if for player count

            // insert new student document if count == 0
            else{

                db.collection('studentdata').insertOne({
                    //"player_id": req.body["user_id"],
                    "username" : data.username,
                    "courses" : [data.course_id],
                    "grades" : [grades_obj]
                    
                })
                .then(function(userdata){
                    console.log("my teacherdata in else",userdata);
                    var passed_data = {
                        qa_data : req.body.student_data_json.qa_data,
                        final_score : data.final_score,
                        username : data.username
                    }
                    res.render('scoreboard', {data: passed_data});
                    // res.render('scoreboard', {data: req.body.student_data_json});
                })
                .catch((e) => {
                    console.log("some error in inserting new data");
                    console.log(e);
                });


            } // end of else

         }) 
    })
 });



//   app.post('/sudent-score-page', function (req, res) {
   
//     req.body["student_data_json"] = JSON.parse(req.body["student_data_json"]);
//     console.log(req.body);



//     // check if username exists

//     // if student collection exists, 
//         // check if course exists in the courses
//         // update grades field

//     // else create a new collection with grades ( like groups )

//     MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    
//       if (err) throw err;

//       var db = client.db('test');
//         db.collection('studentdata').insertOne(req.body.student_data_json, function (findErr, result) {
//             if (findErr) throw findErr;
//             console.log('Printing 92');
//             console.log("request",req.body);
//             console.log('I am printing on line 109');
//             res.render('scoreboard',{data : req.body.student_data_json});
//             // res.send('Student score data received:\n' + JSON.stringify(req.body));
          
//             client.close();
//      });
    
//     }); 
    
//     });

/* ************************************************************************ */
// HTTP response header will be defined as:
// "Content-Security-Policy: default-src 'none'; img-src 'self';"


/* post quiz data */

// app.post('/post-feedbacks', function (req, res) {
//   MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
//     if (err) throw err;

//     // var text = req.body["ques_ans_data"];
//     // console.log("text", text);
//     // console.log(typeof(text));


//     // var parsed_text = JSON.parse(text);
//     // console.log("parsed_text", parsed_text);
//     // console.log(typeof(parsed_text));

//     // req.body["ques_ans_data"] = parsed_text;


//     var db = client.db('test');
//     db.collection('feedbacks').insertOne(req.body, function (findErr, result) {
//       if (findErr) throw findErr;
//       console.log('I am printing on line 72');
//       //console.log(result);

//       // var json_object = {
//       //   quiz_data : ""
//       // };

//       // var text = JSON.stringify(req.body) + JSON.stringify(json_object);
//       // console.log("text",text);

//       //var obj = JSON.parse(text);
//       //console.log("Entire json object",req);

//       res.send('Trial quiz data received:\n' + JSON.stringify(req.body));

//       console.log("request",req.body);
//       console.log('I am printing on line 75');
//       client.close();
//     });
  
//   }); 
  
//   });

/*****************************************works without rendering in html file******************************* */

//   app.get('/view-feedbacks',  function(req, res) {
//     MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//       if (err) throw err;

//       var db = client.db('test');
//       db.collection('feedbacks').find({}).toArray().then(function(quizdata) {
//         //console.log("req body", req.body);
//         // var x = res.json(quizdata).length;
//         // console.log(x);
//         //console.log("quizdata", res.status(200).json(quizdata[quizdata.length - 1]));
//         res.status(200).json(quizdata[quizdata.length - 1]);
//       })
//       .catch((e) => {
//           console.log("there is an error in grabbing data to mongodb");
//           console.log(e);
//       });
//   });
// });
         

app.listen(process.env.PORT || 4000, process.env.IP || '0.0.0.0' );
// app.listen(port, () => {
//     console.log("Server listening on port " + port);
// });
