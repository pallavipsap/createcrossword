var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 5000
var MongoClient = mongodb.MongoClient

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

app.get('/', (req, res) => {
    res.sendFile('original.html', {
        root: path.join(__dirname, './public/')
    });
});

// console.log(__dirname);
// console.log(path);

//app.listen(4000,()=>console.log('Express server is running at port no. 4000'));
/*
const csp = require('express-csp-header');
app.use(csp({ policies: { 'default-src': [csp.NONE],
        'img-src': [csp.SELF],
    }
}));*/

// HTTP response header will be defined as:
// "Content-Security-Policy: default-src 'none'; img-src 'self';"



app.post('/post-submitQuiz', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  
    if (err) throw err;

    // var text = req.body["ques_ans_data"];
    // console.log("text", text);
    // console.log(typeof(text));


    // var parsed_text = JSON.parse(text);
    // console.log("parsed_text", parsed_text);
    // console.log(typeof(parsed_text));

    // req.body["ques_ans_data"] = parsed_text;


    var db = client.db('test');
    db.collection('tryquizdata').insertOne(req.body, function (findErr, result) {
      if (findErr) throw findErr;
      console.log('I am printing on line 72');
      //console.log(result);

      // var json_object = {
      //   quiz_data : ""
      // };

      // var text = JSON.stringify(req.body) + JSON.stringify(json_object);
      // console.log("text",text);

      //var obj = JSON.parse(text);
      //console.log("Entire json object",req);

      res.send('Quiz Data received:\n' + JSON.stringify(req.body));

      console.log("request",req.body);
      console.log('I am printing on line 75');
      client.close();
    });
  
  }); 
  
  });


  app.get('/view-quiz-data',  function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err;

      var db = client.db('test');
      db.collection('quizdata').find({}).toArray().then(function(quizdata) {
        //console.log("req body", req.body);
        // var x = res.json(quizdata).length;
        // console.log(x);
        //console.log("quizdata", res.status(200).json(quizdata[quizdata.length - 1]));
        res.status(200).json(quizdata[quizdata.length - 1]);
      })
      .catch((e) => {
          console.log("there is an error in grabbing data to mongodb");
          console.log(e);
      });
  });
});


// app.set('view engine', 'ejs');

// app.get('/view-feedbacks',  function(req, res) {
//   MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
//     if (err) throw err;

//     var db = client.db('test');
//     db.collection('quizdata').find({}).toArray().then(function(quizdata) {
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



     

app.listen(process.env.PORT || 5000, process.env.IP || '0.0.0.0' );
/*
app.listen(port, () => {
    console.log("Server listening on port " + port);
});

*/
