// May 25
//Version 1: edited during the meeting

//---------------------------------//
//   GLOBAL VARIABLES              //
//---------------------------------//

// default values  - 0
console.log("In crossword folder, js.js");
var board, wordArr, wordBank, wordsActive, mode; // default mode = undefined
var newWordBank = [];
console.log("global variable", mode);

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
var letterArr = document.getElementsByClassName("letter"); // HTML collection
// Play button
function Play() {
  console.log("In play mode is", mode);

  // letterArr is the array of boxes which have letters in it
  //var letterArr = document.getElementsByClassName("letter");
  // console.log(letterArr);
  // for (var i = 0; i < letterArr.length; i++) {

  //   console.log("Inside for loop");
  //   letterArr[i].innerHTML =
  //   "<input class='char' type='text' maxlength='1' form = 'submitQuiz' /><div class= 'box stack-top'  style= 'background: red;'></div>";
      // "<div><input class='char' type='text' maxlength='1' form = 'submitQuiz' /></div><div class= 'box stack-top' style='background: blue;'> 2 </div>";
      
    // console.log(letterArr[i]); prints all divs, hover over and check
    //letterArr[i].getElementsByTagName("input")[0] ; gives all the input tags
    // console.log(letterArr[i].getElementsByTagName("input")[0].type); // prints text

    // add form to the input type
    // add_form = letterArr[i].getElementsByTagName("input")[0];
    // add_form.form = 'submitQuiz';
    //console.log("After",letterArr[i].getElementsByTagName("div")[0]);
    //console.log(letterArr[i].getElementsByTagName("input")[0]);
  // }

  console.log("letterArr",letterArr);
  console.log("in Play func",wordsActive);

  mode = 0; // make mode 0
  ToggleInputBoxes(false); // go to this function and hide answers
  Display();
}



// sort the indexes
// mapped values found
// split in across and down
// no comparison

function Display(){

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



  // STEP 2 : print mapped values on the crossword , make crossword editable

  var form_key_to_map = ""
  for (var i = 0; i < letterArr.length; i++) {

    // create("<div class= 'box stack-top'  style= 'background: red;'></div>");
    form_key_to_map = letterArr[i].attributes["xind"].value + "," + letterArr[i].attributes["yind"].value;
    console.log(form_key_to_map, keys_dict[form_key_to_map]);

      if ( form_key_to_map in keys_dict) {
        console.log("inside",letterArr[i]);
        letterArr[i].innerHTML= 
        "<input class='char' type='text' maxlength='1' form = 'submitQuiz' /><div class= 'box stack-top'>"+ keys_dict[form_key_to_map] + "</div>";
        // this does not work
        /* 
        child = document.createElement("div");
        letterArr[i].appendChild(child).class = 'box stack-top';
        letterArr[i].children[1].innerHTML = keys_dict[form_key_to_map];;
        console.log("inside",letterArr[i]); */ 
      }
      else {
        letterArr[i].innerHTML =
    "<input class='char' type='text' maxlength='1' form = 'submitQuiz' />";

      }
    }

 
  //STEP 3: 
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

  // for every word
  for ( var w = 0; w <= wordsActive.length - 1 ;w++) {


      startXInd = wordsActive[w].x;
      startYInd = wordsActive[w].y;
      endXInd = wordsActive[w].endxIndex;
      endYInd = wordsActive[w].endyIndex;

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
      // put a mapped value for that word
      wordsActive[w].mapped = keys_dict[form_key];

      // form across and down dictionary to display
      if(wordsActive[w].orientation == "ACROSS")

          across[keys_dict[form_key]] = form_key; // can use qa_id here to populate value as question
      else 
          down[keys_dict[form_key]] = form_key;

      console.log(across);
      console.log(down);

  }


  // Step 4 : sort the dictionary on basis of keys ( so that we display in order for students )

  // may be not necessary
  sorted_across = Object.keys(across).sort(function(a, b) {
      return across[a] - across[b];
  })

  sorted_down = Object.keys(down).sort(function(a, b) {
      return down[b] - down[a];
  })

  console.log("sorted dict across", sorted_across); 
  console.log("sorted dict down", sorted_down);
  console.log(wordsActive); // with mapped attribute, orientation : across and down, qa_id

  // STEP 5 : Print questions on the page

  // PRINT here questions with mapped values 

  // inside div

  // call submit function
  // Submit()
}

