# OSM TagInfo to Google Sheets

A Simple script to get information from the Open Street Map TagInfo API and add it to a Google Sheet.

Intended to be run as a cronjob on a daily basis.

## Note:

### Create a Google Service Account

This script requires 2 files (next to this file) to work.

* **google-generated-creds.json**
    * In the Google Dashboard, create a new project and activate the Google Sheets API
    * With the Google Sheets API selected, create a service account and add a key to it. When adding a key, there is a JSON option, choose this and that's the file you'll need.
    * Add the email of the service account to the sheet you'd like to add to
    * Ensure the sheet has the following columns `date`, `tag`, `all`, `nodes`, `ways`, `relations`
* **google-sheet-id.json**
	* This file must contain an array of objects including the id of the google sheet which the user in **google-generated-creds.json** must have write access to. See **google-sheet-id.example.json** for an example.
	* Includes the number (index) of the worksheet that the script should write to - the worksheet must exist, or an error will be generated.