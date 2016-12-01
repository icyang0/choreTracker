/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.2e904383-fe90-473d-9c12-e55ab8caccaf";//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var skillName = "Chore Tracker";
var choreOrTask = "chore";

'use strict';
require('./date');
var nlp = require('./nlp_compromise');

var http = require('http'),
    alexaDateUtil = require('./alexaDateUtil');
	
var AWS = require("aws-sdk");

var SATURDAY = 6,
	SUNDAY = 0;

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * TidePooler is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var TidePooler = function () {
    AlexaSkill.call(this, APP_ID);
};



// Extend AlexaSkill
TidePooler.prototype = Object.create(AlexaSkill.prototype);
TidePooler.prototype.constructor = TidePooler;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

TidePooler.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

TidePooler.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleWelcomeRequest(response);
};

TidePooler.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

/**
 * override intentHandlers to map intent handling functions.
 */
TidePooler.prototype.intentHandlers = {
    
	"AddChoreTimeIntent": function (intent, session, response) {
        handleAddChoreTimeRequest(intent, session, response);
    },
	
	"TellChoreTimeIntent": function (intent, session, response) {
        handleTellChoreTimeRequest(intent, session, response);
    },
	
	"DeleteChoreIntent": function (intent, session, response) {
        handleDeleteChoreIntent(intent, session, response);
    },
	
	"DeleteDBIntent": function (intent, session, response) {
        //handleDeleteDB(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Bye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Bye";
        response.tell(speechOutput);
    }
};


function handleWelcomeRequest(response) {
	var speechOut = "Welcome to " + skillName + "! I can remind you when you last did a " + choreOrTask + ". Just say something like, Alexa, tell " + skillName + " I cleaned the toilet today."
		+ "Then remind yourself by saying, Alexa, ask " + skillName + "when I last cleaned the toilet."
    response.tellWithCard(speechOut, skillName, speechOut)
}

function handleHelpRequest(response) {
	var speechOut = "Welcome to " + skillName + "! I can remind you when you last did a " + choreOrTask + ". Just say something like, Alexa, tell " + skillName + " I cleaned the toilet today."
		+ "Then remind yourself by saying, Alexa, ask " + skillName + "when I last cleaned the toilet."
    response.tellWithCard(speechOut, skillName, speechOut)
}




/**
 * This handles adding a chore
 */
