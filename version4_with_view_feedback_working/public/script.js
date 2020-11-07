var selectedRow = null;
var ques_content = [];
var ans_content = [];

var final_quiz = {
  qa_data : []
};

// var final_quiz = {
  
// };

function onFormSubmit() {
  if (validate()) {

    
    var formData = readFormData(); // if data is valid go ahead and read form data
    // selected row is populated when clicked on Edit button
    if (selectedRow == null) {
      insertNewRecord(formData);
      ques_content.push(formData.question);
      ans_content.push(formData.answer);
    }
      
    // insert new record
    else {
      updateRecord(formData); // edit selectedRow
    }
    // console.log(typeof formData.question);
    console.log('Current question',formData.question);
    console.log('Current ans',formData.answer);

    console.log('Ques Content', ques_content);
    console.log('Ans Content', ans_content);
   
    console.log('Ques Content length', ques_content.length);
    console.log('Ans Content length', ans_content.length);
    
    resetForm();
  }
  
}

// Read form data from text boxes
function readFormData() {
  var formData = {};
  formData["question"] = document.getElementById("question").value;
  formData["answer"] = document.getElementById("answer").value;
  console.log('Formdata', formData);
  return formData;
}


// function getStyle(className) {
//   var cssText = "";
//   var classes = document.styleSheets.rules|| document.styleSheets[0].cssRules;
//   console.log(classes);
//   for (var x = 0; x < classes.length; x++) {        
//       if (classes[x].selectorText == className) {
//           cssText += classes[x].cssText || classes[x].style.cssText;
//       }         
//   }
//   //return cssText;
//   return classes;
// }


// insert record in the table from onSubmit function
function insertNewRecord(data) {
  var table = document
    .getElementById("quizList")
    .getElementsByTagName("tbody")[0];

  console.log("Length of table",table.rows.length); //this is the entire tbody element

  var newRow = table.insertRow(table.length); // create <tr> </tr> here ( new row)
  console.log('Newrow',newRow); 

  // var x = document.createElement("input");
  // //x.type = "hidden";
  // x.name = "quiz_question";
  // x.value = data.question;
  // x.form = "saveForm";
  // console.log(x);

  // var y = document.createElement("input");
  // //x.type = "hidden";
  // y.name = "quiz_answer";
  // y.value = data.answer;
  // y.form = "saveForm";
  // console.log(y);

  // //x.type = "hidden";
  // x.name = serialNumber; // key
  // x.value = ques_content;
  // x.form = "saveForm";

  // var d = document.getElementById("saveForm");
  // d.appendChild(x);
  // d.appendChild(y);

  //alert(getStyle('.table_list')); // not needed

  var cell0 = newRow.insertCell(0); // serial number added by css
  console.log("cell0",cell0.innerHTML);

  
  var cell1 = newRow.insertCell(1);
  cell1.innerHTML = data.question //+ "</pre>";
  console.log("cell1",cell1);
  // cell1.innerHTML = "<pre>" + data.question + "</pre>";
 

  var cell2 = newRow.insertCell(2);
  cell2.innerHTML = data.answer;
  console.log("cell2",cell2);

  //var ques = this.parentElement.parentElement; // current row
  //var ques_id = ques.rowIndex;
  // console.log("New row", ques_id);

  var ques_id = final_quiz.qa_data.length;

  // QA object pushed everytime to qa_data array
  var QA = {
    qa_id : ques_id + 1,
    question : cell1.innerHTML,
    answer : cell2.innerHTML
  };
  console.log("QA",QA);

  final_quiz.qa_data.push(QA); //final_quiz : { ques_ans_data [ qa_id : ,question : , answer ] }
  // var j_object = JSON.stringify(final_quiz);
  // console.log("String json object",j_object);
  // var textarea_data = document.getElementById("ques_ans_data");
  // textarea_data.innerHTML = final_quiz; // set value
  //final_quiz.push(QA);

  console.log("serial number", cell0.getElementsByTagName("td").content);
  var textarea_data = document.getElementById("ques_ans_data");
  textarea_data.innerHTML = JSON.stringify(final_quiz.qa_data); // set value
  console.log("textarea_data",textarea_data.innerHTML);

  // console.log(document.td);

  var cell3 = newRow.insertCell(3);
  cell3.innerHTML = `<a onClick="onEdit(this)">Edit</a>
                       <a onClick="onDelete(this)">Delete</a>`;

}

function resetForm() {
  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";

  selectedRow = null;
}

// Edit  function : just populates text boxes and selectedRow variable
// Update function : populates selectedRow with content in text boxes
// Delete function : Just deletes the selected Row

// Edit just populates the text boxes with selectedRow content
function onEdit(td) {

  console.log(td);  // console.log(td.parentElement); <td></td>
  selectedRow = td.parentElement.parentElement; // <tr></tr>
  document.getElementById("question").value = selectedRow.cells[1].innerHTML; // text box updated with selected row content
  document.getElementById("answer").value = selectedRow.cells[2].innerHTML; // text box updated with selected row content
  console.log("to be edited row",selectedRow.rowIndex);

}

