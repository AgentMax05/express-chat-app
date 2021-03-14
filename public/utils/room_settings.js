const room_settings_menu_container = document.querySelector("#room_settings_container")
const add_user_container = document.querySelector("#room_settings_add_user_container")
const remove_user_container = document.querySelector("#room_settings_remove_user_container")

let users_to_remove = []

// add user functions

function settings_add_user() {
    room_settings_menu_container.style.display = "block"
    add_user_container.style.display = "grid"
}

function room_settings_add_user_exit() {
    room_settings_menu_container.style.display = "none"
    add_user_container.style.display = "none"
}

function room_settings_add_user_submit() {
    let username_input = document.querySelector("#room_settings_add_user_input")
    let username = username_input.value 
    if (username === "") {
        invalid(username_input, 500)
        return
    }
    socket.emit("add_user_to_room", {user: username, room: current_room})
}

//remove user functions

socket.on("room-settings-user-response", (users) => {
    let user_list = document.querySelector("#room_settings_remove_user_list")
    for (let i = 0; i < users.length; i++) {
        new_div_container = document.createElement("div")
        new_div_container.classList.add("room_settings_remove_user_item_wrapper")
        new_p = document.createElement("p")
        new_p.classList.add("room_settings_remove_user_item")
        new_p.innerText = users[i]
        new_button = document.createElement("button")
        new_button.innerText = "Remove"

        new_button.addEventListener("click", (evt) => {
            room_settings_remove_user(users[i], evt.target.parentElement)
        })

        new_div_container.appendChild(new_p)
        new_div_container.appendChild(new_button)
        user_list.appendChild(new_div_container)
    }
    
})

function settings_remove_user() {
    users_to_remove = []
    remove_children(remove_user_container.querySelector("#room_settings_remove_user_list"))
    room_settings_menu_container.style.display = "block"
    remove_user_container.style.display = "grid"
    socket.emit("room-settings-user-request", current_room.room_id)
}

function room_settings_remove_user(username, div) {
    // console.log(div)
    if (div.style.backgroundColor != "rgb(200, 60, 60)") {
        users_to_remove.push(username)
        div.style.backgroundColor = "rgb(200, 60, 60)"
    }
    else {
        div.style.backgroundColor = "rgb(80, 80, 80)"
        users_to_remove.splice(users_to_remove.indexOf(username), 1)
    }
    // console.log(users_to_remove)
}

function room_settings_remove_user_exit() {
    room_settings_menu_container.style.display = "none"
    remove_user_container.style.display = "none"
}

function room_settings_remove_user_submit() {
    socket.emit("room-settings-remove-users", {users_to_remove: users_to_remove, room_name: current_room.room_name, room_id: current_room.room_id})
}

socket.on("room-settings-remove-room-user", (username) => {
    let users_container = document.querySelector("#right_bar_users")
    let users_list = Array.from(users_container.querySelectorAll(".room_user"))
    for (let i = 0; i < users_list.length; i++) {
        if (users_list[i].innerText === username) {
            users_container.removeChild(users_list[i])
            return
        }
    }
})

// toggle right sidebar when button is clicked

function toggle_right_sidebar() {
    let right_sidebar = document.querySelector("#right_sidebar")
    let main_container = document.querySelector("#container")
    let top_bar = document.querySelector("#room_info")
    let other_messages = document.querySelectorAll(".message_container_other")

    //let current_display = getComputedStyle(right_sidebar).display
    let current_display = getComputedStyle(right_sidebar).width
    if (current_display === "0px") {
        right_sidebar.style.display = "block"
        right_sidebar.style.width = "200px"
        main_container.style.gridTemplateColumns = "200px calc(100vw - 530px) 130px 200px"
        top_bar.style.width = "calc(100vw - 400px)"
        for (let i = 0; i < other_messages.length; i++) {
            other_messages[i].style.maxWidth = "calc((75 / 100) * (100vw - 400px))"
        }
    }
    else {
        //right_sidebar.style.display = "none"
        right_sidebar.style.width = "0px"
        main_container.style.gridTemplateColumns = "200px calc(100vw - 330px) 130px 0px"
        top_bar.style.width = "calc(100vw - 200px)"
        for (let i = 0; i < other_messages.length; i++) {
            other_messages[i].style.maxWidth = "calc((75 / 100) * (100vw - 200px))"
        }
    }
}

// leave room function:

function settings_leave_room() {
    if (current_room !== "general") {
        socket.emit("room-settings-remove-users", {users_to_remove: [user], room_name: current_room.room_name, room_id: current_room.room_id})
    }
}

// delete room function:

function settings_delete_room() {
    if (current_room.room_id !== general_id) {
        socket.emit("room-settings-delete-room", current_room)
    }
}

// miscellaneous functions

function invalid(element, delay) {
    let previous_color = element.style.backgroundColor
    element.style.backgroundColor = "lightcoral"
    setTimeout(() => {
        element.style.backgroundColor = previous_color
    }, delay)
}

function remove_children(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}