// compares answer and generates score

function Submit(){

  var check = [];
  console.log("In submit func");
  console.log(letterArr);
  //console.log("HERE IS SUBMIT FUNCT", letterArr[0]);

  // div class looks like this
  // code below prints this : 
  /*
  <div class = "square letter">
      <input class="char" type = "text" maxlength = "1" form = "submitQuiz"></input>
  </div>
  */

  // Step 1 : form dictionary with index as keys, student letters as values

  var dict = {};
  console.log("check answers in form of letters here");
  for (var i = 0; i < letterArr.length; i++) {
      // gives value inside text box after answering.
      check = letterArr[i]; // PRINTS ALL DIVS
      console.log(check);
      console.log(letterArr[i].attributes["xind"].value);
      
      // put a space for blank entries by student
      if (letterArr[i].getElementsByTagName('input')[0].value == ""){
        dict [letterArr[i].attributes["xind"].value + " " + letterArr[i].attributes["yind"].value] = " "
      }
      else {
        dict [letterArr[i].attributes["xind"].value + " " + letterArr[i].attributes["yind"].value] = letterArr[i].getElementsByTagName('input')[0].value;
      }
      console.log(dict);
      //console.log(check.value);
  } 
  

  // Step 2 : Compare answers and give a score
  // form answers ( words ) using indexes to compare with actual answers
  // give a score to be inserted in database
  // create score and student ans atribute in wordsActive

  var startXInd;
  var startYInd;
  var endXInd; 
  var endYInd;
  // var student_answers = []; think about this when time comes
  var quiz_score = 0

// for every word
for( w = 0; w < wordsActive.length; w++){

  var word = wordsActive[w].string;
  var letter_array = wordsActive[w].char; // array of letters
  var l = 0;
  var ans = "";
  var make_key = "";
  var flag = true; // consider answer is correct
  startXInd = wordsActive[w].x;
  startYInd = wordsActive[w].y;
  endXInd = wordsActive[w].endxIndex;
  endYInd = wordsActive[w].endyIndex;
  console.log(word, letter_array, startXInd, endYInd);


  // for every letter in a word
  for (var x = startXInd , y = startYInd, word_length = 1 ; word_length <= letter_array.length ; word_length++ ){

      // every letter - new key
      make_key = x + " " + y;
      console.log(x);
      console.log(y);
      console.log("in if check with this key", make_key);
      console.log(typeof(make_key)) // string

      if ( letter_array[l] == dict[make_key] ){
          console.log("matched letter",dict[make_key]); 
      }
      else {
          console.log("no matched letter",dict[make_key]); 
          flag = false // worng answer
      }

      ans += dict[make_key]; // append every letter to form answer
      l++; // next letter in word
      make_key = ""; // new key for the letter

      if (wordsActive[w].orientation == "DOWN") {
           y++;
      }
      else x++;  
      
    }

  // word is formed : update score and student answer in wordsActive
   console.log(ans);
   wordsActive[w].student_ans = ans.toUpperCase();
   if (flag == true){
      wordsActive[w].score = 1;
      quiz_score+=1 // quiz score to be show to student and stored in Database
   }
   else wordsActive[w].score = 0

}

console.log("final quiz score", quiz_score);
console.log(wordsActive); // contains score and student ans attribute

}


// Create button
/*
Goes inside if mode = 0, changes to mode = 1
Calls ToggleInputBoxes : 
makes mode var = 1

*/

