function remove_loading() {
    loader_removed = true
    if (document.querySelector("#loader_div")) {
        document.querySelector("#loader").remove()
        document.querySelector("#loader2").remove()
        document.querySelector("#loader3").remove()
        document.querySelector("#loader_div").style.backgroundColor = "rgba(255, 255, 255, 0)"
    
        setTimeout(() => {
            document.querySelector("#loader_div").remove()
        }, 250)
    }
}