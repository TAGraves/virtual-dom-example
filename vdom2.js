/* VIRTUAL DOM START */
function convertToDOM(virtualElement) {
    if (typeof virtualElement === 'string') {
        return document.createTextNode(virtualElement);
    }
    
	const domElement = document.createElement(virtualElement.type);
    const virtualChildren = virtualElement.children || [];
    virtualChildren.forEach((virtualChild) => {
        domElement.appendChild(convertToDOM(virtualChild));
    });
    return domElement;
}

function render(virtualTree, domContainer) {
	const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
}
/* VIRTUAL DOM END */

/* UI START */
const virtualTree = {
	type: 'div',
    children: [
    	{
    		type: 'b',
            children: ['Hello Virtual World!']
    	}
    ]
};
/* UI END */

/* CONTROL START */
const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
	render(virtualTree, domContainer);
});
/* CONTROL END */