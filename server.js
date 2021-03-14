const path = require("path")
const http = require("http")
const express = require("express")
const helmet = require("helmet")
const socketio = require("socket.io")
const mongo = require("mongodb").MongoClient
const fs = require("fs")
const ObjectID = require("mongodb").ObjectID

const mongo_url = "mongodb://localhost:27017"

const app = express()
app.use(helmet())

const server = http.createServer(app)
const io = socketio(server)

let users;
let active_users = []
let expected_logins = []
let database;
let messages_collection;
let users_collection;
let rooms_collection;
const PORT = process.env.PORT || 3000
let general_id;

let home_url = "http://maxvek.com"

// mondodb connection

mongo.connect(mongo_url, {useNewUrlParser: true, useUnifiedTopology: true}, async (error, client) => {
    if (error) {
        console.error(error)
        return
    }
    database = client.db("chat-app")
    users_collection = database.collection("users")
    messages_collection = database.collection("messages")
    rooms_collection = database.collection("rooms")
    await rooms_collection.updateMany({}, { $set: {online_users: []}})
    await users_collection.updateMany({}, {$set: {status: false}})
    await users_collection.find().toArray((error, items) => {
        if (error) {
            console.error(error)
            return
        }
        users = items
        console.log("users received from database")
    })

    // CHANGE GENERAL ROOM TO SEARCH FOR _ID OF GENERAL ROOM HERE

    let general_room = await rooms_collection.findOne({name: "general"})
    general_id = general_room._id
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

// Set static folder
// app.use(express.static(path.join(__dirname, "public")))

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.get("/css/login.css", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/css/login.css"))
})

app.get("/js/login.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/js/login.js"))
})

app.get("/chat.html", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/chat.html"))
})

app.get("/css/style.css", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/css/style.css"))
})

app.get("/js/main.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/js/main.js"))
})

app.get("/images/chat_app_icon2.png", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/images/chat_app_icon2.png"))
})

app.get("/sign-up.html", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/sign-up.html"))
})

app.get("/js/sign_up.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/js/sign_up.js"))
})

app.get("/css/sign_up.css", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/css/sign_up.css"))
})

app.get("/utils/cookie_check.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/cookie_check.js"))
})

app.get("/utils/room_settings.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/room_settings.js"))
})

app.get("/css/room_settings.css", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/css/room_settings.css"))
})

app.get("/css/loader.css", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/css/loader.css"))
})

app.get("/utils/remove_loading.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/remove_loading.js"))
})

app.get("/js/loader.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/js/loader.js"))
})

app.get("/utils/main_listener.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/main_listener.js"))
})

app.get("/utils/login_listener.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/login_listener.js"))
})

app.get("/utils/signup_listener.js", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/utils/signup_listener.js"))
})

app.get("/fonts/:font_name", function(req, res) {
    if (fs.existsSync(`./public/fonts/${req.params.font_name}`)) {
        res.sendFile(path.join(__dirname, `/public/fonts/${req.params.font_name}`))
    }
    else {
        res.sendStatus(404)
    }
})