function handleAddChoreTimeRequest(intent, session, response) {
	
	var speechOut;
	
	// Determine chore
    var choreOut = getChoreFromIntent(intent, false),
        repromptText,
        speechOutput;
    if (choreOut.error) {
		
        repromptText = "Adding. I didn't understand that " + choreOrTask + ". Please try again.";
        speechOutput = repromptText;

        //response.ask(speechOutput, repromptText);
        response.tellWithCard(speechOutput, skillName, speechOutput)
		
		
		return;
    }
	
	//determine date
    var date = getDateFromIntent(intent.slots.Date.value);
	if (date.error) {
        speechOutput = "Adding. I didn't understand that date. ";
		repromptText = "Please try again by saying a date like: today, or Sunday, or November tenth twenty fifteen.";
		
        speechOutput = speechOutput + repromptText;
        //response.ask(speechOutput, repromptText);
		
		response.tellWithCard(speechOutput, skillName, speechOutput)
		return;
    }
	
	//determine how long ago date was from today
	var howLong = getHowLongAgoFromIntent(intent.slots.Date.value);
	//this should never be called since it should stop at date... putting it here just in case??
	if (howLong.error) {
		
		speechOutput = "Adding. I didn't understand that date. ";
        repromptText = "Please try again by saying a date like: today, or Sunday, or November tenth twenty fifteen.";
		
		speechOutput = speechOutput + repromptText;
        //response.ask(speechOutput, repromptText);
		response.tellWithCard(speechOutput, skillName, speechOutput)

        return;
	//if the person inputter a date more than a year in the future
    } else if (howLong.fError) {
		
  /*      speechOutput = "Adding. The date you input is in the future. ";
		repromptText = "Please try again using a date today or earlier.";
		
		speechOutput = speechOutput + repromptText;
		//response.ask(speechOutput, repromptText);
		response.tellWithCard(speechOutput, skillName, speechOutput)
		
		return;
		
		*/
	}
	
	
	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	var chore = choreOut.chore;
	var chorePast = nlp.sentence(chore).to_past().text();
	var howLongStr = howLong.displayLong;
	var dateDisplay = date.displayDate;
	var test = "poop";
	var test = Date.parse(date.origDate);
	
	dynamodb.putItem({
                TableName: "ChoreAppDataTable",
                Item: {
                    CustomerId: {
                        S: session.user.userId
                    },
					ChoreName: {
						S: chorePast
					},
					DateOfChore: {
						S: intent.slots.Date.value
					}
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                else {
                    console.log(data);
                }
				//speechOut = "Okay. You " + chorePast + " " + howLongStr + ", on " + dateDisplay + "." ;
				speechOut = "Okay. You " + chorePast + " " + date.origDate + ", on " + date.poop + "." + dateDisplay;
				//speechOut = "Okay. You " + chorePast + " " + howLongStr + ", on " + intent.slots.Date.value + "." ;

				response.tellWithCard(speechOut, skillName, speechOut)
            }
	);
}

/**
 * This handles telling the time of a chore
 ****************************************************************************
 ****************************************************************************
 ****************************************************************************
 */
function handleTellChoreTimeRequest(intent, session, response) {
	var speechOut;
	// Determine chore, using default if none provided
    var choreOut = getChoreFromIntent(intent, false),
        repromptText,
        speechOutput;
	//if couldnt understand the chore	
    if (choreOut.error) {
        // invalid city. move to the dialog
        repromptText = "Relaying. I couldn't understand that " + choreOrTask + ". Please try again.";
        speechOutput = repromptText;

        //response.ask(speechOutput, repromptText);
		response.tellWithCard(speechOutput, skillName, speechOutput)
        return;
    }
	var date;
	
	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	var choreName = choreOut.chore;
	var chorePast = nlp.sentence(choreName).to_past().text();
	
	speechOut = "The last time you " + chorePast + " was ";
	
	dynamodb.getItem({
        TableName: "ChoreAppDataTable",
            Key: {
                CustomerId: {
                    S: session.user.userId
                },
				ChoreName: {
					S: chorePast
				}
			}
        }, function (err, data) {
            var currentChore;
            if (err) {
                speechOut = "ERROR OF SOME SORT";
			
			//if we couldsnt find the thingey
            } else if (data.Item === undefined) {
                speechOut = "Lookup. I don't have data about when you "+ chorePast + ". Please try again.";
            } else {
                currentChoreDate = data.Item.DateOfChore.S;
				speechOut = speechOut + getHowLongAgoFromIntent(currentChoreDate).displayLong + ", on " + getDateFromIntent(currentChoreDate).displayDate + ".";
            }

			response.tellWithCard(speechOut, skillName, speechOut)
				
    });

 
}

/**
 * This handles deleting a specific chore for a Customer
 */
function handleDeleteChoreIntent(intent, session, response) {
	var speechOut = "deleting"

	// Determine chore, using default if none provided
    var choreOut = getChoreFromIntent(intent, false),
        repromptText,
        speechOutput;
	//if couldnt understand the chore	
    if (choreOut.error) {
        // invalid city. move to the dialog
        repromptText = "I couldn't understand that " + choreOrTask + ". Please try again.";
        speechOutput = repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }
	var date;
	
	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	var choreName = choreOut.chore;
	var chorePast = nlp.sentence(choreName).to_past().text();
	
	dynamodb.deleteItem({
        TableName: "ChoreAppDataTable",
		
            Key: {
                CustomerId: {
                    S: session.user.userId
                },
				ChoreName: {
					S: chorePast
				}
			},
			ConditionExpression: "attribute_exists(DateOfChore)"
        }, function (err, data) {
            var currentChore;
            
			//if you were unable to delete because the item never existed in the first place
			if (err) {
				speechOut = "Deleting. I don't have data about when you "+ chorePast + ". Please try again.";
			
			//successfully deleted
            } else {
                
				speechOut = "Removed records of when you " + chorePast + ".";
            }

			response.tellWithCard(speechOut, skillName, speechOut)
				
    });
	
	
 
}

/**
 * Gets the cHORE NAME from the intent, or returns an error
 ****************************************************************************
 ****************************************************************************
 ****************************************************************************
 */
function getChoreFromIntent(intent, assignDefault) {

    var choreSlot = intent.slots.ChoreName;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!choreSlot || !choreSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // if we decide we want to default to some chore. (shouldnt ever call this)
            return {
                chore: "default task"
            }
        }
    } else {
        var choreName = choreSlot.value;
        
        return {
            chore: choreName
		}
    }
}

/**
 * Gets the date from the intent, defaulting to today if none provided,
 * or returns an error
 ****************************************************************************
 ****************************************************************************
 ****************************************************************************
 */
