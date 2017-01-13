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
    
    Object.keys(virtualElement.props || {}).forEach((propName) => {
        domElement[propName] = virtualElement.props[propName];
    });
    
    return domElement;
}

function typeIsDifferent(oldVirtualTree, newVirtualTree) {
    return (
    	oldVirtualTree.type !== newVirtualTree.type
        || (typeof oldVirtualTree === 'string' && oldVirtualTree !== newVirtualTree)
    );
}

function render(virtualTree, domContainer) {
	const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
}

function update(oldVirtualTree, newVirtualTree, container) {
    const oldDomElement = container.childNodes[0];
    if (!oldVirtualTree) {
        const newDomElement = convertToDOM(newVirtualTree);
        container.appendChild(newDomElement);
    } else if (!newVirtualTree) {
        container.removeChild(oldDomElement);
    } else if (typeIsDifferent(oldVirtualTree, newVirtualTree)) {
        const newDomElement = convertToDOM(newVirtualTree);
        container.replaceChild(newDomElement, oldDomElement);
    }
}
/* VIRTUAL DOM END */

/* UI START */
const virtualTree = {
	type: 'div',
    props: { className: 'virtual-div' },
    children: [
    	{
    		type: 'b',
            children: ['Hello Virtual World!']
    	}
    ]
};

const updatedVirtualTree = {
	type: 'section',
    props: { className: 'virtual-div' },
    children: [
    	{
    		type: 'span',
            children: ['Hello Virtually Updated World!']
    	}
    ]
}
/* UI END */

/* CONTROL START */
const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
	render(virtualTree, domContainer);
});

document.getElementById('update').addEventListener('click', () => {
	update(virtualTree, updatedVirtualTree, container);
});
/* CONTROL END */