// When Edit is clicked, text boxes populated with selectedRow content, then the same row is updated by this function
// Selected row is populated by onEdit function
function updateRecord(formData) {

  // update in table
  selectedRow.cells[1].innerHTML = formData.question;
  selectedRow.cells[2].innerHTML = formData.answer;

  // edit the final_quiz object
  final_quiz.qa_data[selectedRow.rowIndex-1].question = formData.question;
  final_quiz.qa_data[selectedRow.rowIndex-1].answer = formData.answer;

  // update content in text area with updated final_quiz object
  var textarea_data = document.getElementById("ques_ans_data");
  textarea_data.innerHTML = JSON.stringify(final_quiz.qa_data); // set value
  console.log("updated textarea_data",textarea_data.innerHTML);

  // update in array
  ques_content.splice(selectedRow.rowIndex-1,1,formData.question);
  ans_content.splice(selectedRow.rowIndex-1,1,formData.question);
}

function onDelete(td) {

  row = td.parentElement.parentElement;
  if (confirm("Are you sure to delete this record?")) {
    
    console.log(row.rowIndex);

    // delete data from the content array
    ques_content.splice(row.rowIndex-1,1);
    console.log("Row index to be deleted",row.rowIndex);
    ans_content.splice(row.rowIndex-1,1);
    console.log('here',ques_content,ans_content);

    // delete from final_quiz object
    console.log("Row to be deleted", final_quiz.qa_data[row.rowIndex-1] );
    final_quiz.qa_data.splice(row.rowIndex-1,1)
    console.log("final_quiz after deletion",final_quiz.qa_data);
    //delete final_quiz.qa_data[row.rowIndex-1]; // does not work adds null values

    // rename the id before inserting in text area, can write in a function
    var len = final_quiz.qa_data.length;
    var i;
    for( i = 0; i < len; i++) {
      final_quiz.qa_data[i].qa_id = i+1;
      console.log("Quiz id",final_quiz.qa_data[i].qa_id);
      console.log(final_quiz.qa_data);
    }

     // update content in text area
     var textarea_data = document.getElementById("ques_ans_data");
     textarea_data.innerHTML = JSON.stringify(final_quiz.qa_data); // set value
     console.log("updated textarea_data",textarea_data.innerHTML);

    // delete from table
    document.getElementById("quizList").deleteRow(row.rowIndex);
  
    resetForm();
  }
}

// function rename(final_quiz) { // function to rename on button click 

  
//   // capitals = capitals.map(function(obj) { 
//   //     obj['Myanmar'] = obj['Burma']; // Assign new key 
//   //     delete obj['Burma']; // Delete old key 
//   //     return obj; 
//   // }); 
//   // console.log(capitals); 
// } 

var serialNumber = 0;
// function getSno() {
//   serialNumber++;
//   console.log("In serial Number func");
//   return serialNumber;
// }

function validate() {
  isValid = true; // consider value is valid
  /*
  if (
    document.getElementById("question").value == "" &&
    document.getElementById("answer").value == ""
  ) {
    isValid = false; // false if value is null
    document.getElementById("questionValidationError").classList.remove("hide"); //removes a class ( hide) , makes the "required field statement visible"
    document.getElementById("answerValidationError").classList.remove("hide");
  } else {*/

  if (
    document.getElementById("answer").value == "" ||
    document.getElementById("question").value == ""
  ) {
    if (document.getElementById("answer").value == "") {
      //only check for answer
      isValid = false; // false if value is null
      console.log("answer", isValid);
      document.getElementById("answerValidationError").classList.remove("hide"); //removes a class ( hide) , makes the "required field statement visible"
    }

    if (document.getElementById("question").value == "") {
      //only check for answer
      isValid = false; // false if value is null
      document
        .getElementById("questionValidationError")
        .classList.remove("hide");
      console.log("question", isValid);
    }
  } else {
    isValid = true;
    if (
      !document
        .getElementById("questionValidationError")
        .classList.contains("hide")
    )
      // contains = returns boolean showing if "hide" class in present
      document.getElementById("questionValidationError").classList.add("hide"); // adds a hide class if it does not have hide, becasue "isvalid is true"

    if (
      !document
        .getElementById("answerValidationError")
        .classList.contains("hide")
    )
      // contains = returns boolean showing if "hide" class in present
      document.getElementById("answerValidationError").classList.add("hide");
  }
  console.log(isValid);
  return isValid;
}



function saveQuiz(){
  alert("Do you want to submit the form?");
  console.log("I am in the function SaveQuiz");
  console.log(final_quiz);

  // create text area element
  var x = document.createElement("textarea");
  x.innerHTML = JSON.stringify(final_quiz);
  x.form = "saveForm";
  console.log("x obj", x);
  console.log("x.innerHTML", x.innerHTML);
  var d = document.getElementById("saveForm");
  console.log('Now printing data in textarea');
  console.log("X",x);
  d.appendChild(x);

  alert("The form was submitted");
  //x.type = "hidden";
  //x.name = "quiz_question";
  // x.value = final_quiz;


  // x.innerHTML = final_quiz;
  // // x.form = "saveForm";
  // console.log("I am in the function SaveQuiz")
  // console.log("X",x);

  // var d = document.getElementById("saveForm");
  // d.appendChild(x);

}