// Run when a client connects
io.on("connection", function(socket) {

    // socket.emit("message", {id: 3, message: "Welcome to my chat app!"})

    // Broadcast when a user connects

    socket.on("login-connection", async function(data) {
        let found_user = await find_user(data.username)
        if (found_user === null) {
            socket.emit("redirect_command", home_url)
            return
        }

        let log_in_result = log_in_user(found_user, data.id)

        if (!log_in_result) {
            socket.emit("redirect_command", home_url)
            console.log(`${data.username} login attempt denied`)
        }
        else {
            console.log(`${data.username} login attempt accepted`)
            // socket.broadcast.emit("message", {id: 3, message: `${data.username} has joined the chat`})
            //socket.emit("login-confirmation", find_user_by_id_for_confirmation(socket.id))
            send_login_confirmation(socket.id)
            join_room(general_id, data.username)
        }
        
    })

    socket.on("message-request", async function(data) {
        try {
            send_room_messages(socket.id, data.room_id)
            // if (user_messages === null) {
            //     console.log("error1 encountered")
            //     return
            // }
            // let messages = user_messages.messages
            // if (messages != undefined) {
            //     messages.forEach(function(message) {
            //         socket.emit("message-answer", message)
            //     }
            // )}
        }
        catch (error) {
            console.error(error)
        }
    })

    // on disconnect
    socket.on("disconnect", async () => {

        user = await find_user_by_id(socket.id)

        if (user === null) {
            return
        }

        let found_user = await users_collection.findOne({username: user.username})
        users_room = found_user.current_room

        await rooms_collection.updateOne({_id: ObjectID(users_room.room_id)}, {$pull: {online_users: found_user.username}})

        let users_room_online = await rooms_collection.findOne({_id: ObjectID(users_room.room_id)})
        users_room_online = users_room_online.online_users

        for (let i = 0; i < users_room_online.length; i++) {
            let current_user = await users_collection.findOne({username: users_room_online[i]})
            io.to(current_user.current_id).emit("remove_online_user", found_user.username)
        }

        console.log(`${found_user.username} has logged out`)
        await log_out_user(found_user.username)
        // io.emit("message", {id: 3, message: `${user.username} has left the chat.`})
        //io.emit("remove_online_user", user.username)
    })

    socket.on("chat-message", async (data) => {
        let found_user = await find_user_by_id(socket.id)
        messages_collection.updateOne({_id: ObjectID(data.room_id)}, {$push: {messages: {message: data.message, from: found_user.username}}})
        emit_to_in_room("message", data.room_id, {message: data.message, from: socket.id, user_from: found_user.username})
        // io.emit("message", data)
    })

    socket.on("login-check", async function(data) {
        if (await check_login(data)) {
            //expected_logins.push(await find_user(data.username))
            expected_logins.push(data.username)
            socket.emit("login-result", {result: true, username: data.username})
        }
        else {
            socket.emit("login-result", {result: false, username: data.username})
        }
    })

    socket.on("signup-check", async (data) => {
        let sign_up_result = await check_signup(data.username)
        if (sign_up_result) {
            add_user(data)
            socket.emit("signup-result", true)
        }
        else {
            socket.emit("signup-result", false)
        }
    })

    socket.on("change-room", async (data) => {

        let found_user = await find_user_by_id(socket.id)
        let room_check = await users_collection.findOne({rooms: {$elemMatch: {room_name: data.new_room.room_name, room_id: ObjectID(data.new_room.room_id)}}})
        if (room_check === null) {
            console.log(`${found_user.username} tried to join a different room`)
            socket.emit("redirect_command", home_url)
            leave_room(data.current_room.room_id, found_user.username)
            log_out_user(found_user.username)
            return
        }

        console.log(`${found_user.username} is changing rooms to ${data.new_room.room_name}`)
        
        if (!data.deleting_room) {
            leave_room(data.current_room.room_id, found_user.username)
        }
        join_room(data.new_room.room_id, found_user.username)
        send_room_messages(socket.id, data.new_room.room_id)
    })

    socket.on("create-room", (data) => {
        create_room(data.room_name, data.users)
    })

    socket.on("room-settings-user-request", async (room_id) => {
        let found_room = await rooms_collection.findOne({_id: ObjectID(room_id)})
        socket.emit("room-settings-user-response", found_room.users)
    })

    socket.on("add_user_to_room", (data) => {
        add_user_into_room(data.user, data.room.room_name, data.room.room_id)
    })

    socket.on("room-settings-remove-users", async (data) => {
        let found_room = await rooms_collection.findOne({_id: ObjectID(data.room_id)}) // check this line
        let room_users = found_room.online_users

        for (let i = 0; i < data.users_to_remove.length; i++) {
            await users_collection.updateOne({username: data.users_to_remove[i]}, {$pull: {rooms: {room_id: ObjectID(data.room_id)}}})
            await rooms_collection.updateOne({_id: ObjectID(data.room_id)}, {$pull: {users: data.users_to_remove[i], online_users: data.users_to_remove[i]}})
            let found_user = await users_collection.findOne({username: data.users_to_remove[i]})
            io.to(found_user.current_id).emit("room-settings-remove-room", data.room_id) 

            for (let ii = 0; ii < room_users.length; ii++) { //check these lines:
                //console.log(`sending to ${room_users[ii]}, remove user is ${found_user.username}`)
                //if (room_users[ii] !== found_user.username) { //
                if (data.users_to_remove.indexOf(room_users[ii]) === -1) {
                    let sending_user = await users_collection.findOne({username: room_users[ii]}) //
                    io.to(sending_user.current_id).emit("room-settings-remove-room-user", found_user.username) //
                }
            }
        }

        let refound_room = await rooms_collection.findOne({_id: ObjectID(data.room_id)})
        if (refound_room.users.length === 0) {
            await delete_room(data.room_id, data.room_name)
        }
    })

    socket.on("room-settings-delete-room", async (data) => {
        await delete_room(data.room_id, data.room_name)
    })

})

