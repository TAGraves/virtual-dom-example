/** @jsx makeVirtualTree */

/* VIRTUAL DOM START */
function makeVirtualTree(type, props, ...children) {
    if (typeof type === 'function') {
        const component = props => type(props);
        component.props = props || {};
        component.props.children = children;
        component.type = type.name;
        return component;
    }
    return { type, props, children };
}

function convertToDOM(virtualElement) {
    if (typeof virtualElement === 'string') {
        return document.createTextNode(virtualElement);
    } else if (typeof virtualElement === 'function') {
        return convertToDOM(virtualElement(virtualElement.props));
    }

    const domElement = document.createElement(virtualElement.type);
    const virtualChildren = virtualElement.children || [];
    virtualChildren.forEach(virtualChild => {
        if (Array.isArray(virtualChild)) {
            virtualChild.forEach(child => domElement.appendChild(convertToDOM(child)));
        } else {
            domElement.appendChild(convertToDOM(virtualChild));
        }
    });
    
    Object.keys(virtualElement.props || {}).forEach(propName => {
        if (propName !== 'children') {
            domElement[propName] = virtualElement.props[propName];
        }
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

let memoized = new Map();

function render(component, domContainer, initialState) {
    const virtualTree = component(initialState);
    const domElement = convertToDOM(virtualTree);
    domContainer.innerHTML = '';
    domContainer.appendChild(domElement);
    memoized
        .set(domContainer, { virtualTree, component })
        .set('state', initialState);
}

function updateState(updateFn) {
    const newState = updateFn(memoized.get('state'));
    const newMemoized = new Map();
    memoized.forEach(({ virtualTree, component }, container) => {
        if (component) {
            const newVirtualTree = component(newState);
            update(virtualTree, newVirtualTree, domContainer);
            newMemoized.set(domContainer, {
                virtualTree: newVirtualTree,
                component,
            });
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
    } else if (typeof newVirtualTree === 'function') {
        const tree = newVirtualTree(newVirtualTree.props);
        update(oldVirtualTree, tree, container, index);
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
    isBold: true,
};

function handleUpdateClick() {
    updateState(state => {
        const count = state.count + 1;
        return {
            color: state.color === 'green' ? 'black' : 'green',
            boldText: `Updated ${count} times!`,
            count,
            isBold: false,
        };
    });
}

function Component(props) {
    const isBold = props.isBold ? 'bold' : '';
    return (
        <div>
            {props.text}
            <div className={isBold}>
                {props.children}
            </div>
        </div>
    );
}

function Application(state) {
    return (
        <div className="virtual-div">
            <b className={`text-${state.color}`}>
                {state.boldText}
            </b>
            <div>
                <button onclick={handleUpdateClick}>Update</button>
            </div>
            <Component text={state.boldText} isBold={state.isBold}>
                <span>Hey!</span>
                <span>Yo!</span>
            </Component>
        </div>
    );
}
/* DATA & UI END */

/* CONTROL START */
const domContainer = document.getElementById('container');

document.getElementById('run').addEventListener('click', () => {
    render(Application, domContainer, initialState);
});
/* CONTROL END */
