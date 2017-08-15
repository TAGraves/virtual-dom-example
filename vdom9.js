/* VIRTUAL DOM START */
function convertToDOM(virtualElement) {
    if (typeof virtualElement === 'string') {
        return document.createTextNode(virtualElement);
    }

    const domElement = document.createElement(virtualElement.type);
    const virtualChildren = virtualElement.children || [];
    virtualChildren.forEach(virtualChild => {
        domElement.appendChild(convertToDOM(virtualChild));
    });

    Object.keys(virtualElement.props || {}).forEach(propName => {
        domElement[propName] = virtualElement.props[propName];
    });

    return domElement;
}

function typeIsDifferent(oldVirtualTree, newVirtualTree) {
    return (
        oldVirtualTree.type !== newVirtualTree.type ||
        (typeof oldVirtualTree === 'string' &&
            oldVirtualTree !== newVirtualTree)
    );
}

function updateProps(oldProps, newProps, domElement) {
    const oldPropNames = Object.keys(oldProps || {});
    const newPropNames = Object.keys(newProps || {});
    const mergedPropNames = Array.from(
        new Set(oldPropNames.concat(newPropNames)),
    );
    mergedPropNames.forEach(propName => {
        if (oldProps[propName] !== newProps[propName]) {
            domElement[propName] = newProps[propName];
        }
    });
}

function render(component, domContainer, initialState) {
    const virtualTree = component(initialState);
    const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
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
/* VIRTUAL DOM END */

/* DATA & UI START */
const initialState = {
    color: 'green',
    boldText: 'Never updated!',
    count: 0,
};

function handleUpdateClick() {
    updateState(state => {
        const count = state.count + 1;
        return {
            color: state.color === 'green' ? 'black' : 'green',
            boldText: `Updated ${count} times!`,
            count,
        };
    });
}

function component(state) {
    return {
        type: 'div',
        props: {
            className: `virtual-div`,
        },
        children: [
            {
                type: 'b',
                children: [state.boldText],
                props: { className: `text-${state.color}` },
            },
            {
                type: 'div',
                children: [
                    {
                        type: 'button',
                        children: ['Update'],
                        props: { onclick: handleUpdateClick },
                    },
                ],
            },
        ],
    };
}
/* DATA & UI END */

/* CONTROL START */
const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
    render(component, domContainer, initialState);
});
/* CONTROL END */
