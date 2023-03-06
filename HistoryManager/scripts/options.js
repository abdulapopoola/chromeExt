const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24 * 1;
const MAX_RESULTS = 100000;
const $ = document.getElementById.bind(document);
const CATEGORIES = [
    'Arts',
    'Audio',
    'Blogs',
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
    'Other',
    'Parenting',
    'Personal',
    'Political',
    'Portal',
    'Portfolio',
    'Productivity',
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
const editIcon = function (cell, formatterParams, onRendered) {
    return "<i class='edit blue icon'></i>";
};
const deleteIcon = function (cell, formatterParams, onRendered) {
    return "<i class='delete red icon'></i>";
};
let selectedCategory = '';

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
    var t = new Tabulator("#historyDrillTable", {
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
            {
                title: "URL",
                field: "url",
                formatter: "link",
                headerTooltip: "Full website address"
            },
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
                    {
                        title: "Domain",
                        field: "hostname",
                        headerTooltip: "Domain name",
                        formatter: "link",
                        formatterParams: {
                            urlPrefix: "https://",
                            target: "_blank",
                        }
                    },
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

async function setupDB() {
    await chrome.storage.local.set({ CATEGORIES });
    for (let category of CATEGORIES) {
        await chrome.storage.local.set({ [category]: [] });
    }
}

async function getData(category) {
    return await chrome.storage.local.get(category);
}

async function setCategory(payload) {
    return await chrome.storage.local.set(payload);
}

async function addWebsiteHostToCategory(website, category) {
    let url = new URL(website);
    let hostname = url.hostname;

    let categoryData = await getData(category);
    let entries = categoryData[category];
    entries.push(hostname);
    entries = [... new Set(entries)];
    await setCategory({ [category]: entries });
}

async function getCategories() {
    let data = await getData();

    let categoriesObject = data.CATEGORIES.map(
        category => ({
            category: category,
            count: data[category].length,
            websites: data[category].map(entry => ({ website: entry }))
        }));

    let table = new Tabulator("#categoriesTable", {
        placeholder: "No Data Available",
        layout: "fitDataStretch",
        selectable: 1,
        data: categoriesObject,
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50],
        movableColumns: true,
        paginationCounter: "rows",
        responsiveLayout: "collapse",
        columns: [
            {
                title: "Category",
                field: "category",
                headerTooltip: "Category",
                editor: "input",
                editable: false,
                editorParams: {
                    selectContents: true,
                },
                cellClick: function (e, cell) {
                    categoryDrill(e, cell);
                }
            },
            {
                title: "Count",
                field: "count",
                sorter: "number",
                headerTooltip: "This is the number of websites in this category",
                cellClick: function (e, cell) {
                    categoryDrill(e, cell);
                }
            },
            {
                title: "Edit",
                formatter: editIcon,
                cellClick: function (e, cell) {
                    cell.getRow().getCell('category').edit(true);
                    // CONTINUE: fix this
                    // see https://github.com/olifolkerd/tabulator/issues/3536
                    // Figure out what triggers save on cell
                    debugger;
                },
                cellEditCancelled: function (cell) {
                    //cell - cell component
                    console.log('cancelled');
                    debugger;
                },
                cellEdited: function (cell) {
                    //cell - cell component
                    console.log('done');
                    debugger;
                },
            },
            {
                title: "Delete",
                formatter: deleteIcon,
                cellClick: function (e, cell) {
                    let data = cell.getData();
                    if (window.confirm(`Delete category: ${data.category}?`)) {
                        deleteCategory(data.category, cell.getRow());
                    }
                }
            },
        ],
        initialSort: [
            { column: "count", dir: "desc" },
            { column: "category", dir: "asc" },
        ],
        sortOrderReverse: true,
    });
}

function editIconClicked(cell) {
    return cell.getRow().isSelected()
}

function deleteCategory(category, row) {
    chrome.storage.local.remove([category], (result) => {
        row.delete();
        if (selectedCategory === category) {
            $('categoryHeader').style.display = 'none';
            $('categoriesDrillTable').style.display = 'none';
            selectedCategory = '';
        }
    });
}

function categoryDrill(e, cell) {
    let categoryData = cell.getData();
    $('categoryHeader').innerText = categoryData.category;
    $('categoryHeader').style.display = 'block';
    selectedCategory = categoryData.category;

    var t = new Tabulator("#categoriesDrillTable", {
        placeholder: "No Data Available",
        layout: "fitDataStretch",
        responsiveLayout: "collapse",
        data: categoryData.websites,
        pagination: "local",
        paginationSize: 25,
        selectable: 1,
        paginationSizeSelector: [10, 25, 50],
        movableColumns: true,
        paginationCounter: "rows",
        columns: [
            {
                title: "Website", field: "website",
                headerTooltip: true,
                formatter: "link",
                formatterParams: {
                    urlPrefix: "https://",
                    target: "_blank",
                }
            },
            {
                title: "Delete",
                formatter: deleteIcon,
                cellClick: function (e, cell) {
                    alert("Printing row data for: " + cell.getRow().getData())
                }
            },
        ],
    });
}

function wipeStorage() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        console.log('clear');
    });
}

