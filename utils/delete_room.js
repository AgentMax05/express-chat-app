const mongo = require("mongodb").MongoClient
const ObjectID = require("mongodb").ObjectID

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {console.error(err); return}

    let database = client.db("chat-app")
    let arguments = process.argv

    let finding;

    if (arguments[2] === "name") {finding = "name"}
    else if (arguments[2] === "id") {finding = "id"}
    else {console.log("3rd argument must be 'name' or 'id'"); return}

    for (let i = 3; i < arguments.length; i++) {
        let found_room;

        if (finding === "name") {
            found_room = await database.collection("rooms").findOne({name: arguments[i]})
            if (found_room === null) {console.log(`room at index ${i} was not found`); continue}
        }
        else if (finding === "id") {
            found_room = await database.collection("rooms").findOne({_id: ObjectID(arguments[i])})
        }
        

        for (let user = 0; user < found_room.users.length; user++) {
            if (finding === "id") {
                await database.collection("users").updateOne({username: found_room.users[user]}, {$pull: {rooms: {$elemMatch: {room_id: arguments[i]}}}})
            }
            else {
                await database.collection("users").updateOne({username: found_room.users[user]}, {$pull: {rooms: {$elemMatch: {room_name: arguments[i]}}}})
            }
        }

        if (finding === "name") {
            await database.collection("messages").deleteOne({name: arguments[i]})
            await database.collection("rooms").deleteOne({name: arguments[i]})
        }
        else {
            await database.collection("messages").deleteOne({_id: ObjectID(arguments[i])})
            await database.colection("rooms").deleteOne({_id: ObjectID(arguments[i])})
        }
    }

    client.close()
})