// Goes into create 1st, at the start of the code
function Create() {
  // mode variable inside function play, go inside if the boxes are blank i.e. mode == 0 ( coming from Play or starting new)
  console.log("In create, mode is", mode);
  
  if (mode === 0) {

    Submit(); // when clicked on submit button

    // grabbed answers
    console.log("letterArr ans",letterArr);

    console.log("In create, making boxes true now", mode);
    ToggleInputBoxes(true); // inputs are not taken from html file yet - making answers visible now

    console.log("Inside 'if' of create func")
    //document.getElementById("crossword").innerHTML = BoardToHtml(" "); // grab all words and clues from id = crossword to send to BoardToHtml
    mode = 1; // make mode = 1
  } else {
    console.log("In create, getting input now", mode);
    // if mode is already 1 : this helps when we have to update the word, when we click on create multiple times
    GetWordsFromInput(); // after this function comes back, wordArr is populated with all the words ( except for blanks )

    //***************** */ What does the for loop do ? == works even after removing
    // i < 10 && True ( i.e. isSuccess is False) then only it wil go inside
    // this can be used to check MAT BAT CAT

    for (var i = 0, isSuccess = false; i < 10 && !isSuccess; i++) { 
      CleanVars(); // creates 32 * 32 matrix of null values
      isSuccess = PopulateBoard(); // returns isOk from AddWordtoBoard function
      //console.log("isSuccess in create func", isSuccess);
    }
    var n = 1;

    console.log("***********************");
    // for(i = 0; i < newWordBank.length ; i++) {
    //   console.log(newWordBank[i]);
    // }

    console.log(newWordBank);

    // start creating board to be displayed on html page
    // all words are good to be inserted
    console.log("Call boardtohtml now");
    document.getElementById("crossword").innerHTML = isSuccess
      ? BoardToHtml(" ")
      : console.log("error found"); //ErrorToHtml(n);

      // once board is displayed call Display function to display questions
   

  }
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
    if (active === true) { // CREATE

      // Clicked on Create button = active true , mode = 0
      //<input class="clue" value="This free-ranging dog is at home in the outback."/>
      //<input class="clue clueReadOnly" value="This free-ranging dog is at home in the outback." disabled/> , here **disabled = ""

      RemoveClass(w[i], "hide"); // removes "hide" -- makes answers visible
      RemoveClass(d[i], "clueReadOnly");
      d[i].disabled = ""; // clues can be edited, no more in disable = readonly mode, no more in readonly mode
    } else { // PLAY

      // ELSE: Clicked on Play button = active false , mode = 1
      //<input class="clue" value="This free-ranging dog is at home in the outback."/>
      //<input class="clue clueReadOnly" value="This free-ranging dog is at home in the outback." disabled/> , here **disabled = readonly

      AddClass(w[i], "hide"); // adds "hide" - hides answers
      AddClass(d[i], "clueReadOnly");
      d[i].disabled = "readonly"; // clues in readonly mode
    }
  }

  //console.log(w); // gives array of [input.word.hide]
  //console.log(d); // gives array of [input.clue.clueReadOnly] //clue readOnly is disabled for CREATE, enabled for PLAY
}

// Call made by Create , does not return anything
function GetWordsFromInput() {
  wordArr = [];
  
  for ( var i = 0, val, w = document.getElementsByClassName("word"); i < w.length; i++) {

    console.log("WORD ?",w)
    val = w[i].value.toUpperCase();
    // here all empty words ( no words ) are not pushed in the array, one lettered word not accepted
    if (val !== null && val.length > 1) {
      // push only non null and more than one lettered words
      wordArr.push(val); // get all words
    }
    // changed here :
    else {
      var n = 1;
      console.log("null value ignored"); // when any null value is encountered start to end
      //document.getElementById("crossword").innerHTML = ErrorForBlank();
    }
    console.log(wordArr); // prints all the words inserted by the user
  }
}

function CleanVars() {

  console.log("Inside CLEANVARS func");
  
  Bounds.Clean(); // goes to global function ; // sets up window size ?
  wordBank = [];
  wordsActive = [];
  board = [];
  checkboard = []
  checkboard = board;

  // Why 32 ? Creates matrix 32*32
  for (var i = 0; i < 32; i++) {
    board.push([]); // create 32 empty arrays
    // console below shows the board entirely in array form , interesting to see !
    //console.log(board); //[..........Array(32), Array(32), Array(32), Array(0)]
    //console.log("outer for",board);
    for (var j = 0; j < 32; j++) {
      board[i].push(null); // 32 null values pushed in every array
      //console.log("checkboard",checkboard);
      //console.log("inner for",board);
    }
  }
  console.log("This is my BOARD", board);
  
}

