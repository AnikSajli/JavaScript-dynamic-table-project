let columnData = [];
let tableContent = [];
let headers = [];
let titleText = '';
let selectedRowIndex;
let selectedColumnIndex;
let cellEvent;
let table;

function extractJSONdata() {
    fetch("table.json")
    .then(response => 
        response.json())
    .then (colData => {
        columnData = colData.columns;
        titleText = colData.title;
        if (colData.title) {
            createTitle();
        }
        getHeaders();
        createTableHeaders();
    })
}

// function fetchTableContent() {
//     fetch("data.json")
//     .then(response => response.json())
//     .then (tabData => {
//         tableContent = tabData;
//         createDynamicTable();
//     });
// }

function getHeaders() {
    for (let i = 0; i < columnData.length; i++) {
        if (columnData[i].header) {
            headers.push(columnData[i].header);
        }         
    }
}

function createTitle() {
    let titleElement = document.createElement("div");
    titleElement.innerHTML = titleText;
    let titleDiv = document.getElementById("title");
    titleDiv.appendChild(titleElement);
}

function createTableHeaders() {
    table = document.createElement("table");
    let tr = table.insertRow();

    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");      
        th.innerHTML = headers[i];
        tr.appendChild(th);
    }
    let th = document.createElement("th");      
    th.innerHTML = 'Action';
    tr.appendChild(th);
    let tableDiv = document.getElementById("tableData");
    tableDiv.appendChild(table);
}

function createDynamicTable(mode) {

    if (mode === 'upload') {
        table.innerHTML = '';
        createTableHeaders();
    }

    for (let i = 0; i < tableContent.length; i++) {

        tr = table.insertRow();

        for (let j = 0; j < columnData.length; j++) {
            let propertyVal;
            let propList;
            let tabCell = tr.insertCell();
            tabCell.contentEditable = 'true';
            // tabCell.addEventListener("click", onCellClick);
            if (columnData[j].cell) {
                propList = columnData[j].cell.split('.');
            }
            try {
                propertyVal = getNestedPropertyValue(tableContent[i], propList);
            }
            catch (err) {
                propertyVal = '-';
            }
            tabCell.innerHTML = propertyVal;
        }
        let tabCell = tr.insertCell();
        tabCell.addEventListener("click", removeRow);
        tabCell.innerHTML = 'Delete';
    }
    let tableDiv = document.getElementById("tableData");
    tableDiv.appendChild(table);
}

function removeRow(event) {
    let rowIndex = event.target.parentNode.rowIndex;
    table.deleteRow(rowIndex)
}

// function onCellClick(event) {
//     cellEvent = event;
//     let cellData = event.target.outerText;
//     selectedColumnIndex = event.target.cellIndex;
//     selectedRowIndex = event.target.parentNode.rowIndex;
//     let rowDiv = document.getElementById("row");
//     rowDiv.innerHTML = (selectedRowIndex).toString();
//     let columnDiv = document.getElementById("column");
//     columnDiv.innerHTML = (selectedColumnIndex+1).toString();
//     let cellValueInput = document.getElementById("cellValue");
//     cellValueInput.value = cellData;
// }

// function onUpdateValue() {
//     let cellValueInput = document.getElementById("cellValue");
//     if (cellValueInput.value) {
//         let existingCellData = cellValueInput.value;
//         cellEvent.srcElement.innerHTML = existingCellData;
//     }
// }


function getNestedPropertyValue(obj, propertyList) {
    let value = "";
    let data = obj;

    for (let i = 0; i < propertyList.length; i++) {
        if (data.hasOwnProperty(propertyList[i])) {
        data = data[propertyList[i]];
        value = data;
        }
        else {
            throw new Error('Property not found');
        }
    }
   return value;
}

function onImport(mode) {
    let files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
      alert('No file found!');
      return;
    }
    var fr = new FileReader();
    fr.onload = function(e) { 
    try {
      tableContent = JSON.parse(e.target.result);
      createDynamicTable(mode);
      document.getElementById('concat').style.visibility = 'visible';
    }
    catch (error) {
        alert(error);
    }  
    //   document.getElementById('warning').remove();
    }
    fr.readAsText(files.item(0));
}

function onExport() {
    let jsonData = [];

    for (let i=1; i<table.rows.length; i++) {
        let tableRow = table.rows[i];
        let rowData = {};
        for (let j=0; j<tableRow.cells.length-1; j++) {
            rowData[headers[j] ] = tableRow.cells[j].innerHTML;
        }
        jsonData.push(rowData);
    }
    if (jsonData.length > 0) {
        downloadJSONFile(jsonData);
    }
    else {
        // let warningElement = document.createElement('p');
        // warningElement.id = "warning";
        // warningElement.innerHTML = 'The table is empty!';
        // document.body.appendChild(warningElement);
        alert ('The table is empty!')
    }
}

function downloadJSONFile(jsonData) {
    let anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', 'data:text/json;charset=utf-8,' 
    + encodeURIComponent(JSON.stringify(jsonData)));
    anchorElement.setAttribute("download", "data.json");
    document.body.appendChild(anchorElement);
    anchorElement.click();
    anchorElement.remove();
}

extractJSONdata();

  
