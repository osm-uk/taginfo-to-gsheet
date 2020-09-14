const { GoogleSpreadsheet } = require("google-spreadsheet")
const moment = require('moment')

let g_sheet = null
const getAPIAccess = async (g_creds, sheet_id) => {
    if (g_sheet != null) return g_sheet;

    g_sheet = new GoogleSpreadsheet( sheet_id )
    await g_sheet.useServiceAccountAuth(g_creds)
    await g_sheet.loadInfo()
    return g_sheet
}

const addToGoogleSheet = async (data, g_creds, sheet_id, worksheet_id) => {
    try {
        let api = await getAPIAccess(g_creds, sheet_id)
        const date_str  = moment().format("YYYY-MM-DD")
        const sheet = api.sheetsByIndex[ worksheet_id ] 
        // add a row to the specified worksheet in the google sheet
        await sheet.addRow({
            date:date_str, 
            tag: data.name, 
            all: data.all, 
            nodes: data.nodes, 
            ways: data.ways, 
            relations: data.relations
        })
        return true

    } catch (error) {
        console.log(`Sorry, there was an error adding "${data.name}" to the google sheet '${error.message}'`)
        return error
    }
}

module.exports = addToGoogleSheet