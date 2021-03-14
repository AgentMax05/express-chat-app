const username_input = document.querySelector("#username")
const password_input = document.querySelector("#password")
const password_check_input = document.querySelector("#password_check")

const socket = io("http://maxvek.com", {path: "/chat/socket.io"})

let home_url = "http://maxvek.com/chat"

username_input.addEventListener("keypress", function(key) {
    if (key.keyCode === 13) {
        submit()
    }
})

password_input.addEventListener("keypress", function(key) {
    if (key.keyCode === 13) {
        submit()
    }
})

password_check_input.addEventListener("keypress", function(key) {
    if (key.keyCode === 13) {
        submit()
    }
})

function submit() {
    username = username_input.value 
    password = password_input.value 
    password_check = password_check_input.value 
    if (username != "" && password != "" && password_check != "") {
        if (password === password_check) {
            socket.emit("signup-check", {username: username, password: password})
        }   
        else {
            invalid(password_input, 500)
            invalid(password_check_input, 500)
        } 
    }
    else {
        if (username === "") {
            invalid(username_input, 1000)
        }
        if (password === "") {
            invalid(password_input, 1000)
        }
        if (password_check === "") {
            invalid(password_check_input, 1000)
        }
    }
}

socket.on("signup-result", function(result) {
    if (result) {
        valid(username_input, 1500)
        valid(password_input, 1500)
        valid(password_check_input, 1500)
        setTimeout(() => {
           window.location.href = home_url
        }, 2000)
    }
    else {
        invalid(username_input, 500)
        setTimeout(() => {
            invalid(username_input, 500)
        }, 700)
    }
})

function invalid(element, delay) {
    element.style.backgroundColor = "lightcoral"
    setTimeout(() => {
        element.style.backgroundColor = "rgb(80, 80, 80)"
    }, delay)
}

function valid(element, delay) {
    element.style.backgroundColor = "lightgreen"
    setTimeout(() => {
        element.style.backgroundColor = "rgb(80, 80, 80)"
    }, delay)
}

function login_page() {
    window.location.href = home_url
}