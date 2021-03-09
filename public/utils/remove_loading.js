function remove_loading() {
    document.querySelector("#loader").remove()
    document.querySelector("#loader2").remove()
    document.querySelector("#loader_div").style.backgroundColor = "rgba(255, 255, 255, 0)"

    setTimeout(() => {
        document.querySelector("#loader_div").remove()
    }, 250)
}