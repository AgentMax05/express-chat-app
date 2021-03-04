const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const mongo = require("mongodb").MongoClient
const e = require("express")

const mongo_url = "mongodb://localhost:27017"

const app = express()
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
    await users_collection.find().toArray((error, items) => {
        if (error) {
            console.error(error)
            return
        }
        users = items
        console.log("users received from database")
    })
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

// Run when a client connects
io.on("connection", function(socket) {

    // socket.emit("message", {id: 3, message: "Welcome to my chat app!"})

    // Broadcast when a user connects

    socket.on("login-connection", function(data) {
        console.log(`attempted login for ${data.username}`)
        let found_user = find_user(data.username)
        if (found_user === null) {
            socket.emit("redirect_command", "http://localhost:3000")
            return
        }
        let log_in_result = log_in_user(found_user, data.id)
        if (!log_in_result) {
            socket.emit("redirect_command", "http://localhost:3000")
            console.log(`${data.username} login attempt denied`)
        }
        else {
            console.log(`${data.username} login attempt accepted`)
            // socket.broadcast.emit("message", {id: 3, message: `${data.username} has joined the chat`})
            //socket.emit("login-confirmation", find_user_by_id_for_confirmation(socket.id))
            send_login_confirmation(socket.id)
            console.log("new user online")
            join_room("general", data.username)
        }
        
    })

    socket.on("message-request", async function(data) {
        try {
            send_room_messages(socket.id, data.room_name)
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
    socket.on("disconnect", function() {
        user = find_user_by_id(socket.id)
        if (user === null) {
            return
        }
        console.log(`${user.username} has logged out`)
        log_out_user(user)
        // io.emit("message", {id: 3, message: `${user.username} has left the chat.`})
        io.emit("remove_online_user", user.username)
    })

    socket.on("chat-message", async function(data) {
        messages_collection.updateOne({name: data.room_name}, {$push: {messages: {message: data.message, from: find_user_by_id(socket.id).username}}})
        emit_to_in_room("message", data.room_name, {message: data.message, from: socket.id})
        // io.emit("message", data)
    })

    socket.on("login-check", function(data) {
        if (check_login(data)) {
            socket.emit("login-result", {result: true, username: data.username})
            expected_logins.push(find_user(data.username))
        }
        else {
            socket.emit("login-result", {result: false, username: data.username})
        }
    })

    socket.on("signup-check", function(data) {
        let sign_up_result = check_signup(data.username)
        if (sign_up_result) {
            add_user(data)
            socket.emit("signup-result", true)
        }
        else {
            socket.emit("signup-result", false)
        }
    })

    socket.on("change-room", (data) => {
        console.log(`${find_user_by_id(socket.id).username} is changing rooms to ${data.new_room}`)
        leave_room(data.current_room, find_user_by_id(socket.id).username)
        join_room(data.new_room, find_user_by_id(socket.id).username)
        send_room_messages(socket.id, data.new_room)
    })

    socket.on("create-room", (data) => {
        create_room(data.room_name, data.users)
    })

    socket.on("room-settings-user-request", async (room_name) => {
        let found_room = await rooms_collection.findOne({name: room_name})
        socket.emit("room-settings-user-response", found_room.users)
    })

    socket.on("add_user_to_room", (data) => {
        let username = data.user
        let room = data.room
        //let found_user = find_user_db(username)
        add_user_into_room(username, room)
    })

    socket.on("room-settings-remove-users", async (data) => {
        for (let i = 0; i < data.users_to_remove.length; i++) {
            await users_collection.updateOne({username: data.users_to_remove[i]}, {$pull: {rooms: data.room_name}})
            await rooms_collection.updateOne({name: data.room_name}, {$pull: {users: data.users_to_remove[i]}})
            let found_user = await users_collection.findOne({username: data.users_to_remove[i]})
            io.to(found_user.current_id).emit("room-settings-remove-room", data.room_name)
        }
    })

})

async function emit_to_in_room(message_name, room_name, message) {
    let room_users = await rooms_collection.findOne({name: room_name}).catch((error) => console.error(error))
    let users_in_room = room_users.online_users
    users_in_room.forEach(async(user) => {
        let found_user = await users_collection.findOne({username: user})
        io.to(found_user.current_id).emit(message_name, message)
    })
}

async function send_room_messages(user_id, room_name) {
    console.log(`looking for messages in ${room_name}`)
    room_messages = await messages_collection.findOne({name: room_name})
    // room_messages.messages.forEach((message) => {
    //     io.to(user_id).emit("message-answer", message)
    // })
    io.to(user_id).emit("message-answer", room_messages.messages)
}

function log_in_user(user, id) {
    if (user.status === false && in_expected_logins(user)) {
        user.status = true
        user.current_id = id
        active_users.push(user)
        users_collection.updateOne({username: user.username}, {$set : {current_id: user.current_id}})
        return true
    }
    else {
        return false
    }
}

function in_expected_logins(user) {
    for (let i = 0; i < expected_logins.length; i++) {
        if (expected_logins[i] === user) {
            expected_logins.splice(i, 1)
            return true
        }
    }
    return false
}

async function leave_room(room_name, username) {
    rooms_collection.updateOne({name: room_name}, {$pull: {online_users: username}})
    let room_users = await rooms_collection.findOne({name: room_name})
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

async function join_room(room_name, username) {
    let room_users = await rooms_collection.findOne({name: room_name})
    let joining_user = await users_collection.findOne({"username": username})

    console.log(`room users: ${JSON.stringify(room_users.users)}`)

    io.to(joining_user.current_id).emit("room-info", {"room_name": room_name, users: room_users.users})

    // ----------------------------------------------------------------------

    await rooms_collection.updateOne({name: room_name}, {$push: {online_users: username}})
    let real_room = await rooms_collection.findOne({name: room_name})
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

// function in_active_users(user) {
//     let result = active_users.indexOf(user)
//     if (result === -1) {
//         return false
//     }
//     return true
// }

function in_active_users_username(username) {
    for (let i = 0; i < active_users.length; i++) {
        user = active_users[i]
        if (user.username === username) {
            return true
        }
    }
    return false
}

function log_out_user(user) {
    user.status = false
    user.current_id = null
    active_users.splice(active_users.indexOf(user), 1)
}

function find_user(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return users[i]
        }
    }
    return null
}

function find_user_by_id(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].current_id === id) {
            return users[i]
        }
    }
    return null
}

