/**
  * Note:
  * This script requires a file called 'google-generated-creds.json' next to this file.
  * See here for guide to making it - https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method
  *
  */

// import everything
var moment  = require('moment')
const { GoogleSpreadsheet } = require("google-spreadsheet")
var async   = require("async")
// @TODO get google-generated-creds dynamically
var g_creds = require('./google-generated-creds.json')
// @TODO get preference data dynamically
var data    = require('./google-sheet-id.json')
// processData(data)

const getTagInfoData = require('./lib/taginfo/taginfo')




const generic_method = async function(callback) {
	
	// convert bound variables to local variables so they retain scope in this function 
	var tag          = this.tag
	var sheet_id     = this.sheet_id
	var key          = this.key
	var value        = this.value
	var worksheet_id = this.worksheet_id
	
    // console.log("started on "+tag,sheet_id)
    const alldata = await get('api/4/tag/stats?key='+ key+'&value='+value);

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

    try {

        g_sheet = new GoogleSpreadsheet( sheet_id )

        await g_sheet.useServiceAccountAuth(g_creds)
        await g_sheet.loadInfo()
        // now initialise the Google Sheet Auth
        
        const sheet = g_sheet.sheetsByIndex[ worksheet_id ] 
        // add a row to the specified worksheet in the google sheet
        await sheet.addRow({date:date_str, tag:tag, all:all, nodes:nodes, ways:ways, relations:relations})

        console.log("Added "+tag+" to google sheet")
        callback( null, true )

    } catch (error) {
        console.log(`Sorry, there was an error adding "${tag}" to the google sheet '${error.message}'`)
        callback( null, error )
    }

}
const processData = (data) => {

    let actions = []

    // loop through all of the options in the json
    for(var i=0;i<data.length;i++){

        var key          = data[i].taginfo_key
        var value        = data[i].taginfo_value
        var sheet_id     = data[i].google_sheet_id
        var worksheet_id = data[i].worksheet_number
        
        var tag          = key + ':' + value

        actions.push( generic_method.bind( {key:key, value:value, sheet_id:sheet_id, worksheet_id:worksheet_id, tag:tag} ) )

    }

    async.series( actions, function( err, res ){

        console.log("finished")
    })

}

const main = async () => {
    const preferenceData = [
        //{name: "food_standards", key: "fhrs:id"}, 
        //{name: "oneway=yes", key: "oneway", value: "yes"}, 
        //{name: "highway=path", key: "highway", value: "path"}, 
        //{name: "highway=footway", key: "highway", value: "footway"}, 
        //{name: "highway=path||footway", key: "highway", values: ["path","footway"]}, 
        //{name: "", keys: ["fixme", "FIXME"]}, 
        {name: "designation fix", key: "designation", values: ["public_footpath","public_bridleway"], 
            other_key: "highway", other_values: [""]} 
    ]

    const tagInfoData = await getTagInfoData(preferenceData)
    console.log( "tagInfoData: ", tagInfoData )

}

const initialiseGoogleSheet = async () => {

}

const addToGoogleSheet = async (data, g_creds, sheet_id, worksheet_id) => {
    try {

        const g_sheet = new GoogleSpreadsheet( sheet_id )

        await g_sheet.useServiceAccountAuth(g_creds)
        await g_sheet.loadInfo()
        // now initialise the Google Sheet Auth
        
        const date_str  = moment().format("YYYY-MM-DD")
        const sheet = g_sheet.sheetsByIndex[ worksheet_id ] 
        // add a row to the specified worksheet in the google sheet
        await sheet.addRow({
            date:date_str, 
            tag: data.name, 
            all: data.all, 
            nodes: data.nodes, 
            ways: data.ways, 
            relations: data.relations
        })

        console.log("Added "+tag+" to google sheet")
        return true

    } catch (error) {
        console.log(`Sorry, there was an error adding "${tag}" to the google sheet '${error.message}'`)
        return error
    }
}



main()