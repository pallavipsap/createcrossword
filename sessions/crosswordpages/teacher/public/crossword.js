// May 25
//Version 1: edited during the meeting
//---------------------------------//
//   GLOBAL VARIABLES              //
//---------------------------------//

// default values  - 0
console.log("In crossword.js");
var board, wordArr, wordBank, wordsActive, mode; // default mode = 0

var Bounds = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  Update: function (x, y) {
    this.top = Math.min(y, this.top);
    this.right = Math.max(x, this.right);
    this.bottom = Math.max(y, this.bottom);
    this.left = Math.min(x, this.left);
  },

  Clean: function () {
    // called from CleanVars() , possible to set the board ?
    this.top = 999;
    this.right = 0;
    this.bottom = 0;
    this.left = 999;
  },
};

//---------------------------------//
//   MAIN                          //
//---------------------------------//

var letterArr = document.getElementsByClassName("letter");

function Display(){

  console.log( "I AM IN DISPLAY FUNC")

  // Before this.... fill out qa_id through word bank in this, or do it via words active
  // We need qa_id so that duplicate answers can be differentiated with qa_id

  // ****find mapped value for words
  // *** split into across and down

  // STEP 1 :  Take all indexes and sort the indexes
  // keys stores all the indexes ( x and y)

  var keys = []
  var startIndex = []
  for ( var w = 0; w < wordsActive.length;w++) {
  startIndex.push(wordsActive[w].x)
  startIndex.push(wordsActive[w].y);
  console.log("an array?",startIndex);
  keys.push(startIndex);
  startIndex = [];
  }

  console.log(keys);

  // sort all the indexes ( keys )
  // keys are sorted because we need to compare keys to give a mapped value
  var sorted_keys = keys.sort(function(a, b) {
      if (a[0] == b[0]) {
      return a[1] - b[1];
      }
      return a[0] - b[0];
  });

  console.log("Sorted now",sorted_keys);
  

  // STEP 2: Create keys_dict to create a mapped value
  // keys as index, values as mapped values
  // every index has a different mapped value

  var keys_dict = {};
  var mapped_val = 1
  for ( var w = 0; w <= sorted_keys.length-1; w++) {

      // create a mapped value for a new index, if index( key) is already present we do not need a new mapped value for it
      // Hence we do not need an else for this
      if  (!( sorted_keys[w] in keys_dict)){ // true if key does not exist in dict
          keys_dict[sorted_keys[w]] = mapped_val;
          mapped_val++;

      }
  }
  console.log("mapped values created in dictionary", keys_dict);


  /********************************************************/

  
            //Added now

             // STEP 2 : print mapped values on the crossword , make crossword editable

             var form_key_to_map = ""
             for (var i = 0; i < letterArr.length; i++) {

                console.log(letterArr[i].innerHTML)
                var start_letter = letterArr[i].innerHTML;
                 // create("<div class= 'box stack-top'  style= 'background: red;'></div>");
                 console.log(letterArr[i])
                 form_key_to_map = letterArr[i].attributes["xind"].value + "," + letterArr[i].attributes["yind"].value;
                 console.log(form_key_to_map, keys_dict[form_key_to_map]);
 
                 if ( form_key_to_map in keys_dict) {
                     console.log("inside",letterArr[i]);
                     letterArr[i].innerHTML = start_letter + "<div class= 'box stack-top'>"+ keys_dict[form_key_to_map] + "</div>"; 
                     console.log("updated letterAArr[i]", letterArr[i])
                    // this is how it looks : 

                    // <div class="square letter" xind="12" yind="12">A
                    //     <div class="box stack-top">1</div>
                    // </div>
                    //*********************************************** */

                    //  "<input class='char' type='text' maxlength='1' form = 'submitQuiz' /><div class= 'box stack-top'>"+ keys_dict[form_key_to_map] + "</div>";
                    
                    // "<div class='square letter' xInd=" + letterArr[i].attributes["xind"].value + " "+ "yInd=" + letterArr[i].attributes["yind"].value + ">" + start_letter + "</div>";
                
                    // this does not work
                     /* 
                     child = document.createElement("div");
                     letterArr[i].appendChild(child).class = 'box stack-top';
                     letterArr[i].children[1].innerHTML = keys_dict[form_key_to_map];;
                     console.log("inside",letterArr[i]); */ 
                 }
                 else {
                    //  letterArr[i].innerHTML =
                    //  "<input class='char' type='text' maxlength='1' form = 'submitQuiz' />";
                    console.log("dont do anything")
 
                 }
                 }

            // STEP 3: 
            // 1. fill this mapped value in wordsActive
            // 2. split into across and down
            // 3. form across and down dict to display with questions

            // for across and down
            var startXInd;
            var startYInd;
            var endXInd;
            var endYInd;

            // fill up the mapped attribute in wordsActive
            var form_key = ""
            var across = {} // key as mapped value, value as question
            var down = {}

            console.log("Going to fix orientation");
            for ( var w = 0; w <= wordsActive.length - 1 ;w++) {

                startXInd = wordsActive[w].x;
                startYInd = wordsActive[w].y;
                endXInd = wordsActive[w].endxIndex;
                endYInd = wordsActive[w].endyIndex;
                console.log("xindexes",startXInd, endXInd)
                console.log("yindexes",startYInd, endYInd)
                console.log(wordsActive[w])
                //unique_qa_id = wordsActive[w].qa_id;

                // for every word : check horizontal or vertical
                if ( startXInd == endXInd) { // x constant, vertical word
                    // vertical  word
                    console.log(wordsActive[w].string, " is vertical");
                    wordsActive[w].orientation = "DOWN";
                }

                else if ( startYInd == endYInd) { // y constant, horizontal word
                    // horizontal word
                    console.log(wordsActive[w].string, " is horizontal");
                    wordsActive[w].orientation = "ACROSS";
                } 

                // for every word : fill the mapped attribute
                form_key = startXInd + "," + startYInd; // form key using x and y index from wordsActive
                console.log("form key", form_key);

                // check the same formed key in dictionary to get the mapped value
                wordsActive[w].mapped = keys_dict[form_key];

                // form across and down dictionary to display
                if(wordsActive[w].orientation == "ACROSS"){

                       // currently value is form_key "1" : "12,13"
                        across[keys_dict[form_key]] = form_key; // can use qa_id here to populate value as question
                        //across[keys_dict[form_key]] = wordsActive[w].question + " " + wordsActive[w].ques_ans_id;
                        across[keys_dict[form_key]] = wordsActive[w].question + " " + wordsActive[w].orig_qa_score + " " + wordsActive[w].ques_ans_id; 
                        
                        // value is the dict is now question
                        // recognize question by qa_id

                        // if (qa_id in across) {
                        //     across[keys_dict[form_key]] = 
                        // }
                        //across[keys_dict[form_key]] = json_object.ques_ans_data[wordsActive[w].qa_id - 1].question;
                }
                else {
                    down[keys_dict[form_key]] = form_key;
                    //down[keys_dict[form_key]] = wordsActive[w].question + " " + wordsActive[w].ques_ans_id;
                    down[keys_dict[form_key]] = wordsActive[w].question + " " + wordsActive[w].orig_qa_score + " " + wordsActive[w].ques_ans_id; 
                    // console.log("down",json_object.ques_ans_data[wordsActive[w].qa_id - 1].question);
                    //down[keys_dict[form_key]] = json_object.ques_ans_data[wordsActive[w].qa_id - 1].question;
                }
                console.log(across);
                console.log(down);
                console.log(wordsActive);
            }


            // Step 4 : sort the dictionary on basis of keys ( so that we display in order for students )
            
            // may be not necessary
            sorted_across = Object.keys(across).sort(function(a, b) {
                return across[a] - across[b];
            })

            sorted_down = Object.keys(down).sort(function(a, b) {
                return down[b] - down[a];
            })

            console.log("sorted dict across", sorted_across); // consists of only keys
            console.log("sorted dict down", sorted_down);
            console.log(wordsActive); // with mapped attribute, orientation : across and down, qa_id
            
            // Step 5 : print mapped values on the crossword 
            // done


            // //Step 6 : PRINT here questions with mapped values inside div - ACROSS and DIV

            // clear previous values in table to refill with new values
            console.log("Now I am deleting table content")
            var across_table = document.getElementById("across_list")
            var down_table = document.getElementById("down_list")
            var across_row_count = across_table.rows.length;
            var down_row_count = down_table.rows.length;
            console.log( "Before across row", across_row_count, "down row", down_row_count)
            clearTable(across_table,across_row_count)
            console.log("Across cleared")
            clearTable(down_table,down_row_count)


            function clearTable(my_table,row_count){
              var i = 2;
              for( var i = 2; i<row_count; i++ ){
                console.log("deleting row", i)
                my_table.deleteRow(2); // deletes only top row i.e row 3rd row, because first two rows are ACROSS and  Number, Question, Points

              }
            }

            console.log( "After across row", across_row_count, "down row", down_row_count)


            // refill the values : 

            // let table = document.querySelector("table");
            // let table = document.getElementById("across_list").getElementsByTagName("tbody")[0];
            let table = document.getElementById("at");
            console.log(table)
            //.getElementsByTagName("tbody")[0];
            let data = ["value","question"];
         
            // down = {1: "Bird", 2: " animal"};
            //generateTableHead(table,data);
            generateTable(table,across);

            console.log("with across",table);
            table = document.getElementById("dt");
            generateTable(table,down);
            console.log("with down",table);

            function generateTable(table, data) {
              for (let key in data) {
                  console.log("in generate table");
                  let row = table.insertRow(); // a row inserted <tr>
                  
                  // splitting id and ques in dictionary values
                  var str = data[key] // str is value in dictionary
                  var x = str.split(" ") 
                  var ques = x.slice(0, -2).join(" "); // join words to grab question
                  console.log("question is",ques)

                  // last value in str - ques_ans_id
                  console.log(x.length)
                  row.id = x[x.length - 1]; // grab last word to get id
                  console.log(data[key]);

                  // second last value in str - point
                  console.log(x.length)
                  point = x[x.length - 2]; // grab last word to get id
                  console.log("point",point);

                  let cell1 = row.insertCell(0);
                  let text1 = document.createTextNode(key);
                  cell1.appendChild(text1);

                  // let cell2 = row.insertCell();
                  // let text2 = document.createTextNode(ques);
                  // cell2.appendChild(text2);

                  // using code / pre tag
                  let cell2 = row.insertCell(1);
                  let pre = document.createElement("pre");
                  pre.className = "prettyprint"
                  let text2 = document.createTextNode(ques); // question
                  pre.appendChild(text2);
                  console.log("My pre tag in ques",pre)
                  cell2.appendChild(pre); 

                  let cell3 = row.insertCell(2);
                  let text3;
                  console.log("type of point", typeof(point))
                  if (point == '1'){
                      text3 = document.createTextNode("["+ point + "pt]");
                  }
                  else{
                      text3 = document.createTextNode("["+ point + "pts]");
                  }
                 
                  cell3.appendChild(text3);

                  //let cell3 = row.insertCell();
                  //let text3 = document.createTextNode(style="font-size:150%;font-weight:bold;color:green;">&#10004)
              }
              }   

            // not used
            /* old way without points
            function generateTable(table, data) {
              for (let key in data) {
                  console.log("in generate table");
                  let row = table.insertRow(); // a row inserted <tr>
                  
                  // splitting id and ques in dictionary values
                  var str = data[key]
                  var x = str.split(" ") // grab last word to get id
                  var ques = x.slice(0, -1).join(" "); // join words to grab question

                  console.log(x.length)
                  row.id = x[x.length - 1];
                  console.log(data[key]);

                  let cell1 = row.insertCell();
                  let text1 = document.createTextNode(key);  // question id ( mapped value )
                  cell1.appendChild(text1); 

                  // let cell2 = row.insertCell();
                  // let text2 = document.createTextNode(ques);
                  // cell2.appendChild(text2); // question

                  let cell2 = row.insertCell();
                  let p = document.createElement("code");
                  //p.style.whiteSpace = "pre";
                  let text2 = document.createTextNode(ques); // question
                  p.appendChild(text2);
                  console.log("ques",ques);
                  console.log("text2",text2);
                  console.log("question type",typeof(ques))
                  console.log("My pre tag in ques",p)
                  cell2.appendChild(p); 

                  // let cell2 = row.insertCell();
                  // let pre = document.createElement("pre");
                  // let text2 = document.createTextNode(ques); // question
                  // pre.appendChild(text2);
                  // console.log("My pre tag in ques",pre)
                  // cell2.appendChild(pre); 

                  console.log("These are my rows for across and down", row )
                  //let cell3 = row.insertCell();
                  //let text3 = document.createTextNode(style="font-size:150%;font-weight:bold;color:green;">&#10004)
              }   
              } */

            document.getElementById("float-container").style.display = "block" // remove hide

            // not used yet
            function generateTableHead(table, data) {
                let thead = table.createTHead();
                let row = thead.insertRow();
                console.log(data)
                for (var i = 0; i<data.length;i++) {
                    let th = document.createElement("th");
                    var str = data[i]
                    var lastIndex = str.lastIndexOf(" ");
                    var x = str.split(" ").slice(0, -1).join(" ");
                    console.log(str.substring(0,lastIndex))
                    let text = document.createTextNode(str);
                    th.appendChild(text);
                    row.appendChild(th);
                }
            }
}

