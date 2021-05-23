let columnData = [];
let tableContent = [];
let headers = [];
let titleText = '';
let selectedRowIndex;
let selectedColumnIndex;
let cellEvent;
let table;
let sortOrder;

function extractJSONdata() {
    fetch("table.json")
    .then(response => 
        response.json())
    .catch(error => {
            hideUIComponents();
            alert(error)
        })
    .then (colData => {
        if (colData.columns) {

          columnData = colData.columns;
          sortOrder = new Array(columnData.length).fill(1);
          getHeaders();
          createTableHeaders();
          createDynamicTable();
        }
        else {
            hideUIComponents();
            alert('Header Data Missing!');
            return;
        }

        if (colData.title) {
         titleText = colData.title;
         createTitle();
        }
        else {
            hideUIComponents();
            alert('Table title missing!');
            return;
        }
    })
}

function hideUIComponents() {
    document.getElementById('parentDiv').style.display =  "none";
}

function getHeaders() {
    for (let i = 0; i < columnData.length; i++) {
        if (columnData[i].header) {
            headers.push(columnData[i].header);
        }         
    }
    createRow();
}

function createTableHeaders() {
    table = document.createElement("table");
    let tr = table.insertRow();

    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");      
        th.innerHTML = headers[i] + ' (A)';
        th.style.cursor = 'pointer';
        th.addEventListener('click', sortByColumn);
        tr.appendChild(th);
    }
    let th = document.createElement("th");      
    th.innerHTML = 'Action';
    tr.appendChild(th);
    let tableDiv = document.getElementById("tableData");
    tableDiv.appendChild(table);
}


function createTitle() {
    let titleElement = document.createElement("div");
    titleElement.innerHTML = titleText;
    let titleDiv = document.getElementById("title");
    titleDiv.appendChild(titleElement);
}


