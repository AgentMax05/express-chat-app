const mongo = require("mongodb").MongoClient

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {
        console.error(err)
        return
    }
    let database = client.db("chat-app")
    // database.collection("rooms").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    // database.collection("messages").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    // database.collection("users").deleteMany({}, (err, obj) => {if (err) {console.error(error); return;}})
    database.collection("rooms").deleteOne({name: "general"})
    database.collection("messages").deleteOne({name: "general"})

    let users = await database.collection("users").find({}).toArray()
    let general_users = []
    for (let i = 0; i < users.length; i++) {
        general_users.push(users[i].username)
    }
    let general_room = {name: "general", display_name: "general", users: general_users, online_users: []}
    await database.collection("rooms").insertOne(general_room)
    await database.collection("messages").insertOne({_id: general_room._id, name: "general", messages: []})
    client.close()
})