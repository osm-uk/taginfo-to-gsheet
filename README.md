# OSM TagInfo to Google Sheets

A script to get information from the Open Street Map TagInfo API and add it to a Google Sheet.

Intended to be run as a cronjob on a daily basis.


## Installation

`npm i -g taginfo_to_gsheets`

## Usage

`taginfo_to_gsheet <googleSheetsCredentials> <tagInfoSearch>`

* `googleSheetsCredentials`
    * Path to Google provided credentials file (for accessing Google APIs)
* `tagInfoSearch`
    * Path to file containing tagInfo search data in JSON format.

### Format of tagInfo search data


```
[
    {
        "tag_info": [
            {"name": "oneway", "key": "oneway", "value": "yes"}
        ],
        "google_sheet_id": "<sheet-id-goes-here>",
        "worksheet_number": 0
    }
]
```

* `tag_info`
    * An array of searches that you'd like to perform.
* `google_sheet_id`
    * The id (as found in the last part of the google sheet's URL)
    * Ensure the sheet has the following columns `date`, `tag`, `all`, `nodes`, `ways`, `relations`
* `worksheet_number`
    * E.g. 0 for the first worksheet, 1 for the second etc

### Options for `tag_info` searches

* `{name: "food standards", key: "fhrs:id"}`
    * search for instances of the key `fhrs:id`

* `{name: "oneway", key: "oneway", value: "yes"}`
    * search for `oneway=yes`

* `{name: "paths and footways", key: "highway", values: ["path","footway"]}`
    * search for `highway=path` and `highway=footway`

* `{name: "need fixing", keys: ["fixme", "FIXME"]}`
    * search for instances of the key `fixme` and `FIXME`

* `{name: "designations", key: "designation", values: ["public_footpath","public_bridleway"], matches_key: "highway"}`
    * searches for `designation=public_footpath` and `designation=public_bridleway` that appear on `highway=*`

* `{name: "designations for footpaths", key: "designation", values: ["public_footpath","public_bridleway"], matches_key: "highway", matches_values: ["footway","path"]}`
    * searches for `designation=public_footpath` and `designation=public_bridleway` that appear on `highway=footway` or `highway=path`


## Creating a Google Service Account

This script requires 2 files (next to this file) to work.

* **google-generated-creds.json**
    * In the Google Dashboard, create a new project and activate the Google Sheets API
    * With the Google Sheets API selected, create a service account and add a key to it. When adding a key, there is a JSON option, choose this and that's the file you'll need.
    * Add the email of the service account to the sheet you'd like to add to