function createDynamicTable() {
    table.innerHTML = "";
    createTableHeaders();
    tableContent = existingData =JSON.parse(getDataFromLocalStorage('tableData'));
    if (tableContent) {
        for (let i = 0; i < tableContent.length; i++) {

            tr = table.insertRow();
    
            for (let j = 0; j < columnData.length; j++) {
                let propertyVal;
                let propList;
                let tabCell = tr.insertCell();
                tabCell.contentEditable = 'true';
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
            let tableDiv = document.getElementById("tableData");
            tableDiv.appendChild(table);
        }
    }
}
 
function createRow() {
    let insertRowDiv = document.createElement('div');
    for (let i = 0; i < headers.length; i++) {
        let newCellInput = document.createElement('input');
        newCellInput.type = 'text';
        newCellInput.id = headers[i];
        newCellInput.name = headers[i];
        newCellInput.placeholder = headers[i];
        insertRowDiv.appendChild(newCellInput);
      }

      let insertRowButton = document.createElement('button');
      insertRowButton.id = 'insertButton';
      insertRowButton.addEventListener("click", onInsertData);
      insertRowButton.textContent = 'Insert New Data';
      insertRowDiv.appendChild(insertRowButton);
      let newRowDiv = document.getElementById('newRow');
      newRowDiv.appendChild(insertRowDiv)
}

function onInsertData() {
    tr = table.insertRow();
    let newDataObj = {};
    for (let i = 0; i < headers.length; i++) {
        let tabCell = tr.insertCell();
        tabCell.contentEditable = 'true';
        let val;
        if (document.getElementById(headers[i]).value) {
            val = document.getElementById(headers[i]).value;
            newDataObj[headers[i]] = val;
        }
        else {
            val = '-';
        }
        tabCell.innerHTML = val;
    }
        tableContent.push(newDataObj);
        window.localStorage.clear();
        setDataInLocalStorage('tableData', tableContent);
        let tabCell = tr.insertCell();
        tabCell.contentEditable = 'true';
        tabCell.innerHTML = 'Delete';
        tabCell.addEventListener("click", removeRow);  
}

function removeRow(event) {
    let rowIndex = event.target.parentNode.rowIndex;
    table.deleteRow(rowIndex);
    tableContent.splice(rowIndex-1,1);
    setDataInLocalStorage('tableData',JSON.stringify(tableContent));
}

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

function onFileImport(mode) {
    let files = document.getElementById('browseFiles').files;
    if (files.length <= 0) {
      alert('No file chosen!');
      return;
    }
    let fileReader = new FileReader();
    fileReader.readAsText(files.item(0));
    fileReader.onload = function(e) {
        
        if (mode === 'upload') {
            tableContent = JSON.parse(e.target.result);
            replaceExistingTable(tableContent);
        }

        if (mode === 'concat') {
            let existingData =JSON.parse(getDataFromLocalStorage('tableData'));
            let newData = JSON.parse(e.target.result);
            concatWithExistingTable(existingData, newData);
        } 
    }
}

function replaceExistingTable(tableContent) {
    window.localStorage.clear();
    setDataInLocalStorage('tableData',JSON.stringify(tableContent));
    createDynamicTable();
    clearFileInput();
}

function concatWithExistingTable(existingData, newData) {
    for(let i = 0; i < newData.length; i++) {
        let isDuplicate = false;
        for (let j = 0; j < existingData.length; j++) {
            if (JSON.stringify(newData[i]) === JSON.stringify(existingData[j])) {
                console.log(JSON.stringify(newData[i]));
                console.log(JSON.stringify(existingData[j]));
                isDuplicate = true;
            }
        }
        if (!isDuplicate) {
            tableContent.push(newData[i]); 
        }
    }
    window.localStorage.clear();
    setDataInLocalStorage('tableData', JSON.stringify(tableContent));
    createDynamicTable();
}

function getDataFromLocalStorage(key) {
    return window.localStorage.getItem(key);
}

function setDataInLocalStorage(key, value) {
    window.localStorage.setItem(key, value);
}

function clearFileInput() {
    document.getElementById('browseFiles').value = '';
}

function onFileExport() {
    let jsonData = [];
    if (table.rows.length <= 1) {
        alert ('The table is empty!')
        return;
    }

    for (let i=1; i<table.rows.length; i++) {
        let tableRow = table.rows[i];
        let rowData = {};
        for (let j=0; j<tableRow.cells.length-1; j++) {
            rowData[headers[j]] = tableRow.cells[j].innerHTML;
        }
        jsonData.push(rowData);
    }
    downloadJSONFile(jsonData);
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

function searchTable() {
    let filterTxtMatched;
    let filterInputTxt = document.getElementById('filter').value.toUpperCase();
    let tableRows = table.getElementsByTagName("tr");
    if (tableRows.length <= 1) {
        return;
    }
    for (i = 1; i < tableRows.length; i++) {
        let tableColumns = tableRows[i].getElementsByTagName("td");
        for (j = 0; j < tableColumns.length; j++) {
            if (tableColumns[j].innerHTML.toUpperCase().indexOf(filterInputTxt) > -1) {
                filterTxtMatched = true;
            }
        }
        if (filterTxtMatched) {
            debugger
            // tableRows[i].style.display = "";
            filterTxtMatched = false;
        } else {
            debugger
            tableRows[i].style.display = "none";
        }
    }
}

function sortByColumn(event) {
    columnIndex = event.target.cellIndex;
    rowIndex = event.target.parentNode.rowIndex;
    sortOrder[columnIndex] = -1 * sortOrder[columnIndex];
    if (sortOrder[columnIndex] === 1) {
        table.rows.item(rowIndex).cells.item(columnIndex).innerHTML = 
        table.rows.item(rowIndex).cells.item(columnIndex).innerHTML.replace('D','A');
    }
    else {
        table.rows.item(rowIndex).cells.item(columnIndex).innerHTML = 
        table.rows.item(rowIndex).cells.item(columnIndex).innerHTML.replace('A','D');
    }

    let rowArray = [];
    let tableRows = table.getElementsByTagName("tr");
    rowArray = Array.from(tableRows);
    let cellsContent = [];
    
    for (let i = 1; i < rowArray.length; i++) {
        cells = rowArray[i].cells; 
        cellsContent[i] = [];
        for (let j = 0; j < cells.length; j++) {
            cellsContent[i][j] = cells[j].innerHTML;
        }
    }
    
    cellsContent.sort(function (a, b) {
        let result = (a[columnIndex] == b[columnIndex]) ? 0 : ((a[columnIndex] > b[columnIndex]) ?
          sortOrder[columnIndex] : -1 *  sortOrder[columnIndex]);
        return result;
    });

    for (let i = 1; i < tableRows.length; i++) {
        let tableColumns = tableRows[i].getElementsByTagName("td");
        for (let j = 0; j < cellsContent[i-1].length; j++ ) {
            tableColumns[j].innerHTML = cellsContent[i-1][j];
        }
    }
}

extractJSONdata();

  
