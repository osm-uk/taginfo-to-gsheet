var bent    = require('bent')

const get = bent('https://taginfo.openstreetmap.org.uk/', 'GET', 'json', 200);

const getTagInfoData = async (searchData) => {
    const tagInfoData = []
    for(const val of searchData){
        let data = await processTagInfoEntry(val)
        tagInfoData.push( data )
    }
    return tagInfoData
}

module.exports = getTagInfoData

const processTagInfoEntry = async (data) => {
    let response = null

    let keys = removeEmptyEntries(getKeys(data))
    if (keys.length == 0) return null

    let values = removeEmptyEntries(getValues(data))
    let otherKeys = removeEmptyEntries(getOtherKeys(data))
    let otherValues = removeEmptyEntries(getOtherValues(data))

    const name = data.name ? data.name : keys[0]
    if (otherKeys.length > 0) {
        response = await queryCombination(keys, values, otherKeys, otherValues)
    } else if (values.length > 0) {
        response = await queryKeyValue(keys, values)
    } else {
        response = await queryKey(keys)
    }

    if (response != null) {
        response.name = name
    }
        
    return response
}

// Retrieve values from incoming data

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

const getOtherKeys = (data) => {
    if (data.other_key != undefined) return [data.other_key]
    if (data.other_keys != undefined) return data.other_keys
    return []
}

const getOtherValues = (data) => {
    if (data.other_value != undefined) return [data.other_value]
    if (data.other_values != undefined) return data.other_values
    return []
}

// Query tagInfo

const queryKey = async (keys) => {
    const responses = []
    for(const key of keys) {
        const taginfoData = await get('api/4/key/stats?key='+ key);
        responses.push( parseData(taginfoData.data) )
    }
    return combineResponses(responses)
}

const queryKeyValue = async (keys, values) => {
    const responses = []
    for(const key of keys) {
        for(const value of values) {
            const taginfoData = await get('api/4/tag/stats?key='+ key+'&value='+value);
            responses.push( parseData(taginfoData.data) )
        }
    }
    return combineResponses(responses)
}

const queryCombination = async (keys, values, otherKeys, otherValues) => {
    const responses = []
    for(const key of keys) {
        for(const value of values) {
            const taginfoData = await get('api/4/tag/combinations?key='+ key+'&value='+value);
            for(const entry of taginfoData.data) {
                if (otherKeys.indexOf(entry.other_key) > -1) {
                    const match = (otherValues.length > 0) ? (otherValues.indexOf(entry.other_value) > -1) : true
                    if (match) {
                        //console.log("match", key, value, entry)
                        responses.push({
                            all: entry.together_count, 
                            nodes: null,
                            ways: null,
                            relations: null
                        })
                    }
                }
            }
        }
    }
    //console.log(responses.length)
    return combineResponses(responses)
}

// Helper

const removeEmptyEntries = (data) => {
    let response = data.filter( val => val != "" )
    if (response.length != data.length) console.log("removed entries!")
    return response
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