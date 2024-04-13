# Context RepuTracker

## UNDER CONSTRUCTION: screens are in progress...

## [![ru](https://img.shields.io/badge/lang-ru-red.svg)](README.md) ![en](https://img.shields.io/badge/lang-en-blue.svg)

This extension for desktop browser (both Mozilla and Chrome based) performs tracking of reputation of social networks users. The list of social networks supported is growing permanently, now it includes:
- CONT Social Journalistic platform (cont.ws)
- Vkontakte (vk.com)
- LiveJournal
- YouTube
- Habr (habr.com)

In order to install last stable version use the following links in Chrome or Mozilla extensions catalog, depending on your browser:

https://chrome.google.com/webstore/detail/context-reputation-manage/llakncffdnaoaochpifpfggempegkaoh
https://addons.mozilla.org/en-US/firefox/addon/reputation_manager/

It is possible to install extension from source code in developer mode. This is recommended for testing purposes only, mid-release code can be unstable. 

### Main idea

Any of us meets numerous people in social networks, especially when sensitive issues are discussed. Too many users to keep them all in mind. In fact, somebody's speech can be fully understand only when considering it's context. In order to comprehend, what does person mean and for what purpose particular statement was made you may need to now it's previous discussions. Generally speaking, any of us is just the sum of our previous acts and speeches. You can view user's profile, review last posts and comments, to get an idea of a person, but this will take MUCH time, too much to do so with everyone you meet. Besides – most replicas are insignificant, and important one may be hidden under them. It may be even deleted or edited – either by user himself or by moderators. As a result – user may provide his name, avatar, some information in his profile, but in fact stay anonymous, hiding among hundreds of thousands of other users. So, you see only a flat picture, but not the view to the depth.

RepuTracker extension is an attempt to solve this problem. Instead of keeping everyone you ever met in social networks in mind, you can simply store his speeches in user's history. When you meet the same user next time, you will be reminded of all previous meetings. All important speeches, selected by yourself will be accessible in one click together with the conclusions you made. And nobody can falsify or bias this impression, as all the data are stored locally, in your own browser, you are the only one who can edit them. Even more, no other users, neither social network administration can even know you keep any information of such kind.

### Overview

Extension is based on two concepts — event and notion. Event must have an author, unique url, text and date. Posts and comments meets this requirements. Notion does not have a complete text, it is a link to event or simply to the user profile. In contrast to event, notion does not have enough information to be saved to users’ history. When loading page from any social network supported, RepuTracker searches for all links to user in it and divide them to potential events and notions. Small triangle is added to each potential event, when putting mouse pointer on it small context menu build of two items appears. If opening page, that is a somebodies publication itself, menu is added to the top of the page, near the caption. Notions can have a menu as well – but only when it’s author already has some events, saved in RepuTracker base. In this case, the amount of stored events is displayed to the right of username with small semi-transparent badge, in both events and notions.  Some links, such as one in user options page, never obtains context menu as they are considered as maintenance. 
Top menu item contains username and number of associated events in parentheses. It opens user history window. Second menu item appears only with potential events and performs adding or editing (if it was already added) event to database.

### Adding event

“Add event” menu item opens the following dialog:

Event data are taken from the page. Some of them can’t be edited such as event type, author user name and alias, event time*, unique event URL and some others. Another parameters can be (and should be) edited by the user. Thy are – event caption, main text, repost sign and a list of tags.  “Add” button adds event to database and closes window, “Cancel” closes window without saving. After event was added, events counter is increasing by one and event caption on page becomes blinking (if comment, that may not have caption, alias or user name becomes blinking).

_*Note, that event date sometimes is determined incorrectly, in some social networks, for example in LiveJournal, timestamp format may depend on user's settings. In order to fix incorrect date this field can be made editable (except FireFox older that 91.0). Initial time mark appears as a tooltip above this field. In order to make date field editable, double click on the very edge of it._

### Changing/Deleting events

Event being added to database has blinking caption or user name, and it’s context menu second menu item is renamed to “Change event”. Choosing it opens dialog with event parameters:

Parameters are taken from database, “Change” button will save edited event, “Delete” removes event from database and closes the dialog.


### Adding and removing tags