// returns bool value to isSuccess
function PopulateBoard() {
  PrepareBoard();

  var isOk = true; // consider all words are matching already

  for (var i = 0, len = wordBank.length; i < len; i++) {

    // even if one word has 0 total matches
    if (wordBank[i].totalMatches == 0) {
      isOk = false; // make false if even one word does not match
      console.log("Word not matching for" + wordBank[i].string);
      //window.onload = Error(wordBank[i].string);

    
      // Written by me ( only if word cannot be inserted do this)
      // Error function works partially
      document.getElementById("crossword").innerHTML = isOk
        ? BoardToHtml(" ")
        : Error(wordBank[i].string); //console.log("error found");
    }
  }

  // If all words have matches, crossword can be created possibly**** because cases like MAT BAT CAT still are not tracked until this step

  //for (var i = 0, isOk = true, len = wordBank.length; i < len && isOk; i++) {

  /* here cases like MAT BAT CAT can be tracked
  try to add all the words to the board 
  
  //come back here after you try to add word, and it is ok or not
  //if(isOK==false)
  //not a word that can be added */

  console.log("BEFORE adding word to Board",wordBank);
  for (var i = 0, len = wordBank.length; i < len && isOk; i++) {

    isOk = AddWordToBoard();
    //console.log(wordBank[0]);
    // console.log("i is", i,wordBank);
    // returned_val = AddWordToBoard();
    // isOk = returned_val[0];
    //console.log("Word is here",wordBank[i].string);
    

    // console.log(returned_val);
    // console.log(typeof(returned_val));
    // console.log(Object.keys(returned_val).length);

    // if (Object.keys(returned_val).length == 3) {
      
    //   console.log("inside", isOk);
    //   console.log(returned_val);
    //   wordBank[i].endxIndex = returned_val[1];
    //   wordBank[i].endyIndex = returned_val[2];
    //   console.log("Here",wordBank[i]);
    // }
    
  }
  console.log("AFTER adding word to Board",wordBank);
  console.log("inside populate board newWordBank", newWordBank);
  console.log("inside populate board wordActive", wordsActive);

  

  // when I return isOk = true , it means all words can be added
  return isOk; // returns isOk to Create func 
}

// Called from PopulateBoard ()
// just fills wordBank , does not return anything
function PrepareBoard() {
  wordBank = [];
  //newWordBank = [];

  for (var i = 0, len = wordArr.length; i < len; i++) {
    // to convert every word to character array ?
    wordBank.push(new WordObj(wordArr[i])); // WordObj creates key value pairs
    newWordBank.push(new newWordObj(wordArr[i]));
    //console.log(wordBank);
  }
  console.log("Inside PrepareBoard func")
  console.log(wordBank); // array of all input words = now in form of objects in wordBank
  console.log(newWordBank);
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
    console.log("Obj in wordbank",wA, wA.totalMatches); // gives total no. of matches for every word
  }
  // documenby ID , span with error message

  // create a shallow copy
  //let newWordBank = Object.assign({},wordBank);

  // create a deep copy
  //newWordBank = JSON.parse(JSON.stringify(wordBank));
  //console.log("My new wordbank",newWordBank);
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


//create board in HTML format  - add every row
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
//   HELPER FUNCTIONS              //
//---------------------------------//

// Incase of letter is present
// e = div
// c = [ { a : "class", v : [ "square", "letter"]}] ( length of v = 2)
// h = P ( its the letter )

// If no letter present
// c = [ { a : "class", v : [ "square"] }] ( lenth of v = 1)
// h = null

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

// letter : 
// a  = c[i].v = c[0].v = ["square", "letter"]  --> a.length = 2
// a[0] = "square", a[1] = "letter"
// s = " "

// no letter : 
// a  = c[i].v = c[0].v = [square] --> a.length = 1
// a[0] = "square",
// s = " "
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
  this.endxIndex = 0;
  this.endyIndex = 0;
}


// not used here
function newWordObj(stringValue) {
  this.string = stringValue;
  //this.char = stringValue.split("");
  this.endxIndex = 0;
  this.endyIndex = 0;
}


// CLicked on Play
// Input comes from ToggleInputBoxes == active is false
/* Called twice :
First time : ele = w[i] ( word ), classStr = "hide"
Second time : ele = w[i] ( word ), classStr = "clueReadOnly" */
function AddClass(ele, classStr) { // adds classStr == hide and clueReadonly
  //w[i].className
  ele.className = ele.className.replaceAll(" " + classStr, "") + " " + classStr; //function (replaceThis, withThis)
  console.log("Add Class",ele);
}


// Clicked on Create == Hides the clues and puts questions in read only mode
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
//   EVENTS                        //
//---------------------------------//