// Play button
// function Play() {
//   var letterArr = document.getElementsByClassName("letter");

//   for (var i = 0; i < letterArr.length; i++) {
//     letterArr[i].innerHTML =
//       "<input class='char' type='text' maxlength='1'></input>";
//   }

//   mode = 0;
//   ToggleInputBoxes(false);
// }

// Create button
/*
Goes inside if mode = 0, changes to mode = 1
Calls ToggleInputBoxes : 
makes mode var = 1

*/

// json_object = document.getElementById("ques_ans_data").innerHTML;
// console.log("I am in crosswords.js, check json_object",json_object);

function Create() {
  // mode variable inside function play, go inside if the boxes are blank i.e. mode == 0 ( coming from Play or starting new)

  // if (mode === 0) {
  //   ToggleInputBoxes(true); // inputs are not taken from html file yet

  //   console.log("Inside 'if' of create func")
  //   document.getElementById("crossword").innerHTML = BoardToHtml(" "); // grab all words and clues from id = crossword to send to BoardToHtml
  //   mode = 1; // make mode = 1
  // } else {
    // if mode is already 1 : this helps when we have to update the word, when we click on create multiple times
    
    json_object = document.getElementById("ques_ans_data").innerHTML; // contains qaid, ques, ans, orig_qascore
    console.log("I am in crosswords.js Create(), check json_object",json_object);
    GetWordsFromInput(json_object); // after this function comes back, wordArr is populated with all the words ( except for blanks )
    //document.getElementById("float-container").style.display = "none"

 
    console.log("Check if crossword is generated", document.getElementById("crossword").innerHTML );
    // What does the for loop do ?
    for (var i = 0, isSuccess = false; i < 10 && !isSuccess; i++) {
      CleanVars(); // creates 32 * 32 matrix of null values
      isSuccess = PopulateBoard();
      console.log("Success", isSuccess);
    }
    var n = 1;
    
    if (isSuccess == true){
      document.getElementById("crossword").innerHTML = BoardToHtml(" ")
       // enable link
      //document.getElementById("save_crossword").style.color = "blue"
      
      document.getElementById("save_crossword").disabled = false;
	  //document.getElementById("save_crossword").enabled = true;
      // document.getElementById("save_crossword").style.pointerEvents = "auto"
      console.log("Save button to be enabled", document.getElementById("save_crossword"))
      Display()
    }
    else{
      console.log("going to error out")
      document.getElementById("crossword").innerHTML = ErrorToHtml(n)

    }

    // commented from here
    // document.getElementById("crossword").innerHTML = isSuccess
    //   ? BoardToHtml(" ")
    //   : ErrorToHtml(n)
    //   //console.log("error found"); //ErrorToHtml(n);

    //   if (isSuccess == true ) {
    //     console.log("displaying across and down now");
    //     Display(); // displays questions to students under the crossword
    //   }    
      
}