async function send_login_confirmation(user_id) {
    let found_user = await users_collection.findOne({current_id: user_id})
    io.to(user_id).emit("login-confirmation", {rooms: found_user.rooms})
}

function check_login(data) {
    for(let i = 0; i < users.length; i++) {
        if(users[i].username === data.username) {
            if (users[i].password === data.password) {
                if (users[i].status === false) {
                    return true
                }
                return false
            }

            return false
        }
    }
    return false
}

function check_signup(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return false
        }
    }
    return true
}

async function add_user(data) {
    let new_user = {username: data.username, password: data.password, status: false, current_id: null, rooms: ["general"]}
    users.push(new_user)
    users_collection.insertOne(new_user)
    console.log(`New user created: ${JSON.stringify(new_user)}`)
    rooms_collection.updateOne({name: "general"}, {$addToSet: {users: new_user.username}})

    let general_room = await rooms_collection.findOne({name: "general"})
    console.log(JSON.stringify(general_room))
    let general_room_users = general_room.online_users
    for (let i = 0; i < general_room_users.length; i++) {
        let found_user = await users_collection.findOne({username: general_room_users[i]})
        console.log(`found user: ${found_user.username}`)
        if (found_user !== null) {
            console.log(`sending msg to ${found_user.username}`)
            io.to(found_user.current_id).emit("room-info", {users: [data.username]})
        }
    }

}

async function create_room(room_name, room_users) {

    console.log(room_users)

    let real_users = []

    for (let i = 0; i < room_users.length; i++) {
        let user_obj = room_users[i]
        let found_user = await users_collection.findOne({username: user_obj})
        // console.log(found_user)
        console.log(found_user != null && found_user != undefined)
        if (found_user) {
            real_users.push(found_user.username)
            console.log("pushed to real_users")
            console.log(real_users)
            await users_collection.updateOne({username: found_user.username}, {$push: {rooms: room_name}})
            if (in_active_users_username(found_user.username)) {
                io.to(found_user.current_id).emit("add_room", room_name)
            }
        }
        else {
            console.log(`user ${user_obj} was not found in the database`)
        }
    }

    console.log(`real users: ${real_users}`)

    await rooms_collection.insertOne({name: room_name, "users": real_users, online_users: []}, (err, res) => {
        if (err) {
            console.error(err)
            return
        }
    })
    await messages_collection.insertOne({name: room_name, messages: []}, (err, res) => {
        if (err) {
            console.error(err)
            return
        }
    })
    console.log(`new room created: ${room_name} with ${real_users}__`)
}

async function find_user_db(username) {
    let found_user = await users_collection.findOne({"username": username})
    return found_user
}

async function add_user_into_room(username, room_name) {

    let found_user = await users_collection.findOne({"username":username})
    let room_users = await rooms_collection.findOne({"name": room_name})
    room_users = room_users.users

    if (found_user !== null && room_users.indexOf(username) === -1) {
        await users_collection.updateOne({"username": username}, {$push : {rooms: room_name}})
        await rooms_collection.updateOne({name: room_name}, {$push : {users: username}})
        
        let users_in_room = await rooms_collection.findOne({name: room_name})
        users_in_room = users_in_room.online_users

        for (let i = 0; i < users_in_room.length; i++) {
            let current_user = await users_collection.findOne({"username": users_in_room[i]})
            io.to(current_user.current_id).emit("room-info", {users: [username]})
        }

        io.to(found_user.current_id).emit("add_room", room_name)
    }
    
}