const mongo = require("mongodb").MongoClient

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (error, client) => {
    if (error) {
        console.error(error)
        return
    }
    await client.db("chat-app").collection("messages").updateMany({}, {$set: {messages: []}})
    client.close()
})