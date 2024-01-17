const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/shop';
const client = new MongoClient(url);

async function getConnection(){
    const connection = await client.connect();
    return connection;
}

async function closeConnection(){
   await client.close();
}

module.exports = {
    getConnection,closeConnection
}