function check_cookie() {
    if (!document.cookie === "authentication=true") {
        window.location.href="http://localhost:3000"
    }
    else {
        document.querySelector("#loader").remove()
        document.querySelector("#loader_div").style.backgroundColor = "rgba(255, 255, 255, 0)"

        setTimeout(() => {
            document.querySelector("#loader_div").remove()
        }, 250)
    }
}