// Input comes from Create and Play functions
// manage hiding for words, readonly attributes for clues
// clues in not in readonly mode for CREATE
// clues in readonly mode for PLAY

function ToggleInputBoxes(active) {
  // array of words and clues
  var w = document.getElementsByClassName("word"), // from original.html
    d = document.getElementsByClassName("clue"); // from original.html

  for (var i = 0; i < w.length; i++) {
    if (active === true) {
      // Clicked on Create button = active true , mode = 0, disabled
      //<input class="clue" value="This free-ranging dog is at home in the outback."/>
      //<input class="clue clueReadOnly" value="This free-ranging dog is at home in the outback." disabled/> , here **disabled = ""

      RemoveClass(w[i], "hide"); 
      RemoveClass(d[i], "clueReadOnly");
      d[i].disabled = ""; // clues can be edited, no more in disable = readonly mode, no more in readonly mode
    } else {
      // ELSE: Clicked on Play button = active false , mode = 1
      // Clicked on Create button = active true , mode = 0, disabled
      //<input class="clue" value="This free-ranging dog is at home in the outback."/>
      //<input class="clue clueReadOnly" value="This free-ranging dog is at home in the outback." disabled/> , here **disabled = readonly

      AddClass(w[i], "hide");
      AddClass(d[i], "clueReadOnly");
      d[i].disabled = "readonly"; // clues in readonly mode
    }
  }

  //console.log(w); // gives array of [input.word.hide]
  //console.log(d); // gives array of [input.clue.clueReadOnly] //clue readOnly is disabled for CREATE, enabled for PLAY
}

