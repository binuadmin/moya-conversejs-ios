
DOMNamedNodeMap.prototype[Symbol.iterator] = function* (){
    let attrs = [];
    if(this.parentNode){
        if(this.parentNode.id){
            let newAttr = document.createAttribute('id');
            newAttr.value = this.parentNode.id;
            attrs.push(newAttr);
        }
        if (this.parentNode.namespaceURI){
            let newAttr = document.createAttribute('xmlns');
            newAttr.value = this.parentNode.namespaceUri;
            attrs.push(newAttr);
        }
    }
    attrs = attrs.concat(this._nodes);
    for (let attr of attrs) {
        yield attr;
    }

}
DOMElement.prototype.querySelectorAll = function (selector) {
    const results = [];

        // Helper function to test if an element matches the selector
        const matchesSelector = (element, selector) => {
            if(element instanceof DOMText) return false
            // Split the selector into tag and attributes parts
            const [tagPart, attrPart] = selector.split(/\[(.+)\]/);
            if (tagPart && element.tagName.toLowerCase() !== tagPart.toLowerCase()) {
                return false;
            }
            if (attrPart) {
                const [attrName, attrValue] = attrPart.split('=');
                const actualValue = element.getAttribute(attrName);
                // Check if attribute value matches (considering cases with and without quotes)
                if (!actualValue || actualValue !== attrValue.replace(/['"]/g, '')) {
                    return false;
                }
            }
            return true;
        };

        // Recursive function to search through the children
        const searchChildren = (element) => {

            if (matchesSelector(element, selector)) {
                results.push(element);
            }
            element.childNodes._nodes.forEach(child => searchChildren(child));
        };

        // Start the search with this element
        searchChildren(this);

        return results;

};


DOMElement.prototype.querySelector = function (selector) {
    var result;

        // Helper function to test if an element matches the selector
        const matchesSelector = (element, selector) => {
            if(element instanceof DOMText) return false
            // Split the selector into tag and attributes parts
            const [tagPart, attrPart] = selector.split(/\[(.+)\]/);
            if (tagPart && element.tagName.toLowerCase() !== tagPart.toLowerCase()) {
                return false;
            }
            if (attrPart) {
                const [attrName, attrValue] = attrPart.split('=');
                const actualValue = element.getAttribute(attrName);
                // Check if attribute value matches (considering cases with and without quotes)
                if (!actualValue || actualValue !== attrValue.replace(/['"]/g, '')) {
                    return false;
                }
            }
            return true;
        };

        // Recursive function to search through the children
        const searchChildren = (element) => {

            if (matchesSelector(element, selector)) {
                return element;
            }
            return element.childNodes._nodes.find(child => searchChildren(child));
        };

        // Start the search with this element
        result = searchChildren(this);

        return result || null;

};

Object.defineProperty(DOMElement.prototype, 'innerHTML', {
    get: function() {

        return this.childNodes._nodes.map(child => child.outerHTML).join('');
    }
    
});

Object.defineProperty(DOMText.prototype, 'outerHTML', {
    get: function() {
        return this.data;
    }
});

Object.defineProperty(DOMElement.prototype, 'innerText', {
    get: function() {
        return this.firstChild instanceof DOMText ? this.firstChild.data + "" : '';
    },
    set : function(text){
        let textNode = document.createTextNode(text);
        this.appendChild(textNode);
    }
});
Object.defineProperty(DOMElement.prototype, 'textContent', {
    get: function() {
        return this.firstChild instanceof DOMText ? this.firstChild.data + "" : '';
    }
});

Object.defineProperty(DOMText.prototype, 'nodeValue', {
    get: function() {
        return this._nodeValue + "";
    },
    set: function(value) {
        this._nodeValue = value;
    }
});


Object.defineProperty(DOMElement.prototype, 'outerHTML', {
    get: function() {

        let attrs = (this.attributes._nodes)
        .map((node) => `${node.name}="${node.value}"`)
        .join(' ');
        if(this.namespaceURI && this.getAttribute('xmlns')){
            attrs += ` xmlns="${this.namespaceURI}"`;
        }
    
    return `<${this.tagName} ${attrs}>${this.innerHTML}</${this.tagName}>`;
    }
});


Object.defineProperty(DOMElement.prototype, 'children', {
    get: function() {
        return this.childNodes._nodes.filter(node=>node.nodeType === 1);
    }
});



let oldSetNamedItem = DOMNamedNodeMap.prototype.setNamedItem;
let oldRemoveNamedItem = DOMNamedNodeMap.prototype.removeNamedItem;

DOMNamedNodeMap.prototype.setNamedItem = function (name, value) {

    //if exists
    if(this.item(name)){

        oldSetNamedItem.call(this, name, value);
    }
    //if not exists
    else{
        oldSetNamedItem.call(this, name, value);
    }
    
    Object.defineProperty(this, name, {
        value: this.item(name) + '',
        writable: true,
        enumerable: false,
        configurable: true
    });
    this.properlySetArray();
}


DOMNamedNodeMap.prototype.properlySetArray = function () {
    if(!this._indexes){
        Object.defineProperty(this, '_indexes', {
            value: [],
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    this._indexes.forEach((index=>{
        delete this[index];
    })) 
    this._indexes = [];
    let array = this._nodes;
    array.forEach((node,index)=>{
        this._indexes.push(index);
        this[index]=node;
    });
}

let oldGetAttr = DOMElement.prototype.getAttribute;
DOMElement.prototype.getAttribute = function (name) {
    let val = oldGetAttr.call(this, name);
    if(!val && name==='xmlns') {
        val = this.getNamespaceURI();
    }
    return val + '';

}

DOMNamedNodeMap.prototype.removeNamedItem= function (name) {
   
    oldRemoveNamedItem.call(this, name);
    delete this[name];
    this.properlySetArray();
}

DOMNodeList.prototype.setIndexes = function () {
    if(!this._indexes){
        Object.defineProperty(this, '_indexes', {
            value: [],
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    this._indexes.forEach((index=>{
        delete this[index];
    })) 
    this._indexes = [];
    let array = this._nodes;
    array.forEach((node,index)=>{
        this._indexes.push(index);
        this[index]=node;
    });
};
['_appendChild',
'_cloneNodes',
'_insertBefore',
'_removeChild',
'_replaceChild'].forEach(func=>{
    let oldFunc = DOMNodeList.prototype[func];
    DOMNodeList.prototype[func] = function (node) {
        oldFunc.call(this, node);
        this.setIndexes();
    }

})

DOMDocument.prototype.createTreeWalker = function() {
    return {};
  }

DOMDocument.prototype.addEventListener= function (...args){
    // console.log("added empty event listener",args);
}
DOMDocument.prototype.removeEventListener= function (...args){
    // console.log("removed empty event listener",args);
}

function makeIterable(obj, arrayName = '_nodes'){
    obj.prototype.map = function (callback) {
        return this[arrayName].map(callback);
    }
    obj.prototype.forEach = function (callback) {
        return this[arrayName].forEach(callback);
    }
    obj.prototype.filter = function (callback) {
        return this[arrayName].filter(callback);
    }

}

makeIterable(DOMNodeList);

if (self['auto_init_mock']) {
    self.Element = DOMElement;
    self.HTMLElement = DOMElement;
    self.Node = DOMNode;
    self.HTMLDocument = DOMDocument;
}
export const Elements = [self.Element, self.HTMLElement, self.Node, self.HTMLDocument];