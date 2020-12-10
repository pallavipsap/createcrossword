var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 4000
var MongoClient = mongodb.MongoClient
var ejs = require('ejs')
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

app.get('/student-view-quizdata',  function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;
  
      var db = client.db('test');
      db.collection('quizdata').find({}).toArray().then(function(quizdata) {
        //console.log("req body"x, req.body);
        // var x = res.json(quizdata).length;
        // console.log(x);
        //console.log("quizdata", res.status(200).json(quizdata[quizdata.length - 1]));
        console.log("Line 45")
        //res.json(quizdata[quizdata.length - 1]);
  
        var quizdata_1 = quizdata[quizdata.length - 1];
        console.log("reponse from db", quizdata_1);
        
        res.render('render_next',{data : quizdata_1});
        //res.status(200).json(quizdata[quizdata.length - 1])
        
      })
      .catch((e) => {
          console.log("there is an error in grabbing data to mongodb");
          console.log(e);
      });
  });
  });


// this func, posts scores on a page from render_next.ejs page
// stores data in db and goes to scoreboard.ejs

  app.post('/sudent-score-page', function (req, res) {
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    
      if (err) throw err;
  
      var text = req.body["student_data_json"];
      console.log("text", text);
      console.log(typeof(text));
  
  
      var parsed_text = JSON.parse(text);
      console.log("parsed_text", parsed_text);
      console.log(typeof(parsed_text));
  
      req.body["student_data_json"] = parsed_text;
  
    
    // console.log(req.body["student_data_json"]);
      var db = client.db('test');
        db.collection('studentdata').insertOne(req.body.student_data_json, function (findErr, result) {
            if (findErr) throw findErr;
            console.log('Printing 92');
            //console.log(JSON.stringify(req.body));

  
        // var json_object = {
        //   quiz_data : ""
        // };
  
        // var text = JSON.stringify(req.body) + JSON.stringify(json_object);
        // console.log("text",text);
  
        //var obj = JSON.parse(text);
        //console.log("Entire json object",req);
            //console.log(JSON.parse(req.body));
            console.log("request",req.body);
            console.log('I am printing on line 109');
            res.render('scoreboard',{data : req.body.student_data_json});
            // res.send('Student score data received:\n' + JSON.stringify(req.body));
          
            client.close();
     });
    
    }); 
    
    });

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
