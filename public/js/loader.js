const loader1 = document.querySelector("#loader")
const loader2 = document.querySelector("#loader2")
const loader3 = document.querySelector("#loader3")
regular_animations()

function regular_animations() {
    if (loader_removed) {return}
    loader1.className = "regular_animation1"
    loader2.className = "regular_animation2"
    loader3.className = "regular_animation3"

    loader1.style.animation = "none"
    loader2.style.animation = "none"
    loader3.style.animation = "none"

    loader1.offsetWidth
    loader2.offsetWidth
    loader3.offsetWidth

    loader1.style.animation = null
    loader2.style.animation = null
    loader3.style.animation = null

    setTimeout(alternate_animations, 3000)
}

function alternate_animations() {
    if (loader_removed) {return}
    loader1.className = "alternate_animation"
    loader2.className = "alternate_animation"
    loader3.className = "alternate_animation"

    loader1.style.animation = "none"
    loader2.style.animation = "none"
    loader3.style.animation = "none"

    loader1.offsetWidth
    loader2.offsetWidth
    loader3.offsetWidth

    loader1.style.animation = null
    loader2.style.animation = null
    loader3.style.animation = null

    setTimeout(regular_animations, 3000)
}