const MongoClient = require("mongodb");
const ObjectId = MongoClient.ObjectId;

function parseObjectIds(json){
   Object.entries(json).forEach(entry => {
       let key = entry[0];
       let value = entry[1];
       if(key == "_id"){
           json.id = ObjectId(entry[1]);
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
            return callback(null, {count:found.length, value: found});
        } catch (error) {
            return callback(error);
        }
    }
}

function insert(dbClient) {
    return async (collection, doc, req, callback) => {
        try {            
            let inserted = await dbClient.collection(collection).insertOne(doc);
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