const mongo = require("mongodb").MongoClient

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {
        console.error(error)
        return
    }
    let database = client.db("chat-app")
    database.collection("rooms").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    database.collection("messages").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    database.collection("users").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    let general_room = {name: "general", display_name: "general", users: [], online_users: []}
    await database.collection("rooms").insertOne(general_room)
    await database.collection("messages").insertOne({_id: general_room._id, name: "general", messages: []})
    client.close()
})