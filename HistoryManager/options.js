const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const OneWeekAgo = (new Date).getTime() - millisecondsPerWeek;
const maxResults = 100000;
const Headers = [
    "Rank",
    "URL",
    "Count"
];

chrome.history.search(
    {
        text: '',
        startTime: OneWeekAgo,
        maxResults: maxResults,
    }, function (data) {
        // data.forEach(function(page) {
        //     console.log(page.url);
        // });
        console.log(data.length);
        //let typed = data.find(a => a.typed);
        //console.log(typed);
        console.log(Object.keys(data[0]));

        let table = document.querySelector("table");
        let headerValues = Object.keys(data[0]);
        generateTableHead(table, headerValues);
        generateTableBody(table, data);
    });


function generateTableHead(table, headers) {
    let tHead = table.createTHead();
    let row = tHead.insertRow();
    for (let header of headers) {
        let text = document.createTextNode(header);
        let th = document.createElement("th");
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTableBody(table, data) {
    let tBody = table.createTBody();
    for (let entry of data) {
        let row = tBody.insertRow();
        for (let value of Object.values(entry)) {
            let text = document.createTextNode(value);
            let cell = row.insertCell();
            cell.appendChild(text);
        }
    }
}