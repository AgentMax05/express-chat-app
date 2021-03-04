const username_input = document.querySelector("#username")
const password_input = document.querySelector("#password")

const socket = io()

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

function submit() {
    let username = username_input.value 
    let password = password_input.value  
    if (username != "" && password != "") {
        socket.emit("login-check", {username: username, password: password})
    }
    else {
        if (username === "") {
            invalid(username_input, 1000)
        }
        if (password === "") {
            invalid(password_input, 1000)
        }
    }
}

function invalid(element, delay) {
    element.style.backgroundColor = "lightcoral"
    setTimeout(() => {
        element.style.backgroundColor = "rgb(80, 80, 80)"
    }, delay)
}

socket.on("login-result", function(result) {
    if (result.result) {
        add_cookie("authentication", "true", 30)
        window.location.href = `http://localhost:3000/chat.html?user=${result.username}`
        console.log("correct login")
    }
    else {
        invalid(username_input, 3000)
        invalid(password_input, 3000)
    }
})

function add_cookie(name, value, seconds) {
    let date = new Date()
    date.setTime(date.getTime() + (seconds*1000))
    expires = "; expires=" + date.toUTCString()
    document.cookie = `${name}=${value}; ${expires}; path=/`
}

function signup_page() {
    window.location.href = "http://localhost:3000/sign-up.html"
}