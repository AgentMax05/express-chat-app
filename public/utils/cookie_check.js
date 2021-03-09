let finished_loading = false
let finished_loading_messages = false

function check_cookie() {
    if (!document.cookie === "authentication=true") {
        window.location.href="http://localhost:3000"
    }
    else {
        if (finished_loading_messages) {
            finished_loading = true
            remove_loading()
        }
        else {
            finished_loading = true
        }
    }
}