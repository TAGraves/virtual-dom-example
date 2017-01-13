/** @jsx makeVirtualTree */

function makeVirtualTree(type, props, ...children) {
	return { type, props, children };
}

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

function updateProps(oldProps, newProps, domElement) {
    const oldPropNames = Object.keys(oldProps || {});
    const newPropNames = Object.keys(newProps || {});
    const mergedPropNames = Array.from(new Set(oldPropNames.concat(newPropNames)));
    mergedPropNames.forEach((propName) => {
        if (oldProps[propName] !== newProps[propName]) {
            domElement[propName] = newProps[propName];
        }
    });
}

let memoized = new Map();

function render(component, domContainer, initialState) {
    const virtualTree = component(initialState);
    const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
    memoized.set(domContainer, { virtualTree, component }).set('state', initialState);
}

function updateState(updateFn) {
    const newState = updateFn(memoized.get('state'));
    const newMemoized = new Map();
    memoized.forEach(({ virtualTree, component }, container) => {
        if (component) {
            const newVirtualTree = component(newState);
            update(virtualTree, newVirtualTree, domContainer);
            newMemoized.set(domContainer, {virtualTree: newVirtualTree, component });
        }
    });
    newMemoized.set('state', newState);
    memoized = newMemoized;
}

function update(oldVirtualTree, newVirtualTree, container, index = 0) {
    const oldDomElement = container.childNodes[index];
    if (!oldVirtualTree) {
        const newDomElement = convertToDOM(newVirtualTree);
        container.appendChild(newDomElement);
    } else if (!newVirtualTree) {
        container.removeChild(oldDomElement);
    } else if (typeIsDifferent(oldVirtualTree, newVirtualTree)) {
        const newDomElement = convertToDOM(newVirtualTree);
        container.replaceChild(newDomElement, oldDomElement);
    } else if (typeof newVirtualTree !== 'string') {
        updateProps(oldVirtualTree.props, newVirtualTree.props, oldDomElement);
    
        const oldChildren = oldVirtualTree.children || [];
        const newChildren = newVirtualTree.children || [];
        const childrenLength = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < childrenLength; i += 1) {
            update(oldChildren[i], newChildren[i], oldDomElement, i);
        }
    }
}

const initialState = {
    color: 'green',
    boldText: 'Never updated!',
    count: 0,
}

function handleUpdateClick() {
    updateState((state) => {
        const count = state.count + 1;
        return {
            color: state.color === 'green' ? 'black' : 'green',
            boldText: `Updated ${count} times!`,
            count
        };
    });
}

function component(state) {
	return (
	    <div className="virtual-div">
        	<b className={`text-${state.color}`}>
           		{state.boldText}
            </b>
            <div>
            	<button onclick={handleUpdateClick}>Updated</button>
            </div>
    	</div>
    );
}

const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
	render(component, domContainer, initialState);
});