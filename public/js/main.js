let old_date = new Date("January 1, 1975 0:0:0");
document.cookie = "authentication=; expires=" + old_date.toUTCString()

const submit_button = document.querySelector("#send_button")
const input_field = document.querySelector("#input")
let menu_container = document.querySelector("#menu_container")
let menu = document.querySelector("#create-room-menu")
let menu_children = Array.from(menu.children)

const socket = io()

let general_id;
let self_id;
let current_room = {room_name: "general"}

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
        outputOtherMessage(data.message, data.user_from)
    }
})

socket.on("message-answer", function(messages) {
    messages.forEach((message) => {
        if (message === "$${{||}}$$") {
            if (finished_loading) {
                finished_loading_messages = true
                remove_loading()
            }
            else {
                finished_loading_messages = true
            }
            return
        }
        if (message.from === user) {
        outputSelfMessage(message.message)
        }
        else {
            outputOtherMessage(message.message, message.from)
        }
    })
    
})

socket.on("redirect_command", function(url) {
    window.location.href = url
})

socket.on("login-confirmation", function(returned_user) {
    general_id = returned_user.general_id
    current_room.room_id = general_id
    console.log(`current_room is: ${JSON.stringify(current_room)}`)

    socket.emit("message-request", {room_id: current_room.room_id})

    returned_user.rooms.forEach((room_data) => {
        add_room(room_data.room_name, room_data.room_id)
    })

    set_logged_in_as(user)
})

socket.on("add_room", function(room_data) {
    add_room(room_data.room_name, room_data.room_id)
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
    
    if (msg.length > 200) {
        input_field.value = ""
        invalid(input_field, 500)
    }

    else if (msg != "") {
        input_field.value = ""
        socket.emit("chat-message", {id: self_id, message: msg, room_id: current_room.room_id})
    }
}

function outputSelfMessage(message) {
    let display = document.querySelector("#chat_display")
    let new_div2 = document.createElement("div")

    let message_class = "message_container_self"

    let last_child = display.lastElementChild

    if (last_child !== null) {
        let message_container = last_child.querySelector(".message_container_self")
        let message_container_repeat = last_child.querySelector(".message_container_self_repeat")
        
        if (message_container !== null) {
            message_container.style.marginBottom = "2px"
            message_class = "message_container_self_repeat"
        }
        else if (message_container_repeat !== null) {
            message_container_repeat.style.marginBottom = "2px"
            message_container_repeat.style.borderRadius = "2px 10px 10px 2px"
            message_class = "message_container_self_repeat"
        }

    }

    new_div2.classList.add("message")
    new_div3 = document.createElement("div")
    new_div3.classList.add(message_class)
    new_div3.innerHTML = `<p>${message}</p>`
    new_div2.appendChild(new_div3)
    display.appendChild(new_div2)
    display.scrollTop = display.scrollHeight
}

function outputOtherMessage(message, user_from) {
    let display = document.querySelector("#chat_display")
    let new_div2 = document.createElement("div")
    let message_grid = document.createElement("div")
    
    let message_class = "message_container_other"
    let grid_class = "message_grid"
    let add_from = true
    
    let last_message = display.lastElementChild
    if (last_message !== null) {
        if (last_message.querySelector(".message_container_self") === null && last_message.querySelector(".message_container_self_repeat") === null) {
            if (last_message.querySelector(".from_div").innerText === user_from) {
                let last_message_grid = last_message.querySelector(".message_grid")
                let last_message_repeating_grid = last_message.querySelector(".message_grid_repeat")
                let last_message_container = last_message.querySelector(".message_container_other")
                let last_message_container_repeat = last_message.querySelector(".message_container_other_repeat")

                if (last_message_grid !== null) {
                    last_message_grid.style.marginBottom = "2px"
                }
                else {
                    last_message_repeating_grid.style.marginBottom = "2px"
                    last_message_container_repeat.style.borderRadius = "10px 2px 2px 10px"
                }

                message_class = "message_container_other_repeat"
                grid_class = "message_grid_repeat"
                add_from = false
            }
        }
    }
    
    
    message_grid.classList.add(grid_class)
    
    new_div2.classList.add("message")
    
    new_div3 = document.createElement("div")
    new_div3.classList.add(message_class)
    new_div3.innerHTML = `<p>${message}</p>`
    
    let from_div = document.createElement("div")
    from_div.classList.add("from_div")
    from_div.innerText = user_from
    
    if (!add_from) {
        from_div.style.display = "none"
    }
    
    message_grid.appendChild(from_div)

    message_grid.appendChild(new_div3)
    new_div2.appendChild(message_grid)
    // new_div2.appendChild(from_div)
    // new_div2.appendChild(new_div3)

    display.appendChild(new_div2)

    display.scrollTop = display.scrollHeight
}

let sidebar = document.querySelector("#sidebar")

function enter_room(event_obj) {

    let switched = null
    if (!event_obj.target.classList.contains("chat_item")) {
        switched = event_obj.target.parentElement
    }

    let room_name;
    let room_id;

    if (!switched) {
        room_name = event_obj.target.innerText
        room_id = event_obj.target.getAttribute("room_id")
    }
    if (switched) {
        room_name = switched.innerText
        room_id = switched.getAttribute("room_id")
    }
    console.log(`room_id: ${room_id}`)
    if (room_id !== current_room.room_id) {
        // console.log(`switching rooms to ${room_name}_`)
        clear_messages()
        clear_all_online()
        socket.emit("change-room", {current_room: current_room, new_room: {room_name: room_name, room_id: room_id}, deleting_room: false})
        current_room = {room_name: room_name, room_id: room_id}
        console.log(`current_room: ${JSON.stringify(current_room)}`)
    }
}

function enter_room_name(room_name, deleting_room = false) {
    if (room_name !== current_room) {
        clear_messages()
        clear_all_online()
        socket.emit("change-room", {current_room: current_room, new_room: room_name, deleting_room: deleting_room})
        current_room = room_name
    }
}

function clear_messages() {
    let display = document.querySelector("#chat_display")
    while (display.firstChild) {
        display.removeChild(display.firstChild)
    }
}

function add_room(name, room_id) {
    // sidebar.style.gridTemplateRows = `${window.getComputedStyle(sidebar).gridTemplateRows} 100px`
    let new_div = document.createElement("div")
    new_div.className = "chat_item"
    new_div.setAttribute("room_id", room_id)
    let new_text = document.createElement("p")
    new_text.innerHTML = name
    new_text.style.userSelect = "none"
    new_div.appendChild(new_text)
    // new_div.style.gridRow = current_row
    new_div.addEventListener("click", enter_room)
    // current_row = current_row + 1
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

    console.log(`removing user ${username}`)

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
    let sidebar = document.querySelector("#sidebar")
    let rooms = Array.from(sidebar.querySelectorAll(".chat_item"))

    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].innerText === room_name) {
            sidebar.removeChild(rooms[i])
            enter_room_name("general", true)
            return
        }
    }
}) 