let buttons = $('buttons').children;
for (const button of buttons) {
    button.onclick = () => {
        let days = parseInt(button.dataset.days, 10);
        let startTime = getLookBackStartTime(days);
        getHistory(startTime);
    };
}

wipeStorage();
await setupDB();
getHistory();
await addWebsiteHostToCategory("https://www.bbc.com/news/world-us-canada-64684350", "News");
await addWebsiteHostToCategory("https://punchng.com/illegal-detention-ex-aide-sues-aisha-buhari-for-n100m-2/", "News");
await addWebsiteHostToCategory("https://www.bbc.com/news/world-us-canada-64684350", "News");
await getCategories();

function formatter_EditButton(cell, formatterParams, onRendered) {
    return "<div class='btn badge badge-pill badge-secondary'>Edit</div>";
}
function formatter_CancelButton(cell, formatterParams, onRendered) {
    return "<div class='btn badge badge-pill badge-warning'>Cancel</div>";
}
function formatter_SaveButton(cell, formatterParams, onRendered) {
    return "<div class='btn badge badge-pill badge-success'>Save</div>";
}
function formatter_DeleteButton(cell, formatterParams, onRendered) {
    return "<div class='btn badge badge-pill badge-danger'>Delete</div>";
}

function cellClick_EditButton(e, cell) {
    currentRow = cell.getRow()
    currentTable = cell.getTable()
    selectedRows = currentTable.getSelectedRows()
    if (selectedRows.length == 0) {
        for (i = 0; i < selectedRows.length; i++) {
            selectedRows[i].deselect()
            selectedRows[i].reformat()
        }
        currentTable.deselectRow()
        currentRow.select()
        currentRow.reformat()

        cells = currentRow.getCells()
        for (i = 0; i < cells.length; i++) {
            cells[i].setValue(cells[i].getValue())
        }
        currentTable.hideColumn("EditButton")
        currentTable.showColumn("CancelButton")
        currentTable.showColumn("DeleteButton")
        currentTable.showColumn("SaveButton")
    }
}
function cellClick_CancelButton(e, cell) {
    if (!cell.getRow().isSelected()) {
        return
    }
    currentRow = cell.getRow()
    currentTable = cell.getTable()
    if (cell.getRow().isSelected()) {
        //Cancel
        cells = currentRow.getCells()
        for (i = 0; i < cells.length; i++) {
            cells[i].restoreOldValue();
        }
        stopEditing(cell)
    }
}

function cellClick_SaveButton(e, cell) {
    if (!cell.getRow().isSelected()) {
        return
    }
    stopEditing(cell)
}

function stopEditing(cell) {
    currentRow = cell.getRow()
    currentTable = cell.getTable()
    currentTable.deselectRow()
    currentTable.showColumn("EditButton")
    currentTable.hideColumn("CancelButton")
    currentTable.hideColumn("DeleteButton")
    currentTable.hideColumn("SaveButton")
    currentRow.reformat()
}

function isRowSelected(cell) {
    return cell.getRow().isSelected()
}

function cellClick_FlipIfSelected(e, cell) {
    if (cell.getRow().isSelected()) {
        cell.setValue(!cell.getValue())
    }
} 