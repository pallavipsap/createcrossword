var selectedRow = null;

function onFormSubmit() {
  if (validate()) {
    var formData = readFormData(); // if data is valid go ahead and read form data
    if (selectedRow == null) insertNewRecord(formData);
    // insert new record
    else updateRecord(formData); // edit
    resetForm();
  }
}

function readFormData() {
  var formData = {};
  formData["question"] = document.getElementById("question").value;
  formData["answer"] = document.getElementById("answer").value;

  return formData;
}

function insertNewRecord(data) {
  var table = document
    .getElementById("quizList")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.length);

  cell1 = newRow.insertCell(0);
  cell1.innerHTML = data.question;
  cell2 = newRow.insertCell(1);
  cell2.innerHTML = data.answer;

  cell3 = newRow.insertCell(2);
  cell3.innerHTML = `<a onClick="onEdit(this)">Edit</a>
                       <a onClick="onDelete(this)">Delete</a>`;
}

function resetForm() {
  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";

  selectedRow = null;
}

function onEdit(td) {
  selectedRow = td.parentElement.parentElement;
  document.getElementById("question").value = selectedRow.cells[0].innerHTML;
  document.getElementById("answer").value = selectedRow.cells[1].innerHTML;
}
function updateRecord(formData) {
  selectedRow.cells[0].innerHTML = formData.question;
  selectedRow.cells[1].innerHTML = formData.answer;
}

function onDelete(td) {
  if (confirm("Are you sure to delete this record ?")) {
    row = td.parentElement.parentElement;
    document.getElementById("quizList").deleteRow(row.rowIndex);
    resetForm();
  }
}
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


