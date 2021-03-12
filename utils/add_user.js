const mongo = require("mongodb").MongoClient
const ObjectID = require("mongodb").ObjectID

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {console.error(err); return}

    let database = client.db("chat-app")
    let arguments = process.argv
    let general_id;
    await database.collection("rooms").findOne({name: "general"}).then((value) => {
        general_id = value._id
    })

    for (let i = 2; i < arguments.length; i++) {
        let new_user = {username: arguments[i], password: arguments[i], status: false, current_id: null, rooms: [{room_name: "general", room_id: general_id}], current_room: null}
        let found_user = await database.collection("users").findOne({username: arguments[i]})
        if (found_user === null) {
            await database.collection("users").insertOne(new_user)
            await database.collection("rooms").updateOne({_id: ObjectID(general_id)}, {$push: {users: arguments[i]}})
            console.log(`${arguments[i]} was created with password ${arguments[i]}`)
        } else {
            console.log(`${arguments[i]} is not available`)
        }
    }

    client.close()
})