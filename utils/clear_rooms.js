const mongo = require("mongodb").MongoClient

let client

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {
        console.error(err)
        return
    }
    client = client
    let database = client.db("chat-app")
    let rooms = await database.collection("rooms").find({})
    rooms.forEach(async function(e) {
        if (e.name === "general") {
            return
        }
        let room_users = e.users
        room_users.forEach(async function(username) {
            await database.collection("users").updateOne({username: username}, {$pull : {rooms: e.name}})
        })
        await database.collection("messages").deleteOne({name: e.name})
        await database.collection("rooms").deleteOne({name: e.name})
        console.log("cleared")
    })
})

   