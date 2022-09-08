const mongo = require("mongodb").MongoClient

mongo.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true}, async (err, client) => {
    if (err) {
        console.error(err);
        return;
    }
    let database = client.db("chat-app");

    let users = await database.collection("users").find({}).toArray();

    let general_room = await database.collection("rooms").findOne({name:"general"});

    let general_users = []
    for (let i = 0; i < users.length; i++) {
        general_users.push(users[i].username)
        let result = await database.collection("users").updateOne({username: users[i].username}, {$push: {rooms: {room_name: "general", room_id: ObjectID(general_room._id)}}});
        console.log(result);
    }
    
    let updateResult = await database.collection("rooms").updateOne({name: "general"}, {$set: {users: general_users}});
    console.log(updateResult);


    // let general_room = {name: "general", display_name: "general", users: general_users, online_users: []}
    // await database.collection("rooms").insertOne(general_room)
    // await database.collection("messages").insertOne({_id: general_room._id, name: "general", messages: []})
    client.close()
})