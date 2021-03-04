let old_date = new Date("January 1, 1975 0:0:0");
document.cookie = "authentication=; expires=" + old_date.toUTCString()

const input_field = document.querySelector("#input")
let menu_container = document.querySelector("#menu_container")
let menu = document.querySelector("#create-room-menu")
let menu_children = Array.from(menu.children)

const socket = io()

let self_id;
let current_room = "general"

const params = new URLSearchParams(window.location.search)

if (!params.has("user")) {
    window.location.href = "http://localhost:3000"
}

const user = params.get("user")
// console.log(user)

input_field.addEventListener("keydown", function(key) {
    if (key.keyCode === 13) {
        submit()
    }
})

socket.on("connect", function() {
    self_id = socket.id
    // console.log(self_id)
    socket.emit("login-connection", {username: user, id: self_id})
})

socket.on("message", function(data) {
    // console.log(data.message)
    if (data.from === self_id) {
        outputSelfMessage(data.message)
    }
    else {
        outputOtherMessage(data.message)
    }
})

socket.on("message-answer", function(messages) {
    // if (message.from_me) {
    //     outputSelfMessage(message.message)
    // }
    // else {
    //     outputOtherMessage(message.message)
    // }
    messages.forEach((message) => {
        // console.log(`loading message: ${message.message}`)
        if (message.from === user) {
        outputSelfMessage(message.message)
        }
        else {
            outputOtherMessage(message.message)
        }
    })
    
})

socket.on("redirect_command", function(url) {
    window.location.href = url
})

socket.on("login-confirmation", function(returned_user) {
    socket.emit("message-request", {room_name: current_room})
    returned_user.rooms.forEach((room_name) => {
        add_room(room_name)
    })
    set_logged_in_as(user)
})

socket.on("add_room", function(room_name) {
    add_room(room_name)
})

socket.on("add_online_users", function(users_list) {
    users_list.forEach((username) => {
        console.log(`adding ${username}`)
        add_online_user(username)
    })
})

socket.on("remove_online_user", function(username) {
    // console.log("removing:" + username)
    remove_online_user(username)
})

socket.on("room-info", (data) => {
    // console.log(data)
    console.log("adding room info")
    set_info_room_users(data.users)
    if (data.room_name != undefined) {
        set_info_room_name(data.room_name)
    }
})

function submit() {
    const msg = input_field.value 
    
    if (msg != "") {
        input_field.value = ""
        socket.emit("chat-message", {id: self_id, message: msg, room_name: current_room})
    }
}

let current_row2 = 2

function outputSelfMessage(message) {
    let display = document.querySelector("#chat_display")
    let new_div2 = document.createElement("div")
    // new_div2.style.gridRow = current_row2
    // current_row2 = current_row2 + 1
    // new_div2.style.gridColumn = "1"
    new_div2.classList.add("message")
    new_div3 = document.createElement("div")
    new_div3.classList.add("message_container_self")
    new_div3.innerHTML = `<p>${message}</p>`
    new_div2.appendChild(new_div3)
    // display.style.gridTemplateRows = `${window.getComputedStyle(display).gridTemplaterows} 16px`
    display.appendChild(new_div2)
    //display.appendChild(document.createElement("hr"))
    display.scrollTop = display.scrollHeight
}

function outputOtherMessage(message) {
    let display = document.querySelector("#chat_display")
    let new_div2 = document.createElement("div")
    new_div2.classList.add("message")
    new_div3 = document.createElement("div")
    new_div3.classList.add("message_container_other")
    new_div3.innerHTML = `<p>${message}</p>`
    new_div2.appendChild(new_div3)
    display.appendChild(new_div2)
    display.scrollTop = display.scrollHeight
}

let sidebar = document.querySelector("#sidebar")

let current_row = 2

function enter_room(event_obj) {
    let room_name = event_obj.target.innerText
    if (room_name != current_room) {
        // console.log(`switching rooms to ${room_name}_`)
        clear_messages()
        clear_all_online()
        socket.emit("change-room", {current_room: current_room, new_room: room_name})
        current_room = room_name
    }
}