function RegisterEvents() {
  // when you focus on crossword, it triggers a function which returns false

  // document.getElementById("crossword").onfocus = function () {
  //   return false;
  // };

  // addEventListener
  // - string that specifies event name
  // - function name = to be called
  // false- Default. The event handler is executed in the bubbling phase
  // true - The event handler is executed in the capturing phase

  document.getElementById("btnCreate").addEventListener("click", Create, true); // called 1st
  document.getElementById("btnPlay").addEventListener("click", Play, true); // called after play
}
RegisterEvents();



//---------------------------------//
//   INITIAL LOAD                  //
//---------------------------------//

// Create();
// Play();

//**********unsused functions ****************/
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

/*
function ErrorToHtml(n) {
  console.log("here in ErrorToHtml");

  //changed :
  
  if (n == 1) str = "";
  str += "<div class='row'>";
  str += "<font color='white'>Null value detected";
  str += "</font></div>";
  
  //-----------------------------
  str = "";
  str += "<div class='row'>";
  str += "<font color='white'>failed after!";
  for (var j = 0; j < wordArr.length; j++) {
    find = false;
    for (var i = 0; i < wordBank.length; i++) {
      if (wordArr[j] == wordBank[i].string) {
        console.log(wordArr[j]);
        console.log(wordBank[i].string);
        find == true;
        break; // gets you out once one word has failed
      }
    }
    if (find == false) str += wordArr[j];
  }
  str += "</font></div>";
  return str;
}
/*


//-------------------------------------------------------------


// old submit function 

// function Submit() {

//   var check = [];
//   console.log("In submit func");
//   console.log(letterArr);
//   //console.log("HERE IS SUBMIT FUNCT", letterArr[0]);

//   // div class looks like this
//   // code below prints this : 
//   /*
//   <div class = "square letter">
//     <input class="char" type = "text" maxlength = "1" form = "submitQuiz"></input>
//   </div>
//   */
  
//   // form dictionary with index as keys, student letters as values
//   var dict = {};
//   console.log("check answers here");
//   for (var i = 0; i < letterArr.length; i++) {
//     // gives value inside text box after answering.
//     check = letterArr[i]; // PRINTS ALL DIVS
//     console.log(check);
//     console.log(letterArr[i].attributes["xind"].value);
//     dict [letterArr[i].attributes["xind"].value + " " + letterArr[i].attributes["yind"].value] = letterArr[i].getElementsByTagName('input')[0].value;
//     console.log(dict);
//     //console.log(check.value);
//   } 

//   // to compare answers , check the score here

//   var startXInd;
//   var startYInd;
//   var endXInd;
//   var endYInd;
//   var student_answers = [];
//   var score = 0


//   // evey word
//   for( w = 0; w < wordsActive.length; w++){

//       var word = wordsActive[w].string;
//       var letter_array = wordsActive[w].char; // array of letters
//       var l = 0;
//       var ans = "";
//       var flag = true
//       var make_key = ""
//       startXInd = wordsActive[w].x;
//       startYInd = wordsActive[w].y;
//       endXInd = wordsActive[w].endxIndex;
//       endYInd = wordsActive[w].endyIndex;

//       console.log(word, letter_array, startXInd, endYInd);

//       // for every word : check horizontal or vertical
//       if ( startXInd == endXInd) { // x constant, vertical word

//         // vertical  word
//         console.log("vertical");

//         // every letter
//         wordsActive[w].orientation = "DOWN";
//         for (var x = startXInd , y = startYInd, word_length = 1 ; word_length <= letter_array.length ; y++){

//           // every letter - new key
//           make_key = x + " " + y;
//           console.log(x);
//           console.log(y);
//           console.log("in if check with this key", make_key);
//           console.log(typeof(make_key))
//           if ( letter_array[l] == dict[make_key] ){
//             console.log("matched letter",dict[make_key]);  
//           }
//           ans += dict[make_key]; // append every letter
//           make_key = ""
//           l++;
//           word_length++
//         }

//       }
//       else {
//         // horizontal word
//         console.log("horizontal");
//         wordsActive[w].orientation = "ACROSS";

//         // every letter
//         for (var x = startXInd , y = startYInd, word_length = 1 ; word_length <= letter_array.length; x++){

//           make_key = x + " " + y;
//           console.log(x);
//           console.log(y);
//           console.log(" in else check with this key", make_key);
//           if ( letter_array[l] == dict[make_key] ){

//             console.log("matched letter",dict[make_key]);
//           }
//           ans += dict[make_key]; // append every letter
//           make_key = ""
//           l++;
//           word_length++;
//         }

//       }

