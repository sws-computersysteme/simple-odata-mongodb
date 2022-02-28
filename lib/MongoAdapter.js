const MongoClient = require("mongodb");
const ObjectId = MongoClient.ObjectId;


function update(getMongoDb){
    getMongoDb((err, db) => {

    })
}

function remove(getMongoDb){
    getMongoDb((err,db) => {

    })

function query(getMongoDb){
    getMongoDb((err, db => {

    }))
}

function insert(getMongoDb){
    getMongoDb((err,db) => {

    })
}


const MongoAdapter = getMongoDb => 
odataServer => odataServer
.update(update(getMongoDb))
.remove(remove(getMongoDb))
.query(query(getMongoDb))
.insert(insert(getMongoDb)) 

module.exports = MongoAdapter;