// Call made by Create
function GetWordsFromInput(json_object) {

    console.log("I am in GetWordsFromInput function")
    //var json_object_words = document.getElementById("ques_ans_data").innerHTML
    console.log("my words from ejs file", json_object)

    if (typeof(json_object) == typeof('s')){
      console.log("type BEFORE", typeof(json_object), " converting now") // string
      json_word_list = JSON.parse(json_object)
    }
    else{
      console.log("type AFTER", typeof(json_object), " no need to convert") // type is object
      json_word_list = json_object; // used in for loop below
    }

    // console.log("type BEFORE", typeof(json_object)) // string
    // //json_object = JSON.parse(json_object)
    // //json_word_list = JSON.parse(json_object)
    // console.log("type AFTER", typeof(json_object))
    // console.log("json_object length",json_object.length)
    // json_word_list = json_object
    //wordArr = ['SICK','PIG'];

    wordArr = [];
    for ( var i = 0, val; i < json_word_list.length; i++){ //w = json_object.ques_ans_data;
        val = json_word_list[i].answer.toUpperCase();
        if (val !== null && val.length > 1) {
            // push only non null and more than one lettered words
            wordArr.push(val); // get all words
        }   
        console.log("My answers",wordArr);
      }
      console.log(wordArr); // prints all the words inserted by the user 


    // update total points
    var total_points = 0;
    for(var i = 0; i < json_word_list.length; i++){
        console.log(json_word_list[i].orig_qascore);
        total_points += parseFloat(json_word_list[i].orig_qascore);
    }
    document.getElementById("points_div").value = total_points
    console.log("Total points",total_points)
    console.log("updated total points in browser",document.getElementById("points_div").value)
  }

