const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 1;
const OneWeekAgo = (new Date).getTime() - millisecondsPerWeek;
const maxResults = 100000;
const HEADERS = ['hostname', 'frequency', 'visitCount'];

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

function generateTableBody(table, historyItems) {
    let tBody = table.createTBody();
    //historyItems = sort(historyItems, 'frequency');
    for (let entry of historyItems) {
        let row = tBody.insertRow();
        for (let value of Object.values(entry)) {
            if (Array.isArray(value)) {
                continue; //todo; make this more elegant
            }
            let text = document.createTextNode(value);
            let cell = row.insertCell();
            cell.appendChild(text);
        }
    }
}

function sort(arr, field) {
    return arr.sort((a, b) => {
        return b[field] - a[field];
    });
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
            entry.frequency++;
            entry.visitCount += item.visitCount;
            entry.items.push(item);
        } else {
            transformed[hostname] = {
                hostname,
                frequency: 1,
                visitCount: item.visitCount,
                items: [item]
            }
        }
    }

    return Object.values(transformed);
}

function getHistory() {
    chrome.history.search(
        {
            text: '',
            startTime: OneWeekAgo,
            maxResults: maxResults,
        }, function (data) {
            let transformed = transformHistoryItems(data);
            debugger;
            var table = new Tabulator("#example-table", {
                layout: "fitColumns",
                data: transformed,
                pagination: "local",
                paginationSize: 20,
                paginationSizeSelector: [10, 20, 50],
                movableColumns: true,
                paginationCounter: "rows",
                columns: [
                    { title: "Name", field: "hostname", width: 150 },
                    { title: "Frequency", field: "frequency", hozAlign: "left" },
                    { title: "Count", field: "visitCount" },
                ]
            });
        });
}

getHistory();