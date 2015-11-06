/**
  * Note:
  * This script requires a file called 'google-generated-creds.json' next to this file.
  * See here for guide to making it - https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method
  *
  */

// import everything
var request = require('request')
var moment  = require('moment')
var gs      = require("google-spreadsheet")
var g_creds = require('./google-generated-creds.json')
var sheet_id = require('./google-sheet-id.json').google_sheet_id
var g_sheet = new gs(sheet_id)


// what are we looking for?
var tag = 'leisure:nature_reserve'
var key = 'leisure'
var value = 'nature_reserve'


request.get('http://taginfo.openstreetmap.org.uk/api/4/tag/stats?key='+key+'&value='+value, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // example response: {"total":4,"url":"http://taginfo.openstreetmap.org.uk/api/4/tag/stats?key=leisure&value=nature_reserve","data":[{"type":"all","count":1670,"count_fraction":0.0},{"type":"nodes","count":147,"count_fraction":0.0},{"type":"ways","count":1454,"count_fraction":0.0002},{"type":"relations","count":69,"count_fraction":0.0005}]}
        // convert json string to object
        var alldata   = JSON.parse( body )
        // get the data object
        var data      = alldata.data
        // get today's date
        var date_str  = moment().format("YYYY-MM-DD")
        // initialise variables with default
        var all       = -1
        var nodes     = -1
        var ways      = -1
        var relations = -1
        // loop through and get values
        for(var i=0;i<data.length;i++){
        	var type  = data[i].type
        	var count = data[i].count
        	switch (type) {
        		case "all":
        			all = count
        			break
        		case "nodes":
        			nodes = count
        			break
        		case "ways":
        			ways = count
        			break
        		case "relations":
        			relations = count
        			break
        	
        	}
        }
        
        // now initialise the Google Sheet Auth
		g_sheet.useServiceAccountAuth(g_creds, function(err){
			
			// add a row to the first worksheet in the google sheet
			g_sheet.addRow( 1, {date:date_str, tag:tag, all:all, nodes:nodes, ways:ways, relations:relations}, function(err){
				if (err){
					console.log("Sorry, there was an error adding to the google sheet",err)
				} else {
					console.log("Added to google sheet")
				}
			})
		})
        
    } else {
    	console.log("Sorry, there was an error getting taginfo data", error)
    }
})