Tags editor is located under the string that contains event URL. No any pre-defined tags are present, you should type them yourself. It is recommended to use short pieces of text, that describe the event from one point of view, so than you can use each tag multiple times. If you are going to use a long phrase as a tag – better try to separate it to several short ones. 
When no tags are entered, tags editor looks as a text field with a faded “Enter tag” sigh and total number of different tags used in database after it in braces. When plugin is just installed it is zero:

In order to enter new tag just type it and press Enter. Tag entered will become noneditable with gray background and field to enter another tag will move to the right or to the next string. Tags already entered are provided with a red cross button on the right side, that allows to remove them:

You can not edit tag already entered, remove it and add another one instead. Pressing down arrow button on keyboard opens the list of hints – all tags, that already used in database, but excluding tags that are already used in this particular event. When typing, context search in this list is performed, this allows to enter longer tag by typing just several symbols and make sure that spelling is identical. 

### Viewing user history

Top menu item in context menu opens window that contains all information collected about the particular user:

In the top string there are social network name, user name and his login in braces. At the end of this string badge with a number of user’s events is added – in the same way it is added to username on pages.
Lower, list of statuses it available. You can choose one to describe the user of left him without status. Do not forget to press “Keep” button to save status changed.

Lower there is a text field where you can type the summary about this user. Near it there is “hide author's events” checkbox, that does what is written – hides all events of this author, for example all his comments will disappear when you open any thread. 

Next section is a tags cloud. If no tags was used in user’s events, this part is empty. However, when using tags carefully and precisely, this cloud can give you a brief picture of the user.

The last element is a table that contains all user events you store in plug-in, ordered by time. In “Title” column event’s titles are placed, when pressing it opens an event changing dialog (see above). “Event” column indicates the type of event (comment or post), clicking on it will open event itself on the page of social network.

### Extension options

Extension options can be accessed in standard way, via browser’s extensions list. Options page consists of two tabs – “Common” and “Tags”. 

“Common” tab contains export and import functions – all events can be backuped to the json format file. “Clear data before import” checkbox is not selected by default, so when importing events are added to thous already stored in database, except events with urls that match, such events are replaced.
Brief statistics is placed next – it is total events number and total different users known, number of users that has some text in summary field. Also the last event is indicated (the last event by it’s time, not by adding to database order. Time when event was added to database is not collected at all). 
Next section is a list of supported social networks that works as a filter as well – you can select one or more (hold Ctrl to add) items to view users associated only with this networks.
Next section is status editor, it works as events filter as well. Each string corresponds to one status, plus to the top is added a string, that corresponds to users without status and to the bottom the string that allows to add new status.
To use status editor as a filter only first column with checkboxes is necessary. By selecting each checkbox you adds all users that has corresponding status to the list on the bottom of options page. If selecting several checkboxes, users will be placed together, each has color scheme selected for it’s status. In this table, first column contains user name, it is a link that opens user history window. Second column contains user alias, it is colored according to user status. Last column indicates the number of events for this user. If user is hidden, it’s login is typed with italic.
In order to edit status, use “…” button in corresponding string of editor. After this fields with status name and description becomes editable, also you can change background and font colors for this status:

Each control has floating tooltip. After making changes to status, use “Cancel” button in the same string to cancel them or press “…” button again to keep them. In order to add new status, use “+” button in the last string, all other functions are identical to that of already existed statuses. In order to remove status, use “Remove” button in the string. It is active only when there is no users with such status, so user counter in the third column of this line equals to 0. Changing user status it available from user history window, see above. After doing this, you may need to refresh status filter, use “refresh” button to the top of it.

“Tags” tab displays overall users cloud. In contrast to the cloud in user history, here you can filter users and events by selecting one or more tags. When checking checkbox near tag, below the cloud appears a table that displays all events that was marked by this tag, Events are grouped by the user, placed on the dark background, and events are placed on light one.  It looks as shown below:

Both username and event title are active links, that allows to open event options and user history window for editing. Note, that cloud does not re-build automatically after editing events.  User Refresh button on the left top of the cloud. On the right corner there is a button to clear all checkboxes.


News about this extension and discussions are placed in author’s blog at: https://cont.ws/@dmitrevo

Acknowledgments to authors of the following libraries, used in extension:
* https://github.com/mozilla/webextension-polyfill 
* https://github.com/eligrey/FileSaver.js 