function clear_messages() {
    let display = document.querySelector("#chat_display")
    while (display.firstChild) {
        display.removeChild(display.firstChild)
    }
}

function add_room(name) {
    sidebar.style.gridTemplateRows = `${window.getComputedStyle(sidebar).gridTemplateRows} 100px`
    let new_div = document.createElement("div")
    new_div.className = "chat_item"
    let new_text = document.createElement("p")
    new_text.innerHTML = name
    new_text.style.userSelect = "none"
    new_div.appendChild(new_text)
    new_div.style.gridRow = current_row
    new_div.addEventListener("click", enter_room)
    current_row = current_row + 1
    sidebar.appendChild(new_div)
}

function add_online_user(username) {
    // let user_container = document.querySelector("#users_container")
    // let newuser_obj = document.createElement("div")
    // newuser_obj.classList.add("user_object")
    // let newuser_name = document.createElement("p")
    // newuser_name.innerHTML = username
    // newuser_obj.appendChild(newuser_name)
    // user_container.appendChild(newuser_obj)
    // console.log("new user added")

    console.log(`adding user ${username}`)

    let user_container = document.querySelector("#right_bar_users")
    let container_children = Array.from(user_container.children)
    for (let i = 0; i < container_children.length; i++) {
        if (container_children[i].innerText === username) {
            container_children[i].querySelector(".indicator").style.backgroundColor = "green"
            return
        }
    }
}

function clear_all_online() {
    let user_container = document.querySelector("#right_bar_users")
    while (user_container.firstChild) {
        user_container.removeChild(user_container.firstChild)
    }
}

function remove_online_user(username) {
    // let current_users = document.getElementsByClassName("user_object")
    // let user_obj = Array.from(current_users).find((element) => {
    //     return element.querySelector("p").innerHTML === username
    // })
    // user_obj.remove()

    let user_container = document.querySelector("#right_bar_users")
    let container_children = Array.from(user_container.children)
    for (let i = 0; i < container_children.length; i++) {
        if (container_children[i].innerText === username) {
            container_children[i].querySelector(".indicator").style.backgroundColor = "red"
            return
        }
    }

}

function create_room() {
    menu_container.style.display = "block"
}

function exit_room_menu() {
    menu_container.style.display = "none"
}

const room_name_input = document.querySelector("#room_name")
const room_user_input = document.querySelector("#add_user_input")
let new_room_users = [user]

function add_room_user() {
    let users_name = room_user_input.value
    if (users_name != "" && users_name != user) {
        room_user_input.value = ""
        new_room_users.push(users_name)
        valid(room_user_input, 500)
    }
    else {
        invalid(room_user_input, 500)
    }
}

function submit_add_room() {
    let new_room_name = room_name_input.value
    if (new_room_name != "") {
        socket.emit("create-room", {room_name: new_room_name, users: new_room_users})
        new_room_users = [user]
        exit_room_menu()
    }
    else {
        invalid(room_name_input, 500)
    }
}

function set_logged_in_as(username) {
    document.querySelector("#logged_in_as_text").innerText = username
}

function invalid(element, delay) {
    let before_color = element.style.backgroundColor
    element.style.backgroundColor = "lightcoral"
    setTimeout(() => {
        element.style.backgroundColor = before_color
    }, delay)
}

function valid(element, delay) {
    let before_color = element.style.backgroundColor
    element.style.backgroundColor = "lightgreen"
    setTimeout(() => {
        element.style.backgroundColor = before_color
    }, delay)
}

function set_info_room_name(room_name) {
    document.querySelector("#room_info_room_name").innerText = room_name
}

function set_info_room_users(users) {
    let room_users_e = document.querySelector("#right_bar_users")
    users.forEach((user) => {
        console.log(`adding div for ${user}`)
        let new_div = document.createElement("div")
        new_div.classList.add("room_user")
        let new_p = document.createElement("p")
        new_p.innerText = user
        new_div.appendChild(new_p)
        let indicator_div = document.createElement("div")
        indicator_div.classList.add("indicator")
        new_div.appendChild(indicator_div)
        room_users_e.appendChild(new_div)
    })
}

socket.on("room-settings-remove-room", (room_name) => {

}) 