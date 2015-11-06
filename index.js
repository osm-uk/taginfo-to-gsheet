var request = require('request')
var moment  = require('moment')
var gs      = require('google-spreadsheet')

request.get('http://taginfo.openstreetmap.org.uk/api/4/tag/stats?key=leisure&value=nature_reserve', function (error, response, body) {
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
        console.log( "we have",date_str,all,nodes,ways,relations)
    } else {
    	console.log("there was an error - ", error)
    }
})