function CleanVars() {
  Bounds.Clean(); // goes to global function ; // sets up window size ?
  wordBank = [];
  wordsActive = [];
  board = [];

  // Why 32 ? Creates matrix 32*32
  for (var i = 0; i < 50; i++) {
    board.push([]); // create 32 empty arrays
    // console below shows the board entirely in array form , interesting to see !
    //console.log(board); //[..........Array(32), Array(32), Array(32), Array(0)]
    for (var j = 0; j < 50; j++) {
      board[i].push(null); // 32 null values pushed in every array
    }
  }

  console.log("This is my board",board);
}

// returns bool value to isSuccess
function PopulateBoard() {

  PrepareBoard();
  var isOk = true;
  console.log(isOk);
  for (var i = 0, len = wordBank.length; i < len; i++) {
    if (wordBank[i].totalMatches == 0) {
      isOk = false;
      console.log("Word not matching for" + wordBank[i].string);
      //window.onload = Error(wordBank[i].string);

      console.log("my isOk value inside PopulateBoard",isOk)
      var n = 1

      if (isOk == true){
        document.getElementById("crossword").innerHTML = BoardToHtml(" ")
        document.getElementById("save_crossword").style.color = "blue"
        // enable link
        document.getElementById("save_crossword").disabled = false;
		//document.getElementById("save_crossword").enabled = true;
        // document.getElementById("save_crossword").style.pointerEvents = "auto"
        console.log( document.getElementById("save_crossword"))
        Display()
      }
      else{
        console.log("going to error out")
        document.getElementById("crossword").innerHTML = ErrorToHtml(n)
      }

      // commented
      /*
      document.getElementById("crossword").innerHTML = isOk
        ? BoardToHtml(" ")
        : ErrorToHtml(n)// : console.log("error found");
         // Error(wordBank[i].string); */
    }
  }

  //for (var i = 0, isOk = true, len = wordBank.length; i < len && isOk; i++) {
  for (var i = 0, len = wordBank.length; i < len && isOk; i++) {
    isOk = AddWordToBoard();
    //come back here after you try to add word, and it is ok or not
    //if(isOK==false)
    //not a word that can be added
  }
  return isOk;
}

// Called from PopulateBoard ()

// wordBank = [];
// //newWordBank = [];

// version 1 : 
// for (var i = 0, len = wordArr.length; i < len; i++) {
//     // to convert every word to character array ?
//     wordBank.push(new WordObj(wordArr[i])); // WordObj creates key value pairs
//     wordBank[i].ques_ans_id = i+1
//     wordBank[i].question = json_object.quizdata[i].question;
//     console.log()
//     //newWordBank.push(new newWordObj(wordArr[i]));
//     //console.log(wordBank);
// }
// console.log("Inside PrepareBoard func")

// version 2 : 
// wordBank = [];
//   for (var i = 0, len = wordArr.length; i < len; i++) {
//     // to convert every word to character array ?
//     wordBank.push(new WordObj(wordArr[i])); // WordObj creates key value pairs
//     //console.log(wordBank);
//   }
//   console.log(wordBank); // array of all input words = now in form of objects in wordBank

