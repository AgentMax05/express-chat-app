function add_onclick(element, func) {
    element.addEventListener("click", () => {
        func()
    })
}

elements = [
    ["#exit_room_menu", exit_room_menu],
    ["#add_user_button", add_room_user],
    ["#submit_room", submit_add_room],
    ["#room_settings_add_user_button", room_settings_add_user_submit],
    ["#room_settings_add_user_exit", room_settings_add_user_exit],
    ["#room_settings_remove_user_exit", room_settings_remove_user_exit],
    ["#room_settings_remove_user_submit", room_settings_remove_user_submit],
    ["#right_sidebar_button_container", toggle_right_sidebar],
    ["#add_room", create_room],
    ["#manage_users_add", settings_add_user],
    ["#manage_users_remove", settings_remove_user],
    ["#manage_leave_room", settings_leave_room],
    ["#manage_room_delete", settings_delete_room],
    ["#send_button", submit]
]

for (let i = 0; i < elements.length; i++) {
    add_onclick(document.querySelector(elements[i][0]), elements[i][1])
    console.log("passed: " + i.toString())
}