const kMillisecondsPerWeek = 1000 * 60 * 60 * 24 * 365;
const kOneWeekAgo = (new Date).getTime() - kMillisecondsPerWeek;

chrome.history.search(
    {
        text: '',
        startTime: kOneWeekAgo,
        maxResults: 10000000
    }, function (data) {
        // data.forEach(function(page) {
        //     console.log(page.url);
        // });
        console.log(data.length);
        let typed = data.find(a => a.typed);
        console.log(typed);
        console.log(data[0]);
    });