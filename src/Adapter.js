const MongoClient = require("mongodb");
const ObjectId = MongoClient.ObjectId;


function parseObjectIds(json){
   Object.entries(json).forEach(entry => {
       let key = entry[0];
       let value = entry[1];
       if(key == "_id"){
           json._id = ObjectId(entry[1]);
           return;
       }
       if(typeof value == "object"){
           if(Array.isArray(entry[1])){
               json[key] == value.map(item => parseObjectIds(item));
           }
           else {
               json[key] = parseObjectIds(value)
           }
       }
   })
   return json;
}

function toAggregatePipeline(query){

    let pipeLine = Object.entries(query).filter(entry => {

        let isCommand = entry[0].startsWith("$");

        let validObject = typeof entry[1] == "object" && !Array.isArray(entry[1]);
        let isEmptyObject = validObject && (Object.keys(entry[1]).length == 0);
        let isOrderBy = entry[0] == "$orderby"

        return isCommand && !isOrderBy && (validObject && !isEmptyObject);
    })
    .map(entry => {
        let value = entry[1]
        let operation = entry[0];
        if(operation == "$filter"){
            operation = "$match"
        }

        if(operation == "$select"){
            operation = "$project"
        }
        if(operation == "$count"){
            value = "count";
        }
        return {
                [operation]: value
            }
    })
        
    return pipeLine;

}

function update(dbClient) {
    return async (collection, query, update, req, callback) => {
        try {         
            query = parseObjectIds(query);   
            if (update.hasOwnProperty("$set")) {
                delete update.$set._id;
            };

            const updateResult = await dbClient.collection(collection).updateOne(query, update);
            let matchedCount = updateResult.matchedCount;
            if(matchedCount !== 1){
                let err = new Error("Could not find the dataset, to be updated");
                return callback(err);
            }
           
            return callback(null, matchedCount)

        } catch (error) {
            return callback(error);
        }
    }
}

function remove(dbClient) {
    return async (collection, query, req, callback) => {
        try {
            query = parseObjectIds(query);
            let removed = await dbClient.collection(collection).remove(query);
            return callback(null, removed);
        } catch (error) {
            return callback(error);
        }
    }
}

function query(dbClient) {
    return async (collection, query, req, callback) => {
        try {
            query = parseObjectIds(query);
            let pipeLine = toAggregatePipeline(query);
            
            let found = await dbClient.collection(collection).aggregate(pipeLine).toArray();
            let result = found;
            if(query.hasOwnProperty("$count") && query.$count){
                result = {
                    value: found,
                    count: found.length
                }
            }
            return callback(null, result);
        } catch (error) {
            return callback(error);
        }
    }
}

function insert(dbClient) {
    return async (collection, doc, req, callback) => {
        try {            
            let result = await dbClient.collection(collection).insertOne(doc);
            let inserted = await dbClient.collection(collection).findOne({_id: result.insertedId});

            return callback(null, inserted);
        } catch (error) {
            return callback(error);
        }
    }
}

function Adapter(dbClient) {

    return function (odataServer) {
        odataServer = odataServer
        .update(update(dbClient))
        .remove(remove(dbClient))
        .query(query(dbClient))
        .insert(insert(dbClient))
        return odataServer;
    }
}

module.exports = Adapter;