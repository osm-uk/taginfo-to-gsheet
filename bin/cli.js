#!/usr/bin/env node

const { tagInfoToGoogleSheets } = require('../lib/process')

const argv = require("yargs")
    .command("$0 <googleSheetsCredentials> <tagInfoSearch>", 'Search on tagInfo and add to Google Sheets', (yargs) => {
        yargs.positional('googleSheetsCredentials', {
            describe: "Path to Google provided credentials file (for accessing Google APIs)",
            type: "path"
        })
        .positional('tagInfoSearch', {
            describe: `Path to file containing tagInfo search data in JSON format e.g.
            [
                {
                    "tag_info": [
                      {"name": "oneway=yes", "key": "oneway", "value": "yes"}
                    ],
                    "google_sheet_id": "<sheet-id-goes-here>",
                    "worksheet_number": 0
                }
            ]`,
            type: "path"
        })
        
    })
    .help()
    .argv

tagInfoToGoogleSheets( argv.tagInfoSearch, argv.googleSheetsCredentials )