async function emit_to_in_room(message_name, room_id, message) {
    let room_users = await rooms_collection.findOne({_id: ObjectID(room_id)}).catch((error) => console.error(error))
    let users_in_room = room_users.online_users

    for (let i = 0; i < users_in_room.length; i++) {
        let found_user = await users_collection.findOne({username: users_in_room[i]})
        io.to(found_user.current_id).emit(message_name, message)
    }

    // users_in_room.forEach(async (user) => {
    //     let found_user = await users_collection.findOne({username: user})
    //     io.to(found_user.current_id).emit(message_name, message)
    // })
}

async function send_room_messages(user_id, room_id) {
    let room_messages = await messages_collection.findOne({_id: ObjectID(room_id)})
    // console.log(room_messages.messages)
    io.to(user_id).emit("message-answer", room_messages.messages.concat(["$${{||}}$$"]))
}

function log_in_user(user, id) {

    if (user.status === false && in_expected_logins(user)) {
        user.status = true
        user.current_id = id
        active_users.push(user)
        users_collection.updateOne({username: user.username}, {$set : {current_id: user.current_id, current_room: {room_name: "general", room_id: general_id}, status: true}})
        return true
    }
    else {
        return false
    }
}

function in_expected_logins(user) {
    for (let i = 0; i < expected_logins.length; i++) {

        if (expected_logins[i] === user.username) {
            expected_logins.splice(i, 1)
            return true
        }
    }
    return false
}

async function leave_room(room_id, username) {

    rooms_collection.updateOne({_id: ObjectID(room_id)}, {$pull: {online_users: username}})
    let room_users = await rooms_collection.findOne({_id: ObjectID(room_id)})
    users_in_room = room_users.online_users
    for (let i = 0; i < users_in_room.length; i++) {

            let found_user = await users_collection.findOne({"username": users_in_room[i]})
            if (found_user.username != username) {
                io.to(found_user.current_id).emit("remove_online_user", username)
            }   

    }
    // room_users.users.forEach((user) => {
    //     if (in_active_users_username(user.username)) {
    //         io.to(user.current_id).emit("remove_online_user", username)
    //     }
    // })

}

async function join_room(room_id, username) {
    let room_users = await rooms_collection.findOne({_id: ObjectID(room_id)})
    await users_collection.updateOne({"username": username}, {$set: {current_room: {room_name: room_users.name, room_id: room_users._id}}})
    let joining_user = await users_collection.findOne({"username": username})
    io.to(joining_user.current_id).emit("room-info", {"room_name": room_users.name, users: room_users.users})

    // ----------------------------------------------------------------------

    await rooms_collection.updateOne({_id: ObjectID(room_id)}, {$push: {online_users: username}})
    let real_room = await rooms_collection.findOne({_id: ObjectID(room_id)})
    let users_in_room = real_room.online_users

    io.to(joining_user.current_id).emit("add_online_users", users_in_room)

    for (let i = 0; i < users_in_room.length; i++) {
            let found_user = await users_collection.findOne({"username": users_in_room[i]})
            if (found_user.username !== username) {
                //io.to(found_user.current_id).emit("room-info", {users: [username]})
                io.to(found_user.current_id).emit("add_online_users", [username])
            }
    }
}

function in_active_users_username(username) {
    for (let i = 0; i < active_users.length; i++) {
        user = active_users[i]
        if (user.username === username) {
            return true
        }
    }
    return false
}

async function log_out_user(user) {
    user.status = false
    user.current_id = null
    active_users.splice(active_users.indexOf(user), 1)

    await users_collection.updateOne({username: user}, {$set: {status: false, current_id: null}})

}

async function find_user(username) {

    let found_user = await users_collection.findOne({username: username})
    if (found_user === null) {
        return null
    }
    return found_user

}

async function find_user_by_id(id) {
    // for (let i = 0; i < users.length; i++) {
    //     if (users[i].current_id === id) {
    //         return users[i]
    //     }
    // }
    // return null

    let found_user = await users_collection.findOne({"current_id": id})
    
    if (found_user === null) {
        return null
    }
    else {
        return found_user
    }

}

async function send_login_confirmation(user_id) {
    let found_user = await users_collection.findOne({current_id: user_id})
    io.to(user_id).emit("login-confirmation", {rooms: found_user.rooms, general_id: general_id})
}

