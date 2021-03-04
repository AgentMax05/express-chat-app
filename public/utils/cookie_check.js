function check_cookie() {
    if (!document.cookie === "authentication=true") {
        window.location.href="http://localhost:3000"
    }
}