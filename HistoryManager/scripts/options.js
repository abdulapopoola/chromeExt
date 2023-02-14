const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24 * 1;
const MAX_RESULTS = 100000;
const $ = document.getElementById.bind(document);
const CATEGORIES = [
    'Arts',
    'Audio',
    'Blogs',
    'Business',
    'Business',
    'Causes',
    'Coupon',
    'ECommerce',
    'Education',
    'Electronics',
    'Entertainment',
    'Event',
    'Faith',
    'Fitness',
    'Forums',
    'Government',
    'Hobbies',
    'Jobs',
    'Mail',
    'Membership',
    'Miscellaneous',
    'News',
    'Non-profit',
    'Parenting',
    'Personal',
    'Political',
    'Portal',
    'Portfolio',
    'Q&A',
    'Reference',
    'Search engine',
    'Self-improvement',
    'Social Networking',
    'Software Development',
    'Sports',
    'Technology',
    'Telecommunications',
    'Tools',
    'Travel',
    'Utilities',
    'Video Streaming',
    'Wiki',
];
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
            entry.typedCount += item.typedCount;
            entry.items.push(item);
        } else {
            transformed[hostname] = {
                hostname,
                frequency: 1,
                visitCount: item.visitCount,
                typedCount: item.typedCount,
                items: [item]
            }
        }
    }

    return Object.values(transformed);
}

function getLookBackStartTime(days) {
    if (!Number.isFinite(days)) {
        days = 1;
    }

    const elapsedMilliseconds = MILLISECONDS_PER_DAY * days;
    const startTime = (new Date).getTime() - elapsedMilliseconds;
    return startTime;
}

function drill(data, historyItems) {
    var t = new Tabulator("#drillTable", {
        placeholder: "No Data Available",
        layout: "fitDataStretch",
        responsiveLayout: "collapse",
        data: historyItems,
        pagination: "local",
        paginationSize: 25,
        paginationSizeSelector: [10, 25, 50],
        movableColumns: true,
        paginationCounter: "rows",
        columns: [
            { title: "Title", field: "title", headerTooltip: true },
            { title: "URL", field: "url", formatter: "link", headerTooltip: "Full website address" },
            { title: "Visit Count", field: "visitCount", sorter: "number", headerTooltip: "This is how often you have visited this domain" },
            { title: "Times Typed", field: "typedCount", sorter: "number", headerTooltip: "This is how often you've visited this domain after typing its address" },
            {
                title: "Last Visited",
                field: "lastVisitTime",
                formatter: function (cell, formatterParams, onRendered) {
                    try {
                        let dt = luxon.DateTime.fromMillis(cell.getValue());
                        return dt.toFormat(formatterParams.outputFormat);
                    } catch (error) {
                        return formatterParams.invalidPlaceholder;
                    }
                },
                formatterParams: {
                    outputFormat: "dd/MM/yy HH:mm:ss",
                    invalidPlaceholder: "(invalid date)",
                    timezone: "America/Los_Angeles",
                },
                headerTooltip: true
            },
        ],
        initialSort: [
            { column: "visitCount", dir: "desc" },
            { column: "title", dir: "desc" },
        ],
        sortOrderReverse: true,
    });
}

function getHistory(startTime) {
    chrome.history.search(
        {
            text: '',
            startTime: startTime,
            maxResults: MAX_RESULTS,
        }, function (data) {
            let transformed = transformHistoryItems(data);
            let table = new Tabulator("#historyTable", {
                placeholder: "No Data Available",
                layout: "fitDataStretch",
                responsiveLayout: "collapse",
                selectable: 1,
                data: transformed,
                pagination: "local",
                paginationSize: 10,
                paginationSizeSelector: [10, 20, 50],
                movableColumns: true,
                paginationCounter: "rows",
                columns: [
                    { title: "Domain", field: "hostname", headerTooltip: "Domain name" },
                    { title: "Visit Count", field: "visitCount", sorter: "number", headerTooltip: "This is how often you have visited this domain" },
                    { title: "Times Typed", field: "typedCount", sorter: "number", headerTooltip: "This is how often you've visited this domain after typing its address" },
                ],
                initialSort: [
                    { column: "visitCount", dir: "desc" },
                    { column: "typedCount", dir: "desc" },
                ],
                sortOrderReverse: true,
            });

            table.on("rowClick", function (e, row) {
                let data = row.getData();
                drill(data, data.items);
            });
        });
}

async function loadCategories() {
    await chrome.storage.local.set({ CATEGORIES });
    return await chrome.storage.local.get('CATEGORIES');    
}

async function addWebsiteToCategory(website, category) {
    // convert to host
    // figure out category
    // add it to it
}

let buttons = $('buttons').children;
for (const button of buttons) {
    button.onclick = () => {
        let days = parseInt(button.dataset.days, 10);
        let startTime = getLookBackStartTime(days);
        getHistory(startTime);
    };
}

getHistory();
loadCategories();