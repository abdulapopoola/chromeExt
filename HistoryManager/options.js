const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const OneWeekAgo = (new Date).getTime() - millisecondsPerWeek;
const maxResults = 100000;
const HEADERS = ['Hostname', 'Frequency', 'VisitCount'];

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
    let keys = Object.keys(data);
    for (let key of keys) {
        let row = tBody.insertRow();
        let entry = data[key];
        for (let value of Object.values(entry)) {
            if(Array.isArray(value)) {
                continue; //todo; make this more elegant
            }
            let text = document.createTextNode(value);
            let cell = row.insertCell();
            cell.appendChild(text);
        }
    }
}

/*
    key: value
    baseURL: [{
        items:[historyItem]
        count: count
        visitCount: visitCount
    }]

    Table of objects
    BaseURL, visitCount, 
*/

function transformHistoryItems(historyItems) {
    let transformed = {};
    for (let item of historyItems) {
        let url = new URL(item.url);
        let hostname = url.hostname;
        let entry = transformed[hostname];
        if (entry) {
            entry.count++;
            entry.visitCount += item.visitCount;
            entry.items.push(item);
        } else {
            transformed[hostname] = {
                hostname,
                count: 1,
                visitCount: item.visitCount,
                items: [item]
            }
        }
    }

    return transformed;
}

function getHistory() {
    chrome.history.search(
        {
            text: '',
            startTime: OneWeekAgo,
            maxResults: maxResults,
        }, function (data) {
            data = transformHistoryItems(data);
            let table = document.querySelector("table");
            // let headerValues = Object.keys(data[0]);
            generateTableHead(table, HEADERS);
            generateTableBody(table, data);
        });
}

getHistory();