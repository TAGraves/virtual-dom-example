function virtualize(element) {
    if (typeof element === 'string') {
        return document.createTextNode(element);
    }
    const domElement = document.createElement(element.type);
    element.children.forEach((child) => {
        domElement.appendChild(virtualize(child));
    });
    Object.keys(element.props || {}).forEach(propName => {
        domElement[propName] = element.props[propName];
    });
    return domElement;
}

function render(virtualElement, container) {
    container.appendChild(virtualElement);
}

const ele = virtualize({
    type: 'div',
    props: {
        className: 'someDiv',
        name: 'someName',
        'data-div-id': 'someData'
    },
    children: [
        { type: 'span', children: ['hey'] },
        { type: 'p', children: [
            { type: 'span', children: ['yo'] }
        ]},
        'ayeee'
    ]
});

render(ele, document.body);