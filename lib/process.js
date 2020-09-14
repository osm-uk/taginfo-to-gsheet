const getTagInfoData = require('./taginfo/taginfo')
const addToGoogleSheet = require('./googlesheet/googlesheet')
const fs = require('fs')

const tagInfoToGoogleSheets = async (pref_file, g_creds_file) => {
    const preferenceData = await getPreferences(pref_file)
    let g_creds = null
    try {
        g_creds = require(g_creds_file)
    } catch (e) {
        console.log(`Error: couldn't open google creds file at '${g_creds_file}'`)
        return
    }
    
    for(i in preferenceData) {
        const entry = preferenceData[i]
        const tagInfoData = await getTagInfoData(entry.tag_info)
        for(data of tagInfoData) {
            const success = await addToGoogleSheet(data, g_creds, entry.google_sheet_id, entry.worksheet_number)
            console.log(`${success ? "Added": "Failed to add"} ${data.name} to google sheet`)
        }
    }

}

const getPreferences = async (file) => {
    try {
        fs.accessSync(file, fs.constants.R_OK)
        const str = fs.readFileSync(file, {encoding: "utf-8"})
        const data = JSON.parse(str)
        return data
    } catch (e) {
        console.log(`Error: couldn't open preference file at ${file} - ${e}`)
        return []
    }
}

module.exports = { tagInfoToGoogleSheets: tagInfoToGoogleSheets, getTagInfoData: getTagInfoData, addToGoogleSheet: addToGoogleSheet }