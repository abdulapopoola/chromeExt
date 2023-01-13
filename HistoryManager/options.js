const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 1;
const OneWeekAgo = (new Date).getTime() - millisecondsPerWeek;
const maxResults = 100000;
const HEADERS = ['hostname', 'frequency', 'visitCount'];

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
            new Tabulator("#example-table", {
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