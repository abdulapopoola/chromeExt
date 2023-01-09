const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const OneWeekAgo = (new Date).getTime() - millisecondsPerWeek;
const maxResults = 100000;

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
        let typed = data.find(a => a.typed);
        console.log(typed);
        console.log(data[0]);
    });