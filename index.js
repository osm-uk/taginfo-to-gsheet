/**
  * Note:
  * This script requires a file called 'google-generated-creds.json' next to this file.
  * See here for guide to making it - https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method
  *
  */

const { tagInfoToGoogleSheets } = require('./lib/process')

const g_creds_file = '../google-generated-creds.json'
const pref_file = './google-sheet-id.json'

tagInfoToGoogleSheets(pref_file, g_creds_file)