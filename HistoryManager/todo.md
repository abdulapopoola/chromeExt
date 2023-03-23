Coding
1. Deleting a website in the category view should remove it    
1. Trigger functions to load history and categories on load
1. Ensure that dashboard loads categories appropriately
1. Can a website have multiple categories?
1. Allow removing a category from a website
1. Allow for bulk edits/categorization?
1. Deleting a category should move all its entries over to the misc group or ask the user for next steps
1. Consider drilling by clicking other cells (e.g. title and more) for a better UX? Or hiding/re-enabling the buttons on select?
1. Delete website entry from category? Is this needed or should it be prevented?
1. Allow users to define their own categories and provide a short list of seed categories
1. If there is no data; do not show the categories table 
1. Allow for searching through categories?
1. Add intelligent categorization of websites

Productivity
1. Calculate a productivity score based on categories
1. Add charts
1. Allow adding a website to a category
1. figure out how to extract time spent on each visit to a page
1. Coalesce into a daily view for top pages?
1. consider creating a one-hit wonder category to highlight mindless scrolling and time sinks on the internet

Styling
1. Style the table page
2. Show reloading and animations when the config buttons are clicked
1. Style the drill table to show analysis
1. Make selected button's style sticky
1. Consider hiring a contractor to handle ux design

Engineering Efficiency
1. Find a better way to execute the categories code instead of loading it all at once at the beginning; lazy load

Styling

PopUp
1. Style pop up to allow for options
1. 

Miscellaneous
0. Figure out how to extract tabulator config to constants file and import it
1. Only use required files in fomantic dist to minimize payload size; does this even matter given that this is an extension?
1. Periodically scan the history? Every hour maybe or every day?
2. Process into sources and destinations
3. Process time spent on each
4. figure out how to show a page with details and settings
5. how do extensions get a settings page
6. extract out the time ranges for each
7. Consider adopting classes instead of standalone functions
1. App crashes when both wipeStorage() and await setupDB(); are commented out
1. Allow custom time range from users
1. Are the records for 24 hours accurate in the dashboard table?
1. Figure out how to edit the cell contents and save it; on save update the category header too
    1. Consider replacing the edit icon with a save icon when this is clicked;
    1. After editing a cell; it should update the title if it is the selected one
    1. Update the default CATEGORIES constant array or leave as is to allow for default settings to be reset?