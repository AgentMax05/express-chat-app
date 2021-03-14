function add_onclick(element, func) {
    element.addEventListener("click", () => {func()})
}

elements = [
    ["#submit_button", submit],
    ["#container p", signup_page]
]

for (let i = 0; i < elements.length; i++) {
    add_onclick(document.querySelector(elements[i][0]), elements[i][1])
}