async function check_login(data) {

    let found_user = await users_collection.findOne({username: data.username})

    if (found_user === null) {
        return false
    }

    if (found_user.password === data.password && found_user.status === false) {
        return true
    }

    return false

    // for(let i = 0; i < users.length; i++) {
    //     if(users[i].username === data.username) {
    //         if (users[i].password === data.password) {
    //             if (users[i].status === false) {
    //                 return true
    //             }
    //             return false
    //         }

    //         return false
    //     }
    // }
    // return false
}

async function check_signup(username) {
    // for (let i = 0; i < users.length; i++) {
    //     if (users[i].username === username) {
    //         return false
    //     }
    // }

    let found_user = await users_collection.findOne({username: username})
    if (found_user === null) {
        return true
    }
    return false
}

async function add_user(data) {
    let new_user = {username: data.username, password: data.password, status: false, current_id: null, rooms: [{room_name: "general", room_id: general_id}], current_room: null}
    users.push(new_user)
    users_collection.insertOne(new_user)
    console.log(`New user created: [username: ${new_user.username}, password: ${new_user.password}]`)
    rooms_collection.updateOne({_id: ObjectID(general_id)}, {$addToSet: {users: new_user.username}})

    let general_room = await rooms_collection.findOne({_id: ObjectID(general_id)})
    let general_room_users = general_room.online_users
    for (let i = 0; i < general_room_users.length; i++) {
        let found_user = await users_collection.findOne({username: general_room_users[i]})
        if (found_user !== null) {
            io.to(found_user.current_id).emit("room-info", {users: [data.username]})
        }
    }

}

async function create_room(room_name, room_users) {

    let real_users = []

    for (let i = 0; i < room_users.length; i++) {
        let user_obj = room_users[i]
        let found_user = await users_collection.findOne({username: user_obj})
        // console.log(found_user)

        if (found_user) {
            real_users.push(found_user.username)
        }
        else {
            console.log(`user ${user_obj} was not found in the database`)
        }
    }

    let new_room = {name: room_name, display_name: room_name, "users": real_users, online_users: []}
    await rooms_collection.insertOne(new_room, async (err) => {
        if (err) {
            console.error(err)
            return
        }

        for (let i = 0; i < real_users.length; i++) {
            if (in_active_users_username(real_users[i])) {
                await users_collection.updateOne({username: real_users[i]}, {$push: {rooms: {room_name: room_name, room_id: new_room._id}}})
                let found_user = await users_collection.findOne({username: real_users[i]})
                io.to(found_user.current_id).emit("add_room", {room_name: room_name, room_id: new_room._id})
            }
        }
    })

    await messages_collection.insertOne({_id: ObjectID(new_room._id), name: room_name, messages: []}, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })
    console.log(`new room created: ${room_name} with ${real_users}`)
}

// async function find_user_db(username) {
//     let found_user = await users_collection.findOne({"username": username})
//     return found_user
// }

async function add_user_into_room(username, room_name, room_id) {

    let found_user = await users_collection.findOne({"username":username})
    let found_room = await rooms_collection.findOne({_id: ObjectID(room_id)})
    room_users = found_room.users

    if (found_user !== null && room_users.indexOf(username) === -1) {
        await users_collection.updateOne({"username": username}, {$push : {rooms: room_name}})
        await rooms_collection.updateOne({_id: ObjectID(room_id)}, {$push : {users: username}})
        
        let users_in_room = await rooms_collection.findOne({_id: ObjectID(room_id)})
        users_in_room = users_in_room.online_users

        for (let i = 0; i < users_in_room.length; i++) {
            let current_user = await users_collection.findOne({"username": users_in_room[i]})
            io.to(current_user.current_id).emit("room-info", {users: [username]})
        }

        io.to(found_user.current_id).emit("add_room", {room_name: found_room.name, room_id: found_room._id})
    }    
}

async function delete_room(room_id, room_name) {
    console.log(`deleting room: ${room_name}`)
    let found_room = await rooms_collection.findOne({_id: ObjectID(room_id)})
    for (let i = 0; i < found_room.users.length; i++) {
        await users_collection.updateOne({username: found_room.users[i]}, {$pull: {rooms: room_name}})
        let found_user = await users_collection.findOne({username: found_room.users[i]})
        if (found_user.current_id !== null) {
            io.to(found_user.current_id).emit("room-settings-remove-room", room_id)
        }
    }
    await messages_collection.deleteOne({_id: ObjectID(room_id)})
    await rooms_collection.deleteOne({_id: ObjectID(room_id)})
}