function getDateFromIntent(dateo) {

	var date = new Date();
	//var date = new Date(dateo);
    var week = 0;
	var day = 0;
	
	//no date passed
    if (!dateo) {
        return {
            error: true,
			displayDate: "default date"
        }
    } else {
		
		//if passed a 'week' or 'weekend'
		if (dateo[5] == "W") {

			week = dateo.substring(6,8);
			date = Date.january();
			date = date.addWeeks(week - 1);
			day = date.getDay;
			
			//if passed a 'weekend' only
			if (dateo[9] == "W") {
				//check to see if the parsed day is a weekday.. add days until it gets to the weekend
				for ((day != SUNDAY) && (day != SATURDAY)) {
					date = date.addDays(6 - SATURDAY); 
				}
				
			}
			
			
		} else {
			date = new Date(dateo);
		}
		
        return {
            displayDate: alexaDateUtil.getFormattedDate(date),
            origDate: dateo,
			poop: week,
			error: false
        }
    }
}

/**
 * returns how long ago the date you asked about was
  ****************************************************************************
 ****************************************************************************
 ****************************************************************************
 */
function getHowLongAgoFromIntent(dateo) {

	var today = new Date();
    var date = new Date(dateo);
	
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!dateo) {
        // default to today
        return {
            error: true,
			displayLong: "default how long"
        }
    } else { 

		
		var howLong = "please catch edge case";
		var futureError = false;
		
		if (today - date < 0){
			futureError = true;
		}
		
		//Get 1 day in milliseconds
		var one_day=1000*60*60*24;


//actual algo should be implemented at
// http://www.htmlgoodies.com/html5/javascript/calculating-the-difference-between-two-dates-in-javascript.html

		//totoal years passed
		howLongY = ((today - date)/(86400000 * 365));
		//total months passed
		howLongM = ((today - date)/(86400000 * 30.44)); 
		//total days passed
		howLongD = (((today - date)/86400000));
		
		howLongM = (howLongM - Math.trunc(howLongY)*12);
		howLongD = howLongD - ((Math.trunc(howLongM))*30.44) - (Math.trunc(howLongY)*365);
		
		howLongY = Math.trunc(howLongY);
		howLongM = Math.trunc(howLongM);
		howLongD = Math.trunc(howLongD);
		
		//1 year 
		if (howLongY == 1){
			
			howLong = "about 1 year";
		
			if (howLongM == 1){
				howLong = howLong + ", 1 month ago";
			} else if (howLongM > 1){
				howLong = howLong + ", " + howLongM + " months ago";
			} else {
				
				if (howLongD == 1){
					howLong = howLong + ", 1 day ago";
				} else {
					howLong = howLong + ", " + howLongD + " days ago";
				}
			}
			
		}
		
		//more than 1 year
		else if (howLongY >= 2){
			howLong = "about " + howLongY + " years";
			
			if (howLongM == 1){
				howLong = howLong + ", 1 month ago";
			} else if (howLongM > 1){
				howLong = howLong + ", " + howLongM + " months ago";
			} else {
				
				if (howLongD == 1){
					howLong = howLong + ", 1 day ago";
				} else{
					howLong = howLong + ", " + howLongD + " days ago";
				}
			}
			
		} 
		//less than one year.. we will not report the year
		else if (howLongY == 0){
			
			//one month
			if (howLongM == 1){
				howLong = "1 month";
				
				if (howLongD == 1){
					howLong = howLong + ", 1 day ago";
				} else {
					howLong = howLong + ", " + howLongD + " days ago";
				} 
		
			//more than one months
			} else if (howLongM > 1){
				howLong = howLongM + " months";
				
				if (howLongD == 1){
					howLong = howLong + ", 1 day ago";
				} else {
					howLong = howLong + ", " + howLongD + " days ago";
				} 
				
			//less than one month, report days only.
			} else if (howLongM >= 0) {
				howLongD = today.getDate() - date.getDate();
				if (howLongD == 1){
					howLong = "1 day ago";
				} else if (howLongD == 0){
					howLong = "today";
					
				} else if (howLongD > 1){
					howLong = howLongD + " days ago";
				}
				//if negative days (in the future)
				else {
					futureError = true;
				}
			}
			//if negative months (in the future)
			else {
				futureError = true;
			}
				
		} 
		//if negative years (in the future)
		else {
			futureError = true;
		}
		
        return {
            displayLong: howLong,
			error: false,
			fError: futureError
        }
    }
}


function checkSimilarChoreName(dateo){
	
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var tidePooler = new TidePooler();
    tidePooler.execute(event, context);
};