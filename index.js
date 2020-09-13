/**
  * Note:
  * This script requires a file called 'google-generated-creds.json' next to this file.
  * See here for guide to making it - https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method
  *
  */

// import everything
var bent    = require('bent')
var moment  = require('moment')
const { GoogleSpreadsheet } = require("google-spreadsheet")
var async   = require("async")
// @TODO get google-generated-creds dynamically
var g_creds = require('./google-generated-creds.json')
// @TODO get preference data dynamically
var data    = require('./google-sheet-id.json')
// processData(data)



const get = bent('https://taginfo.openstreetmap.org.uk/', 'GET', 'json', 200);

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
        {name: "food_standards", key: "fhrs:id"}, 
        {name: "oneway=yes", key: "oneway", value: "yes"}, 
        {name: "highway=path", key: "highway", value: "path"}, 
        {name: "highway=footway", key: "highway", value: "footway"}, 
        {name: "highway=path||footway", key: "highway", values: ["path","footway"]}, 
        {name: "", keys: ["fixme", "FIXME"]}, 
        {name: "", key: "", values: [""], other_key: "", other_values: [""]} 
    ]

    const tagInfoData = await getTagInfoData(preferenceData)
}

const getTagInfoData = async (searchData) => {
    
    const actions = []

    for(const val of searchData){
        let method = async (cb) => {
            const data = await processTagInfoEntry(val)
            cb(null, data)
        }
        actions.push(method)
    }

    async.series( actions, function( err, res ){
        // now do something with `res`
        console.log("finished", res)
        return res
    })

}

const processTagInfoEntry = async (data) => {
    let response = null

    let keys = removeEmptyEntries(getKeys(data))
    if (keys.length == 0) return null

    let values = removeEmptyEntries(getValues(data))

    const name = data.name ? data.name : keys[0]

    if (values.length > 0) {
        response = await queryKeyValue(keys, values)
    } else {
        response = await queryKey(keys)
    }
    /*
    if (data.other_key != undefined) {
        response = null
        // @TODO come back to combination searches
        if (data.other_values != undefined) {

        } else {

        }
    } else if (data.value != undefined) {
        response = await queryKeyValue(data.key, [data.value])
    } else if (data.values != undefined) {
        response = await queryKeyValue(data.key, data.values)
    } else {
        response = await queryKey( data.key )
    }*/

    if (response != null) {
        response.name = name
    }
        
    return response
}

const getKeys = (data) => {
    if (data.keys != undefined) return data.keys
    if (data.key != undefined) return [data.key]
    return []
}

const getValues = (data) => {
    if (data.value != undefined) return [data.value]
    if (data.values != undefined) return data.values
    return []
}

const removeEmptyEntries = (data) => {
    let response = data.filter( val => val != "" )
    if (response.length != data.length) console.log("removed entries!")
    return response
}

const queryKey = async (keys) => {
    const parsed = []
    for(const key of keys) {
        const taginfoData = await get('api/4/key/stats?key='+ key);
        parsed.push( parseData(taginfoData.data) )
    }
    return combineResponses(parsed)
}

const queryKeyValue = async (keys, values) => {
    const parsed = []
    for(const key of keys) {
        for(const value of values) {
            const taginfoData = await get('api/4/tag/stats?key='+ key+'&value='+value);
            parsed.push( parseData(taginfoData.data) )
        }
    }
    return combineResponses(parsed)
}

const combineResponses = (arr) => {
    // combine parsed data
    const response = {
        all: null,
        nodes: null,
        ways: null,
        relations: null
    }
    arr.forEach( value => {
        response.all += value.all
        response.nodes += value.nodes
        response.ways += value.ways
        response.relations += value.relations
    })
    return response
}

const parseData = (data) => {
    let response = {
        all: null,
        nodes: null,
        ways: null,
        relations: null
    }
    for(var i=0;i<data.length;i++){
        var type  = data[i].type
        var count = data[i].count
        switch (type) {
            case "all":
                response.all = count
                break
            case "nodes":
                response.nodes = count
                break
            case "ways":
                response.ways = count
                break
            case "relations":
                response.relations = count
                break
        }
    }
    return response
}


main()