function PrepareBoard() {

  wordBank = [];
  console.log("I am in PrepareBoard function")
  //var json_object_words = document.getElementById("ques_ans_data").innerHTML
  console.log("my words from ejs file", json_object)

  if (typeof(json_object) == 'string'){
    console.log("type BEFORE", typeof(json_object), " converting now") // string
    json_object = JSON.parse(json_object)
  }
  else{
    console.log("type AFTER", typeof(json_object), " no need to convert") // already an object
  }

  // console.log("type BEFORE", typeof(json_object))
  // json_object = JSON.parse(json_object) // need this
  // console.log("type AFTER", typeof(json_object))
  // console.log("json_object length",json_object.length)
  // json_word_list = json_object

  for (var i = 0, len = wordArr.length; i < len; i++) {
    // to convert every word to character array ?
    wordBank.push(new WordObj(wordArr[i])); // WordObj creates key value pairs
    wordBank[i].ques_ans_id = i+1;
    console.log("questions", json_object) 
    wordBank[i].question = json_object[i].question;
    console.log(wordBank[i].question);
    wordBank[i].orig_qa_score = json_object[i].orig_qascore;
  }
  console.log("Inside prepare board func", wordBank); // array of all input words = now in form of objects in wordBank
  // console.log(newWordBank);
    // array of wordObj in wordBank
    // wA = wordObj in wordBank
    // wordBank = [WordObj, WordObj, WordObj....]
    // wA = wordBank[i] = WordObj {string: "TUCAN", char: Array(5), totalMatches: 0, effectiveMatches: 0, successfulMatches: Array(0)}
    // cA is every character

    for (i = 0; i < wordBank.length; i++) {
      // no. of iterations = no. of input words
      // wordBank = [WordObj, WordObj, WordObj....]
      //wA = wordBank[i] = WordObj {string: "TUCAN", char: Array(5), totalMatches: 0, effectiveMatches: 0, successfulMatches: Array(0)}
      for (var j = 0, wA = wordBank[i]; j < wA.char.length; j++) {
        // no. of iterations = no. of characters in that word
        // wA.char.length = gives length of every word
        // console.log(wordBank[i]); // shows what wordObj consists of
        // console.log(wordBank[i], "I am j", j);
        for (var k = 0, cA = wA.char[j]; k < wordBank.length; k++) {
          // char[j] traverses
          //console.log(cA, j, k); //cA prints every character
          for (var l = 0, wB = wordBank[k]; k !== i && l < wB.char.length; l++) {
            wA.totalMatches += cA === wB.char[l] ? 1 : 0;
          }
        }
      }
      console.log(wA, wA.totalMatches); // gives total no. of matches for every word
      console.log("Obj in wordbank",wA, wA.totalMatches); // gives total no. of matches for every word
    }
    // documenby ID , span with error message
}

 // TODO: Clean this guy up
 function AddWordToBoard() {

  console.log("In AddWordToBoard func");
  var i,
  len,
  curIndex,
  curWord,
  curChar,
  curMatch,
  testWord,
  testChar,
  minMatchDiff = 9999,
  curMatchDiff;

  if (wordsActive.length < 1) {
  curIndex = 0;
  for (i = 0, len = wordBank.length; i < len; i++) {

      if (wordBank[i].totalMatches < wordBank[curIndex].totalMatches) {
      curIndex = i;
      }
  }
  wordBank[curIndex].successfulMatches = [{ x: 12, y: 12, dir: 0 }];
  console.log("inside if", wordBank[curIndex].string);
  } else {
  curIndex = -1;

  for (i = 0, len = wordBank.length; i < len; i++) {
      
      curWord = wordBank[i];
      console.log("inside else", curWord.string);
      curWord.effectiveMatches = 0;
      curWord.successfulMatches = [];
      for (var j = 0, lenJ = curWord.char.length; j < lenJ; j++) {
      curChar = curWord.char[j];
      for (var k = 0, lenK = wordsActive.length; k < lenK; k++) {
          testWord = wordsActive[k];
          for (var l = 0, lenL = testWord.char.length; l < lenL; l++) {
          testChar = testWord.char[l];
          if (curChar === testChar) {
              curWord.effectiveMatches++;

              var curCross = { x: testWord.x, y: testWord.y, dir: 0 };
              if (testWord.dir === 0) {
              curCross.dir = 1;
              curCross.x += l;
              curCross.y -= j;
              } else {
              curCross.dir = 0;
              curCross.y += l;
              curCross.x -= j;
              }

              var isMatch = true;

              for (var m = -1, lenM = curWord.char.length + 1; m < lenM; m++) {
              var crossVal = [];
              if (m !== j) {
                  if (curCross.dir === 0) {
                  var xIndex = curCross.x + m;

                  if (xIndex < 0 || xIndex > board.length) {
                      isMatch = false;
                      break;
                  }

                  crossVal.push(board[xIndex][curCross.y]);
                  crossVal.push(board[xIndex][curCross.y + 1]);
                  crossVal.push(board[xIndex][curCross.y - 1]);
                  } else {
                  var yIndex = curCross.y + m;

                  if (yIndex < 0 || yIndex > board[curCross.x].length) {
                      isMatch = false;
                      break;
                  }

                  crossVal.push(board[curCross.x][yIndex]);
                  crossVal.push(board[curCross.x + 1][yIndex]);
                  crossVal.push(board[curCross.x - 1][yIndex]);
                  }

                  if (m > -1 && m < lenM - 1) {
                  if (crossVal[0] !== curWord.char[m]) {
                      if (crossVal[0] !== null) {
                      isMatch = false;
                      break;
                      } else if (crossVal[1] !== null) {
                      isMatch = false;
                      break;
                      } else if (crossVal[2] !== null) {
                      isMatch = false;
                      break;
                      }
                  }
                  } else if (crossVal[0] !== null) {
                  isMatch = false;
                  break;
                  }
              }
              }

              if (isMatch === true) {
              curWord.successfulMatches.push(curCross);
              }
          }
          }
      }
      }

      curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;

      if (curMatchDiff < minMatchDiff && curWord.successfulMatches.length > 0) {
      curMatchDiff = minMatchDiff;
      curIndex = i;
      } else if (curMatchDiff <= 0) {
      return false;
      }
  }
  //console.log("wordBank inside AddwordtoBoard",curWord,wordBank);
  }

  if (curIndex === -1) {
  return false;
  }

  var spliced = wordBank.splice(curIndex, 1);
  console.log("spliced word",spliced[0]);



  wordsActive.push(spliced[0]);
  wordsActive[wordsActive.length - 1].string;
  console.log("Check this word in wordsActive",wordsActive[wordsActive.length - 1].string);


  var pushIndex = wordsActive.length - 1,
  rand = Math.random(),
  matchArr = wordsActive[pushIndex].successfulMatches,
  matchIndex = Math.floor(rand * matchArr.length),
  matchData = matchArr[matchIndex];

  wordsActive[pushIndex].x = matchData.x;
  wordsActive[pushIndex].y = matchData.y;
  wordsActive[pushIndex].dir = matchData.dir;


  for (i = 0, len = wordsActive[pushIndex].char.length; i < len; i++) {
  var xIndex = matchData.x,
      yIndex = matchData.y;

  if (matchData.dir === 0) {
      xIndex += i;
      board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
  } else {
      yIndex += i;
      board[xIndex][yIndex] = wordsActive[pushIndex].char[i];
  }

  console.log("wordsActive",wordsActive);
  Bounds.Update(xIndex, yIndex); // update the bound
  console.log(xIndex,yIndex); // prints index for every letter of a word
  //var x = board;
  //console.log(x);
  }

  console.log("ending x index", xIndex, "ending", yIndex);
  wordsActive[wordsActive.length - 1].endxIndex = xIndex;
  wordsActive[wordsActive.length - 1].endyIndex = yIndex;

  //return [true,xIndex,yIndex];
  return true;
  }

