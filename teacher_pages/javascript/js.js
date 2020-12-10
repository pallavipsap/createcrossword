// May 25
//Version 1: edited during the meeting

//---------------------------------//
//   GLOBAL VARIABLES              //
//---------------------------------//

// default values  - 0
console.log("In js.js");
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

// Play button
function Play() {
  var letterArr = document.getElementsByClassName("letter");

  for (var i = 0; i < letterArr.length; i++) {
    letterArr[i].innerHTML =
      "<input class='char' type='text' maxlength='1'></input>";
  }

  mode = 0;
  ToggleInputBoxes(false);
}

// Create button
/*
Goes inside if mode = 0, changes to mode = 1
Calls ToggleInputBoxes : 
makes mode var = 1

*/

function Create() {
  // mode variable inside function play, go inside if the boxes are blank i.e. mode == 0 ( coming from Play or starting new)

  if (mode === 0) {
    ToggleInputBoxes(true); // inputs are not taken from html file yet
    document.getElementById("crossword").innerHTML = BoardToHtml(" "); // grab all words and clues from id = crossword to send to BoardToHtml
    mode = 1; // make mode = 1
  } else {
    // if mode is already 1 : this helps when we have to update the word, when we click on create multiple times
    GetWordsFromInput(); // after this function comes back, wordArr is populated with all the words ( except for blanks )

    // What does the for loop do ?
    for (var i = 0, isSuccess = false; i < 10 && !isSuccess; i++) {
      CleanVars(); // creates 32 * 32 matrix of null values
      isSuccess = PopulateBoard();
      console.log("Success", isSuccess);
    }
    var n = 1;
    document.getElementById("crossword").innerHTML = isSuccess
      ? BoardToHtml(" ")
      : console.log("error found"); //ErrorToHtml(n);
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
function GetWordsFromInput() {
  wordArr = [];
  for (
    var i = 0, val, w = document.getElementsByClassName("word");
    i < w.length;
    i++
  ) {
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
  Bounds.Clean(); // goes to global function ; // sets up window size ?
  wordBank = [];
  wordsActive = [];
  board = [];

  // Why 32 ? Creates matrix 32*32
  for (var i = 0; i < 32; i++) {
    board.push([]); // create 32 empty arrays
    // console below shows the board entirely in array form , interesting to see !
    //console.log(board); //[..........Array(32), Array(32), Array(32), Array(0)]
    for (var j = 0; j < 32; j++) {
      board[i].push(null); // 32 null values pushed in every array
    }
  }
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

      document.getElementById("crossword").innerHTML = isOk
        ? BoardToHtml(" ")
        : Error(wordBank[i].string); //console.log("error found");
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
function PrepareBoard() {
  wordBank = [];

  for (var i = 0, len = wordArr.length; i < len; i++) {
    // to convert every word to character array ?
    wordBank.push(new WordObj(wordArr[i])); // WordObj creates key value pairs
    //console.log(wordBank);
  }
  console.log(wordBank); // array of all input words = now in form of objects in wordBank

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
  }
  // documenby ID , span with error message
}

// TODO: Clean this guy up
function AddWordToBoard() {
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
  } else {
    curIndex = -1;

    for (i = 0, len = wordBank.length; i < len; i++) {
      curWord = wordBank[i];
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
  }

  if (curIndex === -1) {
    return false;
  }

  var spliced = wordBank.splice(curIndex, 1);
  wordsActive.push(spliced[0]);

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

    Bounds.Update(xIndex, yIndex);
  }

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
*/
//create board ?
function BoardToHtml(blank) {
  for (var i = Bounds.top - 1, str = ""; i < Bounds.bottom + 2; i++) {
    str += "<div class='row'>";
    for (var j = Bounds.left - 1; j < Bounds.right + 2; j++) {
      str += BoardCharToElement(board[j][i]);
    }
    str += "</div>";
  }
  return str;
}

function BoardCharToElement(c) {
  var arr = c ? ["square", "letter"] : ["square"];
  return EleStr("div", [{ a: "class", v: arr }], c);
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
}

//---------------------------------//
//   EVENTS                        //
//---------------------------------//

function RegisterEvents() {
  document.getElementById("crossword").onfocus = function () {
    return false;
  };
  document.getElementById("btnCreate").addEventListener("click", Create, false);
  document.getElementById("btnPlay").addEventListener("click", Play, false);
}
RegisterEvents();

//---------------------------------//
//   HELPER FUNCTIONS              //
//---------------------------------//

function EleStr(e, c, h) {
  h = h ? h : "";
  for (var i = 0, s = "<" + e + " "; i < c.length; i++) {
    s += c[i].a + "='" + ArrayToString(c[i].v, " ") + "' ";
  }
  return s + ">" + h + "</" + e + ">";
}

function ArrayToString(a, s) {
  if (a === null || a.length < 1) return "";
  if (s === null) s = ",";
  for (var r = a[0], i = 1; i < a.length; i++) {
    r += s + a[i];
  }
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

Create();
Play();
