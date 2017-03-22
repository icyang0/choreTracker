#todo

NEED TO FIX THE WEEKEN/WEEKEND REPORTING

1.time is in UTC+0, need to assume.. central time in the US?, so UTC-6
1. FIX THE TIME BETWEEN FUNCTION, when i say "friday", when its "thursday", then it still says today

1. "this week" date is off by a week... need to fix :(, but technically works

	
1. "this weekend" defaults to friday.
"this month" 
	
1. maybe i should just strip out all adverbs???? that would require making 2 diffferent custom slot types.. one of verb and then one of nounnn???????IDK loll, please dont say adverbs.

1. IMPLEMENT ALL REPROMPTS CORRECTLY

1. keep adding to the LIST_OF_CHORES

4. try and better do the time elasped appx

4. add recall #x tasks added
5. delete all tasks

6. most tasks now are past tense.... still some bugs




#USAGE
Tell Chore Tracker when you did a task or chore. Then the next time you want to remember how long ago it was, Chore Tracker will remind you how long ago it was, all in one simple voice interface!

For example, to input the date you did a chore:
"Alexa, tell Chore Tracker I took my vitamins today."
or
"Alexa, tell Chore Tracker that yesterday I vaccuumed the floor."

And the next time you get the feeling that the fridge is starting to smell, or the dog is looking a bit shaggy, just say:

"Alexa, ask Chore Tracker when was the last time I cleaned out the fridge?"
or
"Alexa, when did I last groom the dog?"

And Chore Tracker will pull it up :)
"The last time you cleaned the fridge was about 1 year, 5 months ago, on Wednesday 6/10/2015."


#DONE:

IF THERES NO CHORE AND YOU CALL IT BACK, PROGRAM BTREAKS
CALLING DELETE CHORE ALSO BREAKS PROGRAM
ADD CODE TO REPRESENT TODAY AS HOW LONG AGO
1. format date input to DB
2. format date output to user3. fix DB storage method?? (seperate items?)
delete whichever specific chore
7. remove extraneous code
1. handle future dates
2. handles stripping out adverbs, and saving verbs as past tense... not thuroughly tested, but good enough??
3. handles incorrect dates (i.e. feb 30th 2016, or may 37th 2011), by defaulting to the 1st day of that year. (amazon date intent already does this by default, i cant change it)
4. handles "this month" or "this year" correctly.
2. handle seasonal inputs by retuning error to user
2. handle decades given by returning error to user
1. add in handling for day of the week/ "i cleaned on sunday"
2. handle dates without a year??? outputs something but its incorrect
1. saying a day without the year, or just the day always defaults to the future day. i.e. sunday means next sunday.. need to default it to last sunday?? but I cant change alexa's date interaction model :(...it will automatically pass me the date
	need to change it to get the current year...
