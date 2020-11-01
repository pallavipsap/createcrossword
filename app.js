var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var port = 3000
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
    res.sendFile('app.html', {
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

/*
app.post('/post-feedbacks', function (req, res) {
MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

  if (err) throw err;

  var db = client.db('test');
  db.collection('feedbacks').insertOne(req.body, function (findErr, result) {
    if (findErr) throw findErr;
    console.log('I am printing on line 54');
    //console.log(result);
    res.send('Data received:\n' + JSON.stringify(req.body));
    console.log('I am printing on line 57');
    client.close();
  });

}); 

});*/

app.post('/post-saveForm', function (req, res) {
    MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    
      if (err) throw err;

      var text = req.body["check_qa"];
      console.log("text", text);
      console.log(typeof(text));


      var parsed_text = JSON.parse(text);
      console.log("parsed_text", parsed_text);
      console.log(typeof(parsed_text));

      req.body["check_qa"] = parsed_text;


      var db = client.db('test');
      db.collection('quizdata').insertOne(req.body, function (findErr, result) {
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
    



/*
app.post('/post-feedbacks', function (req, res) {
    //console.log(req);
    mongodb.MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function(err,db) {
        console.log('I am on line 48 printing db',db);
        MongoClient.db.collection('feedbacks').insertOne(req.body);
        console.log('I am on line 50 printing err',err);*/ //commmented out

//     });
//     dbConn.then(function(db) {
//         //delete req.body._id; // for safety reasons
//         console.log('here');
        
//     })  
//     // .catch((e) => {
//     //     console.log("there is an error in sending data to mongodb");
//     //     console.log(e);
//     // });
//         res.send('Data received:\n' + JSON.stringify(req.body));
// });
// });

// read data from DB and display to the user
// app.get('/view-feedbacks',  function(req, res) {
//     MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

//     //if (err) throw err;
//     var db = client.db('test');

//     db.collection('feedbacks').find({}).toArray().then(function(feedbacks_err, feedbacks) {
//         console.log('I am printing on line 97');
//         if (feedbacks_err) throw feedbacks_err;
//         console.log('I am printing on line 99');
//         res.status(200).json(feedbacks);
//         client.close();
//     })
//     .catch((feedbacks_err) => {
//         console.log('I am printing on line 104');
//         console.log(feedbacks_err);
//     }
// );

// });

// });



app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );
/*
app.listen(port, () => {
    console.log("Server listening on port " + port);
});

*/