/*
function ErrorForBlank() {
  str += "";
  str += "<div class='row'>";
  str += "<font color='white'>Null value detected";
  str += "</font></div>";
  return str;
}*/

function Error(word) {
  //val = word
  console.log("this is In error func ", word);
  str = "";
  str += "<div class='row'>";
  str += "<font color='white'>The error is at";
  str += word;
  str += "</font></div>";
  return str;
  //x = document.getElementById("error-message-3");
  //x.innerHTML = "error here" + word;
}


function ErrorToHtml(n) {
  console.log("here in ErrorToHtml");

  
  document.getElementById("float-container").style.display = "none" // remove hide
  str = "<span class='row' style='color:white;'>Crossword cannot be generated</span>"
  document.getElementById("save_crossword").disabled = true;  
  //document.getElementById("save_crossword").style.color = "black"
  console.log("Save button to be disbaled", document.getElementById("save_crossword"))
  console.log(str);
  return str;

  //changed :
  
  // if (n == 1) { 

    // var span = document.createElement("span")
    // span.innerHTML = "Crossword cannot be generated"
    // span.style.color = "white"
    // console.log(span)


    // var crossword_div = document.getElementById("crossword")
    // console.log("div before",crossword_div.innerHTML);
    // //crossword_div.innerHTML = "cannot be generated"
    // console.log(crossword_div)
   

    //document.getElementById("crossword").innerHTML = "not generated"

    // crossword_div.append(span)
    // console.log(crossword_div)
    // console.log("after",crossword_div.innerHTML)

    // document.getElementById("crossword").appendChild(str)
}

//create board ?
function BoardToHtml(blank) {

  console.log("In BoardToHtml func");
  console.log("Bounds.top",Bounds.top);
  console.log("Bounds.bottom", Bounds.bottom);
  for (var i = Bounds.top - 1, str = ""; i <= Bounds.bottom + 1; i++) { //  y index = i
  // one row ( null + letters)
  console.log("This is row number", i);
  str += "<div class='row'>";

  console.log("Bounds.left",Bounds.left);
  console.log("Bounds.right", Bounds.right);
  for (var j = Bounds.left - 1; j <= Bounds.right + 1; j++) { // x index = j

      // print left to right matrix[x][y]
      console.log(board[j][i], j , i); // grabs all letters in every row //PRINT THIS IN REPORT
      str += BoardCharToElement(board[j][i],j,i); // div for every element
  }
  str += "</div>";


  // str gives every row of the board in html format
  // keeps appending more divs
  console.log("printing row and appending");
  console.log("str",str); // PRINT THIS IN REPORT
  }
  return str; // coverts all letters in div form
  }

  // makes div for a given character
  function BoardCharToElement(c,xInd,yInd) {
    //console.log("In boardChartoElement func", c); //**
    var arr = c ? ["square", "letter"] : ["square"]; // square letter if char should be placed on the board
    //console.log(c,arr);
    return EleStr("div", [{ a: "class", v: arr }], c, xInd, yInd);
    }

