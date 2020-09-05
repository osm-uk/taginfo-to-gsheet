# OSM TagInfo to Google Sheets

A Simple script to get information from the Open Street Map TagInfo API and add it to a Google Sheet.

Intended to be run as a cronjob on a daily basis.

## Note:

This script requires 2 files (next to this file) to work.

* **google-generated-creds.json**
	* See here for guide to making it - https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method
* **google-sheet-id.json**
	* This file must contain an array of objects including the id of the google sheet which the user in **google-generated-creds.json** must have write access to. See **google-sheet-id.example.json** for an example.
	* Includes the number (index) of the worksheet that the script should write to - the worksheet must exist, or an error will be generated.