//      // word is formed
//      console.log(ans);
//      wordsActive[w].student_ans = ans.toUpperCase();

//   }


//   // map the questions
//   // create a field mapped which stores the number to be displayed on the page


// // keys stores all the indexes ( x and y)
// var keys = []
// var startIndex = []
// for ( var w = 0; w < wordsActive.length;w++) {
//   startIndex.push(wordsActive[w].x)
//   startIndex.push(wordsActive[w].y);
//   console.log("an array?",startIndex);
//   keys.push(startIndex);
//   startIndex = [];
// }

//  //keys.push([12,12],[13,12],[12,13],[10,10]);
//  console.log(keys);
// //  console.log(keys.sort()); // in place sorting
// //  console.log("Sorted keys", keys);

// // sort all the indexes ( keys )
// // keys are sorted because we need to compare keys to give a mapped value
// var sorted_keys = keys.sort(function(a, b) {
//   if (a[0] == b[0]) {
//     return a[1] - b[1];
//   }
//   return a[0] - b[0];
// });

// console.log("Sorted now",sorted_keys);

// // use keys_dict = keys as index, values as mapped values
// // to create a mapped value
// var keys_dict = {};
// var mapped_val = 1
// for ( var w = 0; w <= sorted_keys.length-1 ;w++) {


//   if  (!( sorted_keys[w] in keys_dict)){ // true if key does not exist in dict, if key already exists we do not need to update the mapped value

//     keys_dict[sorted_keys[w]] = mapped_val;
//     mapped_val++;

//   }
// }

// console.log("dictionary of keys", keys_dict);

// // fill up the mapped attribute in wordsActive
// var form_key = ""
// var across = {}
// var down = {}
// for ( var w = 0; w <= wordsActive.length - 1 ;w++) {

//   form_key = wordsActive[w].x + "," + wordsActive[w].y; // form key using x and y index
//   console.log("form key", form_key);
//   //if (form_key in keys_dict){ // if this key is present in dict
//     wordsActive[w].mapped = keys_dict[form_key];

//     if(wordsActive[w].orientation == "ACROSS")

//       across[keys_dict[form_key]] = form_key; // can use qa_id here to populate value as question

//       // qa_id = index in ques_ans_data + 1

//       //across[keys_dict[form_key]] = json_object.ques_ans_data[wordsActive[w].qa_id - 1].question;
//     else 
//       down[keys_dict[form_key]] = form_key;
//       // down[keys_dict[form_key]] = json_object.ques_ans_data[wordsActive[w].qa_id - 1].question;
  
//       console.log(across);
//       console.log(down);
//   }

//   // sort the dictionary on basis of keys ( so that we display in order )
 
//   // may be not necessary
//   sorted_across = Object.keys(across).sort(function(a, b) {
//     return across[a] - across[b];
//   })

//   sorted_down = Object.keys(down).sort(function(a, b) {
//     return down[b] - down[a];
//   })

//   console.log("sorted dict across", sorted_across);
//   console.log("sorted dict down", sorted_down);

//   // use this dictionary
//   // insert qa_id in word bank when its created
//   // use qa_id to populate questions in the across and down dict


//   console.log(wordsActive);
  
  /************* commented until hereee */

//  // give the number to be printed on screen
//  var on_screen_no = 1

//  // traverse all the words to update the mapped value
//  for ( var w = 0; w <= wordsActive.length - 2 ;w++) {

//   //for ( var w = 0; w <= keys.length - 2 ;w++) {

//     // compare indexes
//     console.log("here");
//     var index1 = JSON.stringify(sorted_keys[w]);
//     console.log(index1)
//     var index2 = JSON.stringify(sorted_keys[w+1]);
//     console.log(index2)

//     if (index1 == index2) { // same index

//     //if(JSON.stringify(keys[w]) == JSON.stringify(keys[w+1])){
//       console.log("same keys", keys[w]);
      
//       wordsActive[].mapped = on_screen_no
//       //wordsActive[w+1].mapped = on_screen_no
//       console.log("on screen number if",on_screen_no);
//     }
//     else{ // different index
//       wordsActive[w].mapped = on_screen_no;
//       on_screen_no++;
//       wordsActive[w+1].mapped = on_screen_no
//       w++;
//       console.log("incremented screen number else",on_screen_no);
//     }

//  }
// console.log(wordsActive); // with mapped attribute, across and down, qa_id
// }