//---------------------------------//
//   OBJECT DEFINITIONS            //
//---------------------------------//

// Called from PrepareBoard ()
// Input taken from wordArr and converted to char array
function WordObj(stringValue) {
  this.string = stringValue;
  this.char = stringValue.split("");
  //console.log(this.char); // prints a char array : ["T", "U", "C", "A", "N"]
  this.totalMatches = 0;
  this.effectiveMatches = 0;
  this.successfulMatches = [];
  this.ques_ans_id = 0;
  this.question = "";
  this.orig_qa_score = 0;
}

//---------------------------------//
//   EVENTS                        //
//---------------------------------//

// function RegisterEvents() {
//   document.getElementById("crossword").onfocus = function () {
//     return false;
//   };
//   document.getElementById("btnCreate").addEventListener("click", Create, false);
//   document.getElementById("btnPlay").addEventListener("click", Play, false);
// }
// RegisterEvents();

//---------------------------------//
//   HELPER FUNCTIONS              //
//---------------------------------//

function EleStr(e, c, h, xInd, yInd) {
  // console.log("e",e); // div **
  // console.log("c",c); // **
  // console.log("h",h); // letter or null **

  h = h ? h : ""; // h can be letter or a blank (null)
  for (var i = 0, s = "<" + e + " "; i < c.length; i++) { // length = 1
  // s = < div + ""
  // c[i].a = "class"

  s += c[i].a + "='" + ArrayToString(c[i].v, " ") + "' ";
  // console.log("s",s); // **
  // letter :
  // <div class = 'square letter'

  // no letter :
  // < div clas = 'square'
  }

  s += "xInd=" + xInd + " " + "yInd=" + yInd + ">";
  return s + h + "</" + e + ">"; // complete making div
  // letter  div: <div class = "square letter"></div>
  // no letter div : <div class = "square"></div>
  }

  function ArrayToString(a, s) {
    if (a === null || a.length < 1) return "";


    // if below is not needed
    if (s === null) s = ",";
    //console.log("S inside array to string",s); //** 
    // console.log("a len",a.length); // **
    // goes inside for only if letters are found (only if a.length = 2)

    for (var r = a[0], i = 1; i < a.length; i++) { // starts at r = a[0]
    r += s + a[i]; // square += " + " + "letter";
    }
    // console.log("r",r); // returns string : square letter ( if letter ) OR square ( if null)
    return r;
    }

// Input comes from ToggleInputBoxes == active is false
/* Called twice :
First time : ele = w[i] ( word ), classStr = "hide"
Second time : ele = w[i] ( word ), classStr = "clueReadOnly" */
function AddClass(ele, classStr) {
  //w[i].className
  ele.className = ele.className.replaceAll(" " + classStr, "") + " " + classStr; //function (replaceThis, withThis)
  //console.log(ele);
}

// RemoveClass  : Input comes from ToggleInputBoxes == active is true
/* Called twice :


First time : ele = w[i], classStr = "hide"
( Below : putting console.log ( d ) in ToggleInputBoxes )
 For words : ( putting console.log ( w ) in ToggleInputBoxes )
   eg. <input class="word" type="text" value="Tucan" />
       <input class="word hide" type="text" value="Tucan" 


Second time : ele = w[i], classStr = "clueReadOnly"   
( Below : putting console.log ( d ) in ToggleInputBoxes )
  For clues :  
    eg. <input class="clue" value="This free-ranging dog is at home in the outback."/>
        <input class="clue clueReadOnly" value="This free-ranging dog is at home in the outback." disabled/>
*/

function RemoveClass(ele, classStr) {
  ele.className = ele.className.replaceAll(" " + classStr, ""); //function (replaceThis, withThis)
  // For words :
  // eg. <input class="word" type="text" value="Tucan" />
  //   <input class="word hide" type="text" value="Tucan"
}

function ToggleClass(ele, classStr) {
  var str = ele.className.replaceAll(" " + classStr, "");
  ele.className =
    str.length === ele.className.length ? str + " " + classStr : str;
}

String.prototype.replaceAll = function (replaceThis, withThis) {
  // replaceThis = " " + classStr
  var re = new RegExp(replaceThis, "g");
  return this.replace(re, withThis);
};

//---------------------------------//
//   INITIAL LOAD                  //
//---------------------------------//

//Create();
console.log("printing out the mode",json_object.mode)
if (json_object.mode == "edit" || json_object.mode == "duplicate"){
  //console.log("show json object in crossword.js",json_object)
  Create();
  
}
// Play();
