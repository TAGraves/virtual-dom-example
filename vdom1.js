/* VIRTUAL DOM START */
function convertToDOM(element) {
    if (typeof element === 'string') {
        return document.createTextNode(element);
    }
}

function render(virtualTree, domContainer) {
    const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
}
/* VIRTUAL DOM END */

/* UI START */
const virtualTree = 'Hello Virtual World!';
/* UI END */

/* CONTROL START */
const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
    render(virtualTree, domContainer);
});
/* CONTROL END */
