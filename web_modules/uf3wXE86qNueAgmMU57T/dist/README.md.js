const modules = ['api-viewer-element/lib/api-docs','lit-html'];
function require(library) {
  const idx = modules.findIndex(
    (it) =>
      it === library ||
      it.replace(/^((@[^/]*\/)?[^/@]*)(@[^/]*)?(\/[^@]*)?$/, '$1$4') ===
        library // removes version pinned, if any
  );
  if (idx === -1) {
    console.error(`Import ${library} not found in project scope: ${modules}`);
  } else {
    return Promise.resolve().then(function () { return apiDocs_litHtml; }).then((module) => module['packd_export_'+idx]);
  }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function typeOf(obj) {
    const type = Object.prototype.toString.call(obj).slice(8, -1);
    if (type === "Object") {
        if (typeof obj[Symbol.iterator] === "function") {
            return "Iterable";
        }
        if (String(obj.$$typeof) === "Symbol(react.element)") {
            return "React";
        }
        if (obj.$flags$ !== undefined) {
            return "Stencil";
        }
        if (obj.constructor === undefined) {
            return "Preact";
        }
        if ("nodeName" in obj && "children" in obj) {
            return "Omi";
        }
        if ("css" in obj &&
            "template" in obj &&
            "exports" in obj &&
            "name" in obj) {
            return "Riot";
        }
        if ("Component" in obj && typeOf(obj.Component) === "Riot") {
            return "RiotStory";
        }
        if ("Component" in obj && typeOf(obj.Component) === "Svelte") {
            return "SvelteStory";
        }
        if ("components" in obj && ("template" in obj || "render" in obj)) {
            return "Vue";
        }
        return obj.constructor.name;
    }
    else if (type === "Array") {
        let hasOmi = false;
        for (const x of obj) {
            if (x === null ||
                typeof x === "boolean" ||
                typeof x === "string" ||
                typeof x === "number") ;
            else if (typeOf(x) === "Omi")
                hasOmi = true;
            else {
                hasOmi = false;
                break;
            }
        }
        if (hasOmi)
            return "Omi";
    }
    else if (type === "Function") {
        const fnStr = obj.toString();
        if (fnStr.includes("extends SvelteComponent")) {
            return "Svelte";
        }
        if (fnStr.includes("_tmpl$.cloneNode(true)") ||
            fnStr.includes("_$createComponent(")) {
            return "Solid";
        }
    }
    else if (obj instanceof Element && obj.nodeType === 1) {
        return "Element";
    }
    return type;
}

async function render(require, storyResult, storyType, div) {
    switch (storyType) {
        case "TemplateResult": {
            // lit-html
            (await require("lit-html")).render(storyResult, div);
            return true;
        }
        case "Hole": {
            // uhtml
            (await require("uhtml")).render(div, storyResult);
            return true;
        }
        case "LighterHole": {
            // lighterhtml
            (await require("lighterhtml")).render(div, storyResult);
            return true;
        }
        case "Stencil": {
            const stencilClient = await require("@stencil/core/internal/client");
            if ("BUILD" in stencilClient) {
                // 1.9
                stencilClient.renderVdom(
                // no idea what to put there
                {
                    // $ancestorComponent$: undefined,
                    // $flags$: 0,
                    // $modeName$: undefined,
                    $hostElement$: div,
                    $cmpMeta$: {},
                }, storyResult);
            }
            else {
                // 1.8
                stencilClient.renderVdom(div, 
                // no idea what to put there
                {
                // $ancestorComponent$: undefined,
                // $flags$: 0,
                // $modeName$: undefined,
                // $hostElement$: div,
                }, {
                // $flags$: 0,
                // $tagName$: 'div',
                }, storyResult);
            }
            return true;
        }
        case "React": {
            (await require("react-dom")).render(storyResult, div);
            return true;
        }
        case "Preact": {
            (await require("preact")).render(storyResult, div);
            return true;
        }
        case "Omi": {
            (await require("omi")).render(storyResult, div);
            return true;
        }
        case "Riot": {
            const createComp = (await require("riot")).component(storyResult);
            createComp(document.getElementById("root"), {});
            return true;
        }
        case "RiotStory": {
            const { Component, props, options } = storyResult;
            const createComp = (await require("riot")).component(Component);
            createComp(document.getElementById("root"), props, options);
            return true;
        }
        case "Solid": {
            (await require("solid-js/dom")).render(storyResult, div);
            return true;
        }
        case "Svelte": {
            new storyResult({ target: div });
            return true;
        }
        case "SvelteStory": {
            const { Component, ...rest } = storyResult;
            new Component({ target: div, ...rest });
        }
        case "Vue": {
            const Vue = await require("vue");
            Vue.createApp(storyResult).mount(div);
            return true;
        }
        case "Element":
        case "DocumentFragment": {
            div.appendChild(storyResult);
            return true;
        }
    }
    return false;
}

function renderWith(require, storyResult, div) {
    return __awaiter(this, void 0, void 0, function* () {
        const storyType = typeOf(storyResult);
        const rendered = yield render(require, storyResult, storyType, div);
        if (!rendered) {
            switch (storyType) {
                case 'String': {
                    const trimmed = storyResult.trim();
                    if (trimmed.match(/^<[^>]*>[\s\S]*<\/[^>]*>$/g)) {
                        // starts and ends with html tag
                        div.innerHTML = trimmed;
                        break;
                    }
                }
                default: {
                    const jsonEl = document.createElement('json-element');
                    jsonEl.value = storyResult;
                    jsonEl.open = 'full';
                    div.insertAdjacentElement('beforeend', jsonEl);
                    break;
                }
            }
        }
    });
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __decorate(decorators,target,key,desc){var c=arguments.length,r=c<3?target:desc===null?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if(typeof Reflect==="object"&&typeof Reflect.decorate==="function")r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)if(d=decorators[i])r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r;return c>3&&r&&Object.defineProperty(target,key,r),r
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */}const isCEPolyfill=typeof window!=="undefined"&&window.customElements!=null&&window.customElements.polyfillWrapFlushCallback!==undefined;const reparentNodes=(container,start,end=null,before=null)=>{while(start!==end){const n=start.nextSibling;container.insertBefore(start,before);start=n;}};const removeNodes=(container,start,end=null)=>{while(start!==end){const n=start.nextSibling;container.removeChild(start);start=n;}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const marker=`{{lit-${String(Math.random()).slice(2)}}}`;const nodeMarker=`\x3c!--${marker}--\x3e`;const markerRegex=new RegExp(`${marker}|${nodeMarker}`);const boundAttributeSuffix="$lit$";class Template{constructor(result,element){this.parts=[];this.element=element;const nodesToRemove=[];const stack=[];const walker=document.createTreeWalker(element.content,133,null,false);let lastPartIndex=0;let index=-1;let partIndex=0;const{strings:strings,values:{length:length}}=result;while(partIndex<length){const node=walker.nextNode();if(node===null){walker.currentNode=stack.pop();continue}index++;if(node.nodeType===1){if(node.hasAttributes()){const attributes=node.attributes;const{length:length}=attributes;let count=0;for(let i=0;i<length;i++){if(endsWith(attributes[i].name,boundAttributeSuffix)){count++;}}while(count-- >0){const stringForPart=strings[partIndex];const name=lastAttributeNameRegex.exec(stringForPart)[2];const attributeLookupName=name.toLowerCase()+boundAttributeSuffix;const attributeValue=node.getAttribute(attributeLookupName);node.removeAttribute(attributeLookupName);const statics=attributeValue.split(markerRegex);this.parts.push({type:"attribute",index:index,name:name,strings:statics});partIndex+=statics.length-1;}}if(node.tagName==="TEMPLATE"){stack.push(node);walker.currentNode=node.content;}}else if(node.nodeType===3){const data=node.data;if(data.indexOf(marker)>=0){const parent=node.parentNode;const strings=data.split(markerRegex);const lastIndex=strings.length-1;for(let i=0;i<lastIndex;i++){let insert;let s=strings[i];if(s===""){insert=createMarker();}else {const match=lastAttributeNameRegex.exec(s);if(match!==null&&endsWith(match[2],boundAttributeSuffix)){s=s.slice(0,match.index)+match[1]+match[2].slice(0,-boundAttributeSuffix.length)+match[3];}insert=document.createTextNode(s);}parent.insertBefore(insert,node);this.parts.push({type:"node",index:++index});}if(strings[lastIndex]===""){parent.insertBefore(createMarker(),node);nodesToRemove.push(node);}else {node.data=strings[lastIndex];}partIndex+=lastIndex;}}else if(node.nodeType===8){if(node.data===marker){const parent=node.parentNode;if(node.previousSibling===null||index===lastPartIndex){index++;parent.insertBefore(createMarker(),node);}lastPartIndex=index;this.parts.push({type:"node",index:index});if(node.nextSibling===null){node.data="";}else {nodesToRemove.push(node);index--;}partIndex++;}else {let i=-1;while((i=node.data.indexOf(marker,i+1))!==-1){this.parts.push({type:"node",index:-1});partIndex++;}}}}for(const n of nodesToRemove){n.parentNode.removeChild(n);}}}const endsWith=(str,suffix)=>{const index=str.length-suffix.length;return index>=0&&str.slice(index)===suffix};const isTemplatePartActive=part=>part.index!==-1;const createMarker=()=>document.createComment("");const lastAttributeNameRegex=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const walkerNodeFilter=133;function removeNodesFromTemplate(template,nodesToRemove){const{element:{content:content},parts:parts}=template;const walker=document.createTreeWalker(content,walkerNodeFilter,null,false);let partIndex=nextActiveIndexInTemplateParts(parts);let part=parts[partIndex];let nodeIndex=-1;let removeCount=0;const nodesToRemoveInTemplate=[];let currentRemovingNode=null;while(walker.nextNode()){nodeIndex++;const node=walker.currentNode;if(node.previousSibling===currentRemovingNode){currentRemovingNode=null;}if(nodesToRemove.has(node)){nodesToRemoveInTemplate.push(node);if(currentRemovingNode===null){currentRemovingNode=node;}}if(currentRemovingNode!==null){removeCount++;}while(part!==undefined&&part.index===nodeIndex){part.index=currentRemovingNode!==null?-1:part.index-removeCount;partIndex=nextActiveIndexInTemplateParts(parts,partIndex);part=parts[partIndex];}}nodesToRemoveInTemplate.forEach(n=>n.parentNode.removeChild(n));}const countNodes=node=>{let count=node.nodeType===11?0:1;const walker=document.createTreeWalker(node,walkerNodeFilter,null,false);while(walker.nextNode()){count++;}return count};const nextActiveIndexInTemplateParts=(parts,startIndex=-1)=>{for(let i=startIndex+1;i<parts.length;i++){const part=parts[i];if(isTemplatePartActive(part)){return i}}return -1};function insertNodeIntoTemplate(template,node,refNode=null){const{element:{content:content},parts:parts}=template;if(refNode===null||refNode===undefined){content.appendChild(node);return}const walker=document.createTreeWalker(content,walkerNodeFilter,null,false);let partIndex=nextActiveIndexInTemplateParts(parts);let insertCount=0;let walkerIndex=-1;while(walker.nextNode()){walkerIndex++;const walkerNode=walker.currentNode;if(walkerNode===refNode){insertCount=countNodes(node);refNode.parentNode.insertBefore(node,refNode);}while(partIndex!==-1&&parts[partIndex].index===walkerIndex){if(insertCount>0){while(partIndex!==-1){parts[partIndex].index+=insertCount;partIndex=nextActiveIndexInTemplateParts(parts,partIndex);}return}partIndex=nextActiveIndexInTemplateParts(parts,partIndex);}}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const directives=new WeakMap;const directive=f=>(...args)=>{const d=f(...args);directives.set(d,true);return d};const isDirective=o=>typeof o==="function"&&directives.has(o);
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const noChange={};const nothing={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */class TemplateInstance{constructor(template,processor,options){this.__parts=[];this.template=template;this.processor=processor;this.options=options;}update(values){let i=0;for(const part of this.__parts){if(part!==undefined){part.setValue(values[i]);}i++;}for(const part of this.__parts){if(part!==undefined){part.commit();}}}_clone(){const fragment=isCEPolyfill?this.template.element.content.cloneNode(true):document.importNode(this.template.element.content,true);const stack=[];const parts=this.template.parts;const walker=document.createTreeWalker(fragment,133,null,false);let partIndex=0;let nodeIndex=0;let part;let node=walker.nextNode();while(partIndex<parts.length){part=parts[partIndex];if(!isTemplatePartActive(part)){this.__parts.push(undefined);partIndex++;continue}while(nodeIndex<part.index){nodeIndex++;if(node.nodeName==="TEMPLATE"){stack.push(node);walker.currentNode=node.content;}if((node=walker.nextNode())===null){walker.currentNode=stack.pop();node=walker.nextNode();}}if(part.type==="node"){const part=this.processor.handleTextExpression(this.options);part.insertAfterNode(node.previousSibling);this.__parts.push(part);}else {this.__parts.push(...this.processor.handleAttributeExpressions(node,part.name,part.strings,this.options));}partIndex++;}if(isCEPolyfill){document.adoptNode(fragment);customElements.upgrade(fragment);}return fragment}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const commentMarker=` ${marker} `;class TemplateResult{constructor(strings,values,type,processor){this.strings=strings;this.values=values;this.type=type;this.processor=processor;}getHTML(){const l=this.strings.length-1;let html="";let isCommentBinding=false;for(let i=0;i<l;i++){const s=this.strings[i];const commentOpen=s.lastIndexOf("\x3c!--");isCommentBinding=(commentOpen>-1||isCommentBinding)&&s.indexOf("--\x3e",commentOpen+1)===-1;const attributeMatch=lastAttributeNameRegex.exec(s);if(attributeMatch===null){html+=s+(isCommentBinding?commentMarker:nodeMarker);}else {html+=s.substr(0,attributeMatch.index)+attributeMatch[1]+attributeMatch[2]+boundAttributeSuffix+attributeMatch[3]+marker;}}html+=this.strings[l];return html}getTemplateElement(){const template=document.createElement("template");template.innerHTML=this.getHTML();return template}}class SVGTemplateResult extends TemplateResult{getHTML(){return `<svg>${super.getHTML()}</svg>`}getTemplateElement(){const template=super.getTemplateElement();const content=template.content;const svgElement=content.firstChild;content.removeChild(svgElement);reparentNodes(content,svgElement.firstChild);return template}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const isPrimitive=value=>value===null||!(typeof value==="object"||typeof value==="function");const isIterable=value=>Array.isArray(value)||!!(value&&value[Symbol.iterator]);class AttributeCommitter{constructor(element,name,strings){this.dirty=true;this.element=element;this.name=name;this.strings=strings;this.parts=[];for(let i=0;i<strings.length-1;i++){this.parts[i]=this._createPart();}}_createPart(){return new AttributePart(this)}_getValue(){const strings=this.strings;const l=strings.length-1;let text="";for(let i=0;i<l;i++){text+=strings[i];const part=this.parts[i];if(part!==undefined){const v=part.value;if(isPrimitive(v)||!isIterable(v)){text+=typeof v==="string"?v:String(v);}else {for(const t of v){text+=typeof t==="string"?t:String(t);}}}}text+=strings[l];return text}commit(){if(this.dirty){this.dirty=false;this.element.setAttribute(this.name,this._getValue());}}}class AttributePart{constructor(committer){this.value=undefined;this.committer=committer;}setValue(value){if(value!==noChange&&(!isPrimitive(value)||value!==this.value)){this.value=value;if(!isDirective(value)){this.committer.dirty=true;}}}commit(){while(isDirective(this.value)){const directive=this.value;this.value=noChange;directive(this);}if(this.value===noChange){return}this.committer.commit();}}class NodePart{constructor(options){this.value=undefined;this.__pendingValue=undefined;this.options=options;}appendInto(container){this.startNode=container.appendChild(createMarker());this.endNode=container.appendChild(createMarker());}insertAfterNode(ref){this.startNode=ref;this.endNode=ref.nextSibling;}appendIntoPart(part){part.__insert(this.startNode=createMarker());part.__insert(this.endNode=createMarker());}insertAfterPart(ref){ref.__insert(this.startNode=createMarker());this.endNode=ref.endNode;ref.endNode=this.startNode;}setValue(value){this.__pendingValue=value;}commit(){if(this.startNode.parentNode===null){return}while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this);}const value=this.__pendingValue;if(value===noChange){return}if(isPrimitive(value)){if(value!==this.value){this.__commitText(value);}}else if(value instanceof TemplateResult){this.__commitTemplateResult(value);}else if(value instanceof Node){this.__commitNode(value);}else if(isIterable(value)){this.__commitIterable(value);}else if(value===nothing){this.value=nothing;this.clear();}else {this.__commitText(value);}}__insert(node){this.endNode.parentNode.insertBefore(node,this.endNode);}__commitNode(value){if(this.value===value){return}this.clear();this.__insert(value);this.value=value;}__commitText(value){const node=this.startNode.nextSibling;value=value==null?"":value;const valueAsString=typeof value==="string"?value:String(value);if(node===this.endNode.previousSibling&&node.nodeType===3){node.data=valueAsString;}else {this.__commitNode(document.createTextNode(valueAsString));}this.value=value;}__commitTemplateResult(value){const template=this.options.templateFactory(value);if(this.value instanceof TemplateInstance&&this.value.template===template){this.value.update(value.values);}else {const instance=new TemplateInstance(template,value.processor,this.options);const fragment=instance._clone();instance.update(value.values);this.__commitNode(fragment);this.value=instance;}}__commitIterable(value){if(!Array.isArray(this.value)){this.value=[];this.clear();}const itemParts=this.value;let partIndex=0;let itemPart;for(const item of value){itemPart=itemParts[partIndex];if(itemPart===undefined){itemPart=new NodePart(this.options);itemParts.push(itemPart);if(partIndex===0){itemPart.appendIntoPart(this);}else {itemPart.insertAfterPart(itemParts[partIndex-1]);}}itemPart.setValue(item);itemPart.commit();partIndex++;}if(partIndex<itemParts.length){itemParts.length=partIndex;this.clear(itemPart&&itemPart.endNode);}}clear(startNode=this.startNode){removeNodes(this.startNode.parentNode,startNode.nextSibling,this.endNode);}}class BooleanAttributePart{constructor(element,name,strings){this.value=undefined;this.__pendingValue=undefined;if(strings.length!==2||strings[0]!==""||strings[1]!==""){throw new Error("Boolean attributes can only contain a single expression")}this.element=element;this.name=name;this.strings=strings;}setValue(value){this.__pendingValue=value;}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this);}if(this.__pendingValue===noChange){return}const value=!!this.__pendingValue;if(this.value!==value){if(value){this.element.setAttribute(this.name,"");}else {this.element.removeAttribute(this.name);}this.value=value;}this.__pendingValue=noChange;}}class PropertyCommitter extends AttributeCommitter{constructor(element,name,strings){super(element,name,strings);this.single=strings.length===2&&strings[0]===""&&strings[1]==="";}_createPart(){return new PropertyPart(this)}_getValue(){if(this.single){return this.parts[0].value}return super._getValue()}commit(){if(this.dirty){this.dirty=false;this.element[this.name]=this._getValue();}}}class PropertyPart extends AttributePart{}let eventOptionsSupported=false;(()=>{try{const options={get capture(){eventOptionsSupported=true;return false}};window.addEventListener("test",options,options);window.removeEventListener("test",options,options);}catch(_e){}})();class EventPart{constructor(element,eventName,eventContext){this.value=undefined;this.__pendingValue=undefined;this.element=element;this.eventName=eventName;this.eventContext=eventContext;this.__boundHandleEvent=e=>this.handleEvent(e);}setValue(value){this.__pendingValue=value;}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this);}if(this.__pendingValue===noChange){return}const newListener=this.__pendingValue;const oldListener=this.value;const shouldRemoveListener=newListener==null||oldListener!=null&&(newListener.capture!==oldListener.capture||newListener.once!==oldListener.once||newListener.passive!==oldListener.passive);const shouldAddListener=newListener!=null&&(oldListener==null||shouldRemoveListener);if(shouldRemoveListener){this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options);}if(shouldAddListener){this.__options=getOptions(newListener);this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options);}this.value=newListener;this.__pendingValue=noChange;}handleEvent(event){if(typeof this.value==="function"){this.value.call(this.eventContext||this.element,event);}else {this.value.handleEvent(event);}}}const getOptions=o=>o&&(eventOptionsSupported?{capture:o.capture,passive:o.passive,once:o.once}:o.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function templateFactory(result){let templateCache=templateCaches.get(result.type);if(templateCache===undefined){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(result.type,templateCache);}let template=templateCache.stringsArray.get(result.strings);if(template!==undefined){return template}const key=result.strings.join(marker);template=templateCache.keyString.get(key);if(template===undefined){template=new Template(result,result.getTemplateElement());templateCache.keyString.set(key,template);}templateCache.stringsArray.set(result.strings,template);return template}const templateCaches=new Map;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const parts=new WeakMap;const render$1=(result,container,options)=>{let part=parts.get(container);if(part===undefined){removeNodes(container,container.firstChild);parts.set(container,part=new NodePart(Object.assign({templateFactory:templateFactory},options)));part.appendInto(container);}part.setValue(result);part.commit();};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */class DefaultTemplateProcessor{handleAttributeExpressions(element,name,strings,options){const prefix=name[0];if(prefix==="."){const committer=new PropertyCommitter(element,name.slice(1),strings);return committer.parts}if(prefix==="@"){return [new EventPart(element,name.slice(1),options.eventContext)]}if(prefix==="?"){return [new BooleanAttributePart(element,name.slice(1),strings)]}const committer=new AttributeCommitter(element,name,strings);return committer.parts}handleTextExpression(options){return new NodePart(options)}}const defaultTemplateProcessor=new DefaultTemplateProcessor;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */if(typeof window!=="undefined"){(window["litHtmlVersions"]||(window["litHtmlVersions"]=[])).push("1.2.1");}const html=(strings,...values)=>new TemplateResult(strings,values,"html",defaultTemplateProcessor);const svg=(strings,...values)=>new SVGTemplateResult(strings,values,"svg",defaultTemplateProcessor);var litHtml=Object.freeze({__proto__:null,html:html,svg:svg,DefaultTemplateProcessor:DefaultTemplateProcessor,defaultTemplateProcessor:defaultTemplateProcessor,directive:directive,isDirective:isDirective,removeNodes:removeNodes,reparentNodes:reparentNodes,noChange:noChange,nothing:nothing,AttributeCommitter:AttributeCommitter,AttributePart:AttributePart,BooleanAttributePart:BooleanAttributePart,EventPart:EventPart,isIterable:isIterable,isPrimitive:isPrimitive,NodePart:NodePart,PropertyCommitter:PropertyCommitter,PropertyPart:PropertyPart,parts:parts,render:render$1,templateCaches:templateCaches,templateFactory:templateFactory,TemplateInstance:TemplateInstance,SVGTemplateResult:SVGTemplateResult,TemplateResult:TemplateResult,createMarker:createMarker,isTemplatePartActive:isTemplatePartActive,Template:Template});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const getTemplateCacheKey=(type,scopeName)=>`${type}--${scopeName}`;let compatibleShadyCSSVersion=true;if(typeof window.ShadyCSS==="undefined"){compatibleShadyCSSVersion=false;}else if(typeof window.ShadyCSS.prepareTemplateDom==="undefined"){console.warn(`Incompatible ShadyCSS version detected. `+`Please update to at least @webcomponents/webcomponentsjs@2.0.2 and `+`@webcomponents/shadycss@1.3.1.`);compatibleShadyCSSVersion=false;}const shadyTemplateFactory=scopeName=>result=>{const cacheKey=getTemplateCacheKey(result.type,scopeName);let templateCache=templateCaches.get(cacheKey);if(templateCache===undefined){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(cacheKey,templateCache);}let template=templateCache.stringsArray.get(result.strings);if(template!==undefined){return template}const key=result.strings.join(marker);template=templateCache.keyString.get(key);if(template===undefined){const element=result.getTemplateElement();if(compatibleShadyCSSVersion){window.ShadyCSS.prepareTemplateDom(element,scopeName);}template=new Template(result,element);templateCache.keyString.set(key,template);}templateCache.stringsArray.set(result.strings,template);return template};const TEMPLATE_TYPES=["html","svg"];const removeStylesFromLitTemplates=scopeName=>{TEMPLATE_TYPES.forEach(type=>{const templates=templateCaches.get(getTemplateCacheKey(type,scopeName));if(templates!==undefined){templates.keyString.forEach(template=>{const{element:{content:content}}=template;const styles=new Set;Array.from(content.querySelectorAll("style")).forEach(s=>{styles.add(s);});removeNodesFromTemplate(template,styles);});}});};const shadyRenderSet=new Set;const prepareTemplateStyles=(scopeName,renderedDOM,template)=>{shadyRenderSet.add(scopeName);const templateElement=!!template?template.element:document.createElement("template");const styles=renderedDOM.querySelectorAll("style");const{length:length}=styles;if(length===0){window.ShadyCSS.prepareTemplateStyles(templateElement,scopeName);return}const condensedStyle=document.createElement("style");for(let i=0;i<length;i++){const style=styles[i];style.parentNode.removeChild(style);condensedStyle.textContent+=style.textContent;}removeStylesFromLitTemplates(scopeName);const content=templateElement.content;if(!!template){insertNodeIntoTemplate(template,condensedStyle,content.firstChild);}else {content.insertBefore(condensedStyle,content.firstChild);}window.ShadyCSS.prepareTemplateStyles(templateElement,scopeName);const style=content.querySelector("style");if(window.ShadyCSS.nativeShadow&&style!==null){renderedDOM.insertBefore(style.cloneNode(true),renderedDOM.firstChild);}else if(!!template){content.insertBefore(condensedStyle,content.firstChild);const removes=new Set;removes.add(condensedStyle);removeNodesFromTemplate(template,removes);}};const render$1$1=(result,container,options)=>{if(!options||typeof options!=="object"||!options.scopeName){throw new Error("The `scopeName` option is required.")}const scopeName=options.scopeName;const hasRendered=parts.has(container);const needsScoping=compatibleShadyCSSVersion&&container.nodeType===11&&!!container.host;const firstScopeRender=needsScoping&&!shadyRenderSet.has(scopeName);const renderContainer=firstScopeRender?document.createDocumentFragment():container;render$1(result,renderContainer,Object.assign({templateFactory:shadyTemplateFactory(scopeName)},options));if(firstScopeRender){const part=parts.get(renderContainer);parts.delete(renderContainer);const template=part.value instanceof TemplateInstance?part.value.template:undefined;prepareTemplateStyles(scopeName,renderContainer,template);removeNodes(container,container.firstChild);container.appendChild(renderContainer);parts.set(container,part);}if(!hasRendered&&needsScoping){window.ShadyCSS.styleElement(container.host);}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */var _a;window.JSCompiler_renameProperty=(prop,_obj)=>prop;const defaultConverter={toAttribute(value,type){switch(type){case Boolean:return value?"":null;case Object:case Array:return value==null?value:JSON.stringify(value)}return value},fromAttribute(value,type){switch(type){case Boolean:return value!==null;case Number:return value===null?null:Number(value);case Object:case Array:return JSON.parse(value)}return value}};const notEqual=(value,old)=>old!==value&&(old===old||value===value);const defaultPropertyDeclaration={attribute:true,type:String,converter:defaultConverter,reflect:false,hasChanged:notEqual};const STATE_HAS_UPDATED=1;const STATE_UPDATE_REQUESTED=1<<2;const STATE_IS_REFLECTING_TO_ATTRIBUTE=1<<3;const STATE_IS_REFLECTING_TO_PROPERTY=1<<4;const finalized="finalized";class UpdatingElement extends HTMLElement{constructor(){super();this._updateState=0;this._instanceProperties=undefined;this._updatePromise=new Promise(res=>this._enableUpdatingResolver=res);this._changedProperties=new Map;this._reflectingProperties=undefined;this.initialize();}static get observedAttributes(){this.finalize();const attributes=[];this._classProperties.forEach((v,p)=>{const attr=this._attributeNameForProperty(p,v);if(attr!==undefined){this._attributeToPropertyMap.set(attr,p);attributes.push(attr);}});return attributes}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const superProperties=Object.getPrototypeOf(this)._classProperties;if(superProperties!==undefined){superProperties.forEach((v,k)=>this._classProperties.set(k,v));}}}static createProperty(name,options=defaultPropertyDeclaration){this._ensureClassProperties();this._classProperties.set(name,options);if(options.noAccessor||this.prototype.hasOwnProperty(name)){return}const key=typeof name==="symbol"?Symbol():`__${name}`;const descriptor=this.getPropertyDescriptor(name,key,options);if(descriptor!==undefined){Object.defineProperty(this.prototype,name,descriptor);}}static getPropertyDescriptor(name,key,_options){return {get(){return this[key]},set(value){const oldValue=this[name];this[key]=value;this._requestUpdate(name,oldValue);},configurable:true,enumerable:true}}static getPropertyOptions(name){return this._classProperties&&this._classProperties.get(name)||defaultPropertyDeclaration}static finalize(){const superCtor=Object.getPrototypeOf(this);if(!superCtor.hasOwnProperty(finalized)){superCtor.finalize();}this[finalized]=true;this._ensureClassProperties();this._attributeToPropertyMap=new Map;if(this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const props=this.properties;const propKeys=[...Object.getOwnPropertyNames(props),...typeof Object.getOwnPropertySymbols==="function"?Object.getOwnPropertySymbols(props):[]];for(const p of propKeys){this.createProperty(p,props[p]);}}}static _attributeNameForProperty(name,options){const attribute=options.attribute;return attribute===false?undefined:typeof attribute==="string"?attribute:typeof name==="string"?name.toLowerCase():undefined}static _valueHasChanged(value,old,hasChanged=notEqual){return hasChanged(value,old)}static _propertyValueFromAttribute(value,options){const type=options.type;const converter=options.converter||defaultConverter;const fromAttribute=typeof converter==="function"?converter:converter.fromAttribute;return fromAttribute?fromAttribute(value,type):value}static _propertyValueToAttribute(value,options){if(options.reflect===undefined){return}const type=options.type;const converter=options.converter;const toAttribute=converter&&converter.toAttribute||defaultConverter.toAttribute;return toAttribute(value,type)}initialize(){this._saveInstanceProperties();this._requestUpdate();}_saveInstanceProperties(){this.constructor._classProperties.forEach((_v,p)=>{if(this.hasOwnProperty(p)){const value=this[p];delete this[p];if(!this._instanceProperties){this._instanceProperties=new Map;}this._instanceProperties.set(p,value);}});}_applyInstanceProperties(){this._instanceProperties.forEach((v,p)=>this[p]=v);this._instanceProperties=undefined;}connectedCallback(){this.enableUpdating();}enableUpdating(){if(this._enableUpdatingResolver!==undefined){this._enableUpdatingResolver();this._enableUpdatingResolver=undefined;}}disconnectedCallback(){}attributeChangedCallback(name,old,value){if(old!==value){this._attributeToProperty(name,value);}}_propertyToAttribute(name,value,options=defaultPropertyDeclaration){const ctor=this.constructor;const attr=ctor._attributeNameForProperty(name,options);if(attr!==undefined){const attrValue=ctor._propertyValueToAttribute(value,options);if(attrValue===undefined){return}this._updateState=this._updateState|STATE_IS_REFLECTING_TO_ATTRIBUTE;if(attrValue==null){this.removeAttribute(attr);}else {this.setAttribute(attr,attrValue);}this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_ATTRIBUTE;}}_attributeToProperty(name,value){if(this._updateState&STATE_IS_REFLECTING_TO_ATTRIBUTE){return}const ctor=this.constructor;const propName=ctor._attributeToPropertyMap.get(name);if(propName!==undefined){const options=ctor.getPropertyOptions(propName);this._updateState=this._updateState|STATE_IS_REFLECTING_TO_PROPERTY;this[propName]=ctor._propertyValueFromAttribute(value,options);this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_PROPERTY;}}_requestUpdate(name,oldValue){let shouldRequestUpdate=true;if(name!==undefined){const ctor=this.constructor;const options=ctor.getPropertyOptions(name);if(ctor._valueHasChanged(this[name],oldValue,options.hasChanged)){if(!this._changedProperties.has(name)){this._changedProperties.set(name,oldValue);}if(options.reflect===true&&!(this._updateState&STATE_IS_REFLECTING_TO_PROPERTY)){if(this._reflectingProperties===undefined){this._reflectingProperties=new Map;}this._reflectingProperties.set(name,options);}}else {shouldRequestUpdate=false;}}if(!this._hasRequestedUpdate&&shouldRequestUpdate){this._updatePromise=this._enqueueUpdate();}}requestUpdate(name,oldValue){this._requestUpdate(name,oldValue);return this.updateComplete}async _enqueueUpdate(){this._updateState=this._updateState|STATE_UPDATE_REQUESTED;try{await this._updatePromise;}catch(e){}const result=this.performUpdate();if(result!=null){await result;}return !this._hasRequestedUpdate}get _hasRequestedUpdate(){return this._updateState&STATE_UPDATE_REQUESTED}get hasUpdated(){return this._updateState&STATE_HAS_UPDATED}performUpdate(){if(this._instanceProperties){this._applyInstanceProperties();}let shouldUpdate=false;const changedProperties=this._changedProperties;try{shouldUpdate=this.shouldUpdate(changedProperties);if(shouldUpdate){this.update(changedProperties);}else {this._markUpdated();}}catch(e){shouldUpdate=false;this._markUpdated();throw e}if(shouldUpdate){if(!(this._updateState&STATE_HAS_UPDATED)){this._updateState=this._updateState|STATE_HAS_UPDATED;this.firstUpdated(changedProperties);}this.updated(changedProperties);}}_markUpdated(){this._changedProperties=new Map;this._updateState=this._updateState&~STATE_UPDATE_REQUESTED;}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(_changedProperties){return true}update(_changedProperties){if(this._reflectingProperties!==undefined&&this._reflectingProperties.size>0){this._reflectingProperties.forEach((v,k)=>this._propertyToAttribute(k,this[k],v));this._reflectingProperties=undefined;}this._markUpdated();}updated(_changedProperties){}firstUpdated(_changedProperties){}}_a=finalized;UpdatingElement[_a]=true;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const legacyCustomElement=(tagName,clazz)=>{window.customElements.define(tagName,clazz);return clazz};const standardCustomElement=(tagName,descriptor)=>{const{kind:kind,elements:elements}=descriptor;return {kind:kind,elements:elements,finisher(clazz){window.customElements.define(tagName,clazz);}}};const customElement=tagName=>classOrDescriptor=>typeof classOrDescriptor==="function"?legacyCustomElement(tagName,classOrDescriptor):standardCustomElement(tagName,classOrDescriptor);const standardProperty=(options,element)=>{if(element.kind==="method"&&element.descriptor&&!("value"in element.descriptor)){return Object.assign(Object.assign({},element),{finisher(clazz){clazz.createProperty(element.key,options);}})}else {return {kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){if(typeof element.initializer==="function"){this[element.key]=element.initializer.call(this);}},finisher(clazz){clazz.createProperty(element.key,options);}}}};const legacyProperty=(options,proto,name)=>{proto.constructor.createProperty(name,options);};function property(options){return (protoOrDescriptor,name)=>name!==undefined?legacyProperty(options,protoOrDescriptor,name):standardProperty(options,protoOrDescriptor)}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const supportsAdoptingStyleSheets="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype;const constructionToken=Symbol();class CSSResult{constructor(cssText,safeToken){if(safeToken!==constructionToken){throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.")}this.cssText=cssText;}get styleSheet(){if(this._styleSheet===undefined){if(supportsAdoptingStyleSheets){this._styleSheet=new CSSStyleSheet;this._styleSheet.replaceSync(this.cssText);}else {this._styleSheet=null;}}return this._styleSheet}toString(){return this.cssText}}const textFromCSSResult=value=>{if(value instanceof CSSResult){return value.cssText}else if(typeof value==="number"){return value}else {throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)}};const css=(strings,...values)=>{const cssText=values.reduce((acc,v,idx)=>acc+textFromCSSResult(v)+strings[idx+1],strings[0]);return new CSSResult(cssText,constructionToken)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */(window["litElementVersions"]||(window["litElementVersions"]=[])).push("2.3.1");const renderNotImplemented={};class LitElement extends UpdatingElement{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this))){return}const userStyles=this.getStyles();if(userStyles===undefined){this._styles=[];}else if(Array.isArray(userStyles)){const addStyles=(styles,set)=>styles.reduceRight((set,s)=>Array.isArray(s)?addStyles(s,set):(set.add(s),set),set);const set=addStyles(userStyles,new Set);const styles=[];set.forEach(v=>styles.unshift(v));this._styles=styles;}else {this._styles=[userStyles];}}initialize(){super.initialize();this.constructor._getUniqueStyles();this.renderRoot=this.createRenderRoot();if(window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot){this.adoptStyles();}}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const styles=this.constructor._styles;if(styles.length===0){return}if(window.ShadyCSS!==undefined&&!window.ShadyCSS.nativeShadow){window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s=>s.cssText),this.localName);}else if(supportsAdoptingStyleSheets){this.renderRoot.adoptedStyleSheets=styles.map(s=>s.styleSheet);}else {this._needsShimAdoptedStyleSheets=true;}}connectedCallback(){super.connectedCallback();if(this.hasUpdated&&window.ShadyCSS!==undefined){window.ShadyCSS.styleElement(this);}}update(changedProperties){const templateResult=this.render();super.update(changedProperties);if(templateResult!==renderNotImplemented){this.constructor.render(templateResult,this.renderRoot,{scopeName:this.localName,eventContext:this});}if(this._needsShimAdoptedStyleSheets){this._needsShimAdoptedStyleSheets=false;this.constructor._styles.forEach(s=>{const style=document.createElement("style");style.textContent=s.cssText;this.renderRoot.appendChild(style);});}}render(){return renderNotImplemented}}LitElement["finalized"]=true;LitElement.render=render$1$1;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const _state=new WeakMap;const _infinity=2147483647;const until=directive((...args)=>part=>{let state=_state.get(part);if(state===undefined){state={lastRenderedIndex:_infinity,values:[]};_state.set(part,state);}const previousValues=state.values;let previousLength=previousValues.length;state.values=args;for(let i=0;i<args.length;i++){if(i>state.lastRenderedIndex){break}const value=args[i];if(isPrimitive(value)||typeof value.then!=="function"){part.setValue(value);state.lastRenderedIndex=i;break}if(i<previousLength&&value===previousValues[i]){continue}state.lastRenderedIndex=_infinity;previousLength=0;Promise.resolve(value).then(resolvedValue=>{const index=state.values.indexOf(value);if(index>-1&&index<state.lastRenderedIndex){state.lastRenderedIndex=index;part.setValue(resolvedValue);part.commit();}});}});async function fetchJson(src){let result=[];try{const file=await fetch(src);const json=await file.json();if(Array.isArray(json.tags)&&json.tags.length){result=json.tags;}else {console.error(`No element definitions found at ${src}`);}}catch(e){console.error(e);}return result}const emptyDataWarning=html`
  <div part="warning">
    No custom elements found in the JSON file.
  </div>
`;const ApiViewerMixin=base=>{class ApiViewer extends base{constructor(){super(...arguments);this.jsonFetched=Promise.resolve([]);}update(props){const{src:src}=this;if(Array.isArray(this.elements)){this.lastSrc=undefined;this.jsonFetched=Promise.resolve(this.elements);}else if(src&&this.lastSrc!==src){this.lastSrc=src;this.jsonFetched=fetchJson(src);}super.update(props);}}__decorate([property()],ApiViewer.prototype,"src",void 0);__decorate([property({attribute:false})],ApiViewer.prototype,"elements",void 0);__decorate([property()],ApiViewer.prototype,"selected",void 0);return ApiViewer};const EMPTY_ELEMENT={name:"",description:"",slots:[],attributes:[],properties:[],events:[],cssParts:[],cssProperties:[]};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const previousValues=new WeakMap;const unsafeHTML=directive(value=>part=>{if(!(part instanceof NodePart)){throw new Error("unsafeHTML can only be used in text bindings")}const previousValue=previousValues.get(part);if(previousValue!==undefined&&isPrimitive(value)&&value===previousValue.value&&part.value===previousValue.fragment){return}const template=document.createElement("template");template.innerHTML=value;const fragment=document.importNode(template.content,true);part.setValue(fragment);previousValues.set(part,{value:value,fragment:fragment});});function createCommonjsModule(fn,module){return module={exports:{}},fn(module,module.exports),module.exports}var defaults=createCommonjsModule((function(module){function getDefaults(){return {baseUrl:null,breaks:false,gfm:true,headerIds:true,headerPrefix:"",highlight:null,langPrefix:"language-",mangle:true,pedantic:false,renderer:null,sanitize:false,sanitizer:null,silent:false,smartLists:false,smartypants:false,xhtml:false}}function changeDefaults(newDefaults){module.exports.defaults=newDefaults;}module.exports={defaults:getDefaults(),getDefaults:getDefaults,changeDefaults:changeDefaults};}));var defaults_1=defaults.defaults;var defaults_2=defaults.getDefaults;var defaults_3=defaults.changeDefaults;const escapeTest=/[&<>"']/;const escapeReplace=/[&<>"']/g;const escapeTestNoEncode=/[<>"']|&(?!#?\w+;)/;const escapeReplaceNoEncode=/[<>"']|&(?!#?\w+;)/g;const escapeReplacements={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};const getEscapeReplacement=ch=>escapeReplacements[ch];function escape(html,encode){if(encode){if(escapeTest.test(html)){return html.replace(escapeReplace,getEscapeReplacement)}}else {if(escapeTestNoEncode.test(html)){return html.replace(escapeReplaceNoEncode,getEscapeReplacement)}}return html}const unescapeTest=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function unescape(html){return html.replace(unescapeTest,(_,n)=>{n=n.toLowerCase();if(n==="colon")return ":";if(n.charAt(0)==="#"){return n.charAt(1)==="x"?String.fromCharCode(parseInt(n.substring(2),16)):String.fromCharCode(+n.substring(1))}return ""})}const caret=/(^|[^\[])\^/g;function edit(regex,opt){regex=regex.source||regex;opt=opt||"";const obj={replace:(name,val)=>{val=val.source||val;val=val.replace(caret,"$1");regex=regex.replace(name,val);return obj},getRegex:()=>new RegExp(regex,opt)};return obj}const nonWordAndColonTest=/[^\w:]/g;const originIndependentUrl=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function cleanUrl(sanitize,base,href){if(sanitize){let prot;try{prot=decodeURIComponent(unescape(href)).replace(nonWordAndColonTest,"").toLowerCase();}catch(e){return null}if(prot.indexOf("javascript:")===0||prot.indexOf("vbscript:")===0||prot.indexOf("data:")===0){return null}}if(base&&!originIndependentUrl.test(href)){href=resolveUrl(base,href);}try{href=encodeURI(href).replace(/%25/g,"%");}catch(e){return null}return href}const baseUrls={};const justDomain=/^[^:]+:\/*[^/]*$/;const protocol=/^([^:]+:)[\s\S]*$/;const domain=/^([^:]+:\/*[^/]*)[\s\S]*$/;function resolveUrl(base,href){if(!baseUrls[" "+base]){if(justDomain.test(base)){baseUrls[" "+base]=base+"/";}else {baseUrls[" "+base]=rtrim(base,"/",true);}}base=baseUrls[" "+base];const relativeBase=base.indexOf(":")===-1;if(href.substring(0,2)==="//"){if(relativeBase){return href}return base.replace(protocol,"$1")+href}else if(href.charAt(0)==="/"){if(relativeBase){return href}return base.replace(domain,"$1")+href}else {return base+href}}const noopTest={exec:function noopTest(){}};function merge(obj){let i=1,target,key;for(;i<arguments.length;i++){target=arguments[i];for(key in target){if(Object.prototype.hasOwnProperty.call(target,key)){obj[key]=target[key];}}}return obj}function splitCells(tableRow,count){const row=tableRow.replace(/\|/g,(match,offset,str)=>{let escaped=false,curr=offset;while(--curr>=0&&str[curr]==="\\")escaped=!escaped;if(escaped){return "|"}else {return " |"}}),cells=row.split(/ \|/);let i=0;if(cells.length>count){cells.splice(count);}else {while(cells.length<count)cells.push("");}for(;i<cells.length;i++){cells[i]=cells[i].trim().replace(/\\\|/g,"|");}return cells}function rtrim(str,c,invert){const l=str.length;if(l===0){return ""}let suffLen=0;while(suffLen<l){const currChar=str.charAt(l-suffLen-1);if(currChar===c&&!invert){suffLen++;}else if(currChar!==c&&invert){suffLen++;}else {break}}return str.substr(0,l-suffLen)}function findClosingBracket(str,b){if(str.indexOf(b[1])===-1){return -1}const l=str.length;let level=0,i=0;for(;i<l;i++){if(str[i]==="\\"){i++;}else if(str[i]===b[0]){level++;}else if(str[i]===b[1]){level--;if(level<0){return i}}}return -1}function checkSanitizeDeprecation(opt){if(opt&&opt.sanitize&&!opt.silent){console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");}}var helpers={escape:escape,unescape:unescape,edit:edit,cleanUrl:cleanUrl,resolveUrl:resolveUrl,noopTest:noopTest,merge:merge,splitCells:splitCells,rtrim:rtrim,findClosingBracket:findClosingBracket,checkSanitizeDeprecation:checkSanitizeDeprecation};const{noopTest:noopTest$1,edit:edit$1,merge:merge$1}=helpers;const block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,hr:/^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:"^ {0,3}(?:"+"<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)"+"|comment[^\\n]*(\\n+|$)"+"|<\\?[\\s\\S]*?\\?>\\n*"+"|<![A-Z][\\s\\S]*?>\\n*"+"|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*"+"|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)"+"|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)"+"|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)"+")",def:/^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,nptable:noopTest$1,table:noopTest$1,lheading:/^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,text:/^[^\n]+/};block._label=/(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;block._title=/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;block.def=edit$1(block.def).replace("label",block._label).replace("title",block._title).getRegex();block.bullet=/(?:[*+-]|\d{1,9}\.)/;block.item=/^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;block.item=edit$1(block.item,"gm").replace(/bull/g,block.bullet).getRegex();block.list=edit$1(block.list).replace(/bull/g,block.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+block.def.source+")").getRegex();block._tag="address|article|aside|base|basefont|blockquote|body|caption"+"|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption"+"|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe"+"|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option"+"|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr"+"|track|ul";block._comment=/<!--(?!-?>)[\s\S]*?-->/;block.html=edit$1(block.html,"i").replace("comment",block._comment).replace("tag",block._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();block.paragraph=edit$1(block._paragraph).replace("hr",block.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag",block._tag).getRegex();block.blockquote=edit$1(block.blockquote).replace("paragraph",block.paragraph).getRegex();block.normal=merge$1({},block);block.gfm=merge$1({},block.normal,{nptable:"^ *([^|\\n ].*\\|.*)\\n"+" *([-:]+ *\\|[-| :]*)"+"(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)",table:"^ *\\|(.+)\\n"+" *\\|?( *[-:]+[-| :]*)"+"(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"});block.gfm.nptable=edit$1(block.gfm.nptable).replace("hr",block.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag",block._tag).getRegex();block.gfm.table=edit$1(block.gfm.table).replace("hr",block.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag",block._tag).getRegex();block.pedantic=merge$1({},block.normal,{html:edit$1("^ *(?:comment *(?:\\n|\\s*$)"+"|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)"+"|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",block._comment).replace(/tag/g,"(?!(?:"+"a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub"+"|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)"+"\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,fences:noopTest$1,paragraph:edit$1(block.normal._paragraph).replace("hr",block.hr).replace("heading"," *#{1,6} *[^\n]").replace("lheading",block.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()});const inline={escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:noopTest$1,tag:"^comment"+"|^</[a-zA-Z][\\w:-]*\\s*>"+"|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>"+"|^<\\?[\\s\\S]*?\\?>"+"|^<![a-zA-Z]+\\s[\\s\\S]*?>"+"|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,nolink:/^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,strong:/^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,em:/^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:noopTest$1,text:/^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/};inline._punctuation="!\"#$%&'()*+,\\-./:;<=>?@\\[^_{|}~";inline.em=edit$1(inline.em).replace(/punctuation/g,inline._punctuation).getRegex();inline._escapes=/\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;inline._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;inline._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;inline.autolink=edit$1(inline.autolink).replace("scheme",inline._scheme).replace("email",inline._email).getRegex();inline._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;inline.tag=edit$1(inline.tag).replace("comment",block._comment).replace("attribute",inline._attribute).getRegex();inline._label=/(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;inline._href=/<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;inline._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;inline.link=edit$1(inline.link).replace("label",inline._label).replace("href",inline._href).replace("title",inline._title).getRegex();inline.reflink=edit$1(inline.reflink).replace("label",inline._label).getRegex();inline.normal=merge$1({},inline);inline.pedantic=merge$1({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,link:edit$1(/^!?\[(label)\]\((.*?)\)/).replace("label",inline._label).getRegex(),reflink:edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",inline._label).getRegex()});inline.gfm=merge$1({},inline.normal,{escape:edit$1(inline.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,del:/^~+(?=\S)([\s\S]*?\S)~+/,text:/^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/});inline.gfm.url=edit$1(inline.gfm.url,"i").replace("email",inline.gfm._extended_email).getRegex();inline.breaks=merge$1({},inline.gfm,{br:edit$1(inline.br).replace("{2,}","*").getRegex(),text:edit$1(inline.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()});var rules={block:block,inline:inline};const{defaults:defaults$1}=defaults;const{block:block$1}=rules;const{rtrim:rtrim$1,splitCells:splitCells$1,escape:escape$1}=helpers;var Lexer_1=class Lexer{constructor(options){this.tokens=[];this.tokens.links=Object.create(null);this.options=options||defaults$1;this.rules=block$1.normal;if(this.options.pedantic){this.rules=block$1.pedantic;}else if(this.options.gfm){this.rules=block$1.gfm;}}static get rules(){return block$1}static lex(src,options){const lexer=new Lexer(options);return lexer.lex(src)}lex(src){src=src.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ");return this.token(src,true)}token(src,top){src=src.replace(/^ +$/gm,"");let next,loose,cap,bull,b,item,listStart,listItems,t,space,i,tag,l,isordered,istask,ischecked;while(src){if(cap=this.rules.newline.exec(src)){src=src.substring(cap[0].length);if(cap[0].length>1){this.tokens.push({type:"space"});}}if(cap=this.rules.code.exec(src)){const lastToken=this.tokens[this.tokens.length-1];src=src.substring(cap[0].length);if(lastToken&&lastToken.type==="paragraph"){lastToken.text+="\n"+cap[0].trimRight();}else {cap=cap[0].replace(/^ {4}/gm,"");this.tokens.push({type:"code",codeBlockStyle:"indented",text:!this.options.pedantic?rtrim$1(cap,"\n"):cap});}continue}if(cap=this.rules.fences.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"code",lang:cap[2]?cap[2].trim():cap[2],text:cap[3]||""});continue}if(cap=this.rules.heading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[1].length,text:cap[2]});continue}if(cap=this.rules.nptable.exec(src)){item={type:"table",header:splitCells$1(cap[1].replace(/^ *| *\| *$/g,"")),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3]?cap[3].replace(/\n$/,"").split("\n"):[]};if(item.header.length===item.align.length){src=src.substring(cap[0].length);for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right";}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center";}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left";}else {item.align[i]=null;}}for(i=0;i<item.cells.length;i++){item.cells[i]=splitCells$1(item.cells[i],item.header.length);}this.tokens.push(item);continue}}if(cap=this.rules.hr.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"hr"});continue}if(cap=this.rules.blockquote.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"blockquote_start"});cap=cap[0].replace(/^ *> ?/gm,"");this.token(cap,top);this.tokens.push({type:"blockquote_end"});continue}if(cap=this.rules.list.exec(src)){src=src.substring(cap[0].length);bull=cap[2];isordered=bull.length>1;listStart={type:"list_start",ordered:isordered,start:isordered?+bull:"",loose:false};this.tokens.push(listStart);cap=cap[0].match(this.rules.item);listItems=[];next=false;l=cap.length;i=0;for(;i<l;i++){item=cap[i];space=item.length;item=item.replace(/^ *([*+-]|\d+\.) */,"");if(~item.indexOf("\n ")){space-=item.length;item=!this.options.pedantic?item.replace(new RegExp("^ {1,"+space+"}","gm"),""):item.replace(/^ {1,4}/gm,"");}if(i!==l-1){b=block$1.bullet.exec(cap[i+1])[0];if(bull.length>1?b.length===1:b.length>1||this.options.smartLists&&b!==bull){src=cap.slice(i+1).join("\n")+src;i=l-1;}}loose=next||/\n\n(?!\s*$)/.test(item);if(i!==l-1){next=item.charAt(item.length-1)==="\n";if(!loose)loose=next;}if(loose){listStart.loose=true;}istask=/^\[[ xX]\] /.test(item);ischecked=undefined;if(istask){ischecked=item[1]!==" ";item=item.replace(/^\[[ xX]\] +/,"");}t={type:"list_item_start",task:istask,checked:ischecked,loose:loose};listItems.push(t);this.tokens.push(t);this.token(item,false);this.tokens.push({type:"list_item_end"});}if(listStart.loose){l=listItems.length;i=0;for(;i<l;i++){listItems[i].loose=true;}}this.tokens.push({type:"list_end"});continue}if(cap=this.rules.html.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:!this.options.sanitizer&&(cap[1]==="pre"||cap[1]==="script"||cap[1]==="style"),text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape$1(cap[0]):cap[0]});continue}if(top&&(cap=this.rules.def.exec(src))){src=src.substring(cap[0].length);if(cap[3])cap[3]=cap[3].substring(1,cap[3].length-1);tag=cap[1].toLowerCase().replace(/\s+/g," ");if(!this.tokens.links[tag]){this.tokens.links[tag]={href:cap[2],title:cap[3]};}continue}if(cap=this.rules.table.exec(src)){item={type:"table",header:splitCells$1(cap[1].replace(/^ *| *\| *$/g,"")),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3]?cap[3].replace(/\n$/,"").split("\n"):[]};if(item.header.length===item.align.length){src=src.substring(cap[0].length);for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right";}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center";}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left";}else {item.align[i]=null;}}for(i=0;i<item.cells.length;i++){item.cells[i]=splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g,""),item.header.length);}this.tokens.push(item);continue}}if(cap=this.rules.lheading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[2].charAt(0)==="="?1:2,text:cap[1]});continue}if(top&&(cap=this.rules.paragraph.exec(src))){src=src.substring(cap[0].length);this.tokens.push({type:"paragraph",text:cap[1].charAt(cap[1].length-1)==="\n"?cap[1].slice(0,-1):cap[1]});continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"text",text:cap[0]});continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return this.tokens}};const{defaults:defaults$2}=defaults;const{cleanUrl:cleanUrl$1,escape:escape$2}=helpers;var Renderer_1=class Renderer{constructor(options){this.options=options||defaults$2;}code(code,infostring,escaped){const lang=(infostring||"").match(/\S*/)[0];if(this.options.highlight){const out=this.options.highlight(code,lang);if(out!=null&&out!==code){escaped=true;code=out;}}if(!lang){return "<pre><code>"+(escaped?code:escape$2(code,true))+"</code></pre>"}return '<pre><code class="'+this.options.langPrefix+escape$2(lang,true)+'">'+(escaped?code:escape$2(code,true))+"</code></pre>\n"}blockquote(quote){return "<blockquote>\n"+quote+"</blockquote>\n"}html(html){return html}heading(text,level,raw,slugger){if(this.options.headerIds){return "<h"+level+' id="'+this.options.headerPrefix+slugger.slug(raw)+'">'+text+"</h"+level+">\n"}return "<h"+level+">"+text+"</h"+level+">\n"}hr(){return this.options.xhtml?"<hr/>\n":"<hr>\n"}list(body,ordered,start){const type=ordered?"ol":"ul",startatt=ordered&&start!==1?' start="'+start+'"':"";return "<"+type+startatt+">\n"+body+"</"+type+">\n"}listitem(text){return "<li>"+text+"</li>\n"}checkbox(checked){return "<input "+(checked?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "}paragraph(text){return "<p>"+text+"</p>\n"}table(header,body){if(body)body="<tbody>"+body+"</tbody>";return "<table>\n"+"<thead>\n"+header+"</thead>\n"+body+"</table>\n"}tablerow(content){return "<tr>\n"+content+"</tr>\n"}tablecell(content,flags){const type=flags.header?"th":"td";const tag=flags.align?"<"+type+' align="'+flags.align+'">':"<"+type+">";return tag+content+"</"+type+">\n"}strong(text){return "<strong>"+text+"</strong>"}em(text){return "<em>"+text+"</em>"}codespan(text){return "<code>"+text+"</code>"}br(){return this.options.xhtml?"<br/>":"<br>"}del(text){return "<del>"+text+"</del>"}link(href,title,text){href=cleanUrl$1(this.options.sanitize,this.options.baseUrl,href);if(href===null){return text}let out='<a href="'+escape$2(href)+'"';if(title){out+=' title="'+title+'"';}out+=">"+text+"</a>";return out}image(href,title,text){href=cleanUrl$1(this.options.sanitize,this.options.baseUrl,href);if(href===null){return text}let out='<img src="'+href+'" alt="'+text+'"';if(title){out+=' title="'+title+'"';}out+=this.options.xhtml?"/>":">";return out}text(text){return text}};var Slugger_1=class Slugger{constructor(){this.seen={};}slug(value){let slug=value.toLowerCase().trim().replace(/<[!\/a-z].*?>/gi,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-");if(this.seen.hasOwnProperty(slug)){const originalSlug=slug;do{this.seen[originalSlug]++;slug=originalSlug+"-"+this.seen[originalSlug];}while(this.seen.hasOwnProperty(slug))}this.seen[slug]=0;return slug}};const{defaults:defaults$3}=defaults;const{inline:inline$1}=rules;const{findClosingBracket:findClosingBracket$1,escape:escape$3}=helpers;var InlineLexer_1=class InlineLexer{constructor(links,options){this.options=options||defaults$3;this.links=links;this.rules=inline$1.normal;this.options.renderer=this.options.renderer||new Renderer_1;this.renderer=this.options.renderer;this.renderer.options=this.options;if(!this.links){throw new Error("Tokens array requires a `links` property.")}if(this.options.pedantic){this.rules=inline$1.pedantic;}else if(this.options.gfm){if(this.options.breaks){this.rules=inline$1.breaks;}else {this.rules=inline$1.gfm;}}}static get rules(){return inline$1}static output(src,links,options){const inline=new InlineLexer(links,options);return inline.output(src)}output(src){let out="",link,text,href,title,cap,prevCapZero;while(src){if(cap=this.rules.escape.exec(src)){src=src.substring(cap[0].length);out+=escape$3(cap[1]);continue}if(cap=this.rules.tag.exec(src)){if(!this.inLink&&/^<a /i.test(cap[0])){this.inLink=true;}else if(this.inLink&&/^<\/a>/i.test(cap[0])){this.inLink=false;}if(!this.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])){this.inRawBlock=true;}else if(this.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])){this.inRawBlock=false;}src=src.substring(cap[0].length);out+=this.renderer.html(this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape$3(cap[0]):cap[0]);continue}if(cap=this.rules.link.exec(src)){const lastParenIndex=findClosingBracket$1(cap[2],"()");if(lastParenIndex>-1){const start=cap[0].indexOf("!")===0?5:4;const linkLen=start+cap[1].length+lastParenIndex;cap[2]=cap[2].substring(0,lastParenIndex);cap[0]=cap[0].substring(0,linkLen).trim();cap[3]="";}src=src.substring(cap[0].length);this.inLink=true;href=cap[2];if(this.options.pedantic){link=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);if(link){href=link[1];title=link[3];}else {title="";}}else {title=cap[3]?cap[3].slice(1,-1):"";}href=href.trim().replace(/^<([\s\S]*)>$/,"$1");out+=this.outputLink(cap,{href:InlineLexer.escapes(href),title:InlineLexer.escapes(title)});this.inLink=false;continue}if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){src=src.substring(cap[0].length);link=(cap[2]||cap[1]).replace(/\s+/g," ");link=this.links[link.toLowerCase()];if(!link||!link.href){out+=cap[0].charAt(0);src=cap[0].substring(1)+src;continue}this.inLink=true;out+=this.outputLink(cap,link);this.inLink=false;continue}if(cap=this.rules.strong.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.strong(this.output(cap[4]||cap[3]||cap[2]||cap[1]));continue}if(cap=this.rules.em.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.em(this.output(cap[6]||cap[5]||cap[4]||cap[3]||cap[2]||cap[1]));continue}if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.codespan(escape$3(cap[2].trim(),true));continue}if(cap=this.rules.br.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.br();continue}if(cap=this.rules.del.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.del(this.output(cap[1]));continue}if(cap=this.rules.autolink.exec(src)){src=src.substring(cap[0].length);if(cap[2]==="@"){text=escape$3(this.mangle(cap[1]));href="mailto:"+text;}else {text=escape$3(cap[1]);href=text;}out+=this.renderer.link(href,null,text);continue}if(!this.inLink&&(cap=this.rules.url.exec(src))){if(cap[2]==="@"){text=escape$3(cap[0]);href="mailto:"+text;}else {do{prevCapZero=cap[0];cap[0]=this.rules._backpedal.exec(cap[0])[0];}while(prevCapZero!==cap[0]);text=escape$3(cap[0]);if(cap[1]==="www."){href="http://"+text;}else {href=text;}}src=src.substring(cap[0].length);out+=this.renderer.link(href,null,text);continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);if(this.inRawBlock){out+=this.renderer.text(this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape$3(cap[0]):cap[0]);}else {out+=this.renderer.text(escape$3(this.smartypants(cap[0])));}continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return out}static escapes(text){return text?text.replace(InlineLexer.rules._escapes,"$1"):text}outputLink(cap,link){const href=link.href,title=link.title?escape$3(link.title):null;return cap[0].charAt(0)!=="!"?this.renderer.link(href,title,this.output(cap[1])):this.renderer.image(href,title,escape$3(cap[1]))}smartypants(text){if(!this.options.smartypants)return text;return text.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")}mangle(text){if(!this.options.mangle)return text;const l=text.length;let out="",i=0,ch;for(;i<l;i++){ch=text.charCodeAt(i);if(Math.random()>.5){ch="x"+ch.toString(16);}out+="&#"+ch+";";}return out}};var TextRenderer_1=class TextRenderer{strong(text){return text}em(text){return text}codespan(text){return text}del(text){return text}html(text){return text}text(text){return text}link(href,title,text){return ""+text}image(href,title,text){return ""+text}br(){return ""}};const{defaults:defaults$4}=defaults;const{merge:merge$2,unescape:unescape$1}=helpers;var Parser_1=class Parser{constructor(options){this.tokens=[];this.token=null;this.options=options||defaults$4;this.options.renderer=this.options.renderer||new Renderer_1;this.renderer=this.options.renderer;this.renderer.options=this.options;this.slugger=new Slugger_1;}static parse(tokens,options){const parser=new Parser(options);return parser.parse(tokens)}parse(tokens){this.inline=new InlineLexer_1(tokens.links,this.options);this.inlineText=new InlineLexer_1(tokens.links,merge$2({},this.options,{renderer:new TextRenderer_1}));this.tokens=tokens.reverse();let out="";while(this.next()){out+=this.tok();}return out}next(){this.token=this.tokens.pop();return this.token}peek(){return this.tokens[this.tokens.length-1]||0}parseText(){let body=this.token.text;while(this.peek().type==="text"){body+="\n"+this.next().text;}return this.inline.output(body)}tok(){let body="";switch(this.token.type){case"space":{return ""}case"hr":{return this.renderer.hr()}case"heading":{return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,unescape$1(this.inlineText.output(this.token.text)),this.slugger)}case"code":{return this.renderer.code(this.token.text,this.token.lang,this.token.escaped)}case"table":{let header="",i,row,cell,j;cell="";for(i=0;i<this.token.header.length;i++){cell+=this.renderer.tablecell(this.inline.output(this.token.header[i]),{header:true,align:this.token.align[i]});}header+=this.renderer.tablerow(cell);for(i=0;i<this.token.cells.length;i++){row=this.token.cells[i];cell="";for(j=0;j<row.length;j++){cell+=this.renderer.tablecell(this.inline.output(row[j]),{header:false,align:this.token.align[j]});}body+=this.renderer.tablerow(cell);}return this.renderer.table(header,body)}case"blockquote_start":{body="";while(this.next().type!=="blockquote_end"){body+=this.tok();}return this.renderer.blockquote(body)}case"list_start":{body="";const ordered=this.token.ordered,start=this.token.start;while(this.next().type!=="list_end"){body+=this.tok();}return this.renderer.list(body,ordered,start)}case"list_item_start":{body="";const loose=this.token.loose;const checked=this.token.checked;const task=this.token.task;if(this.token.task){if(loose){if(this.peek().type==="text"){const nextToken=this.peek();nextToken.text=this.renderer.checkbox(checked)+" "+nextToken.text;}else {this.tokens.push({type:"text",text:this.renderer.checkbox(checked)});}}else {body+=this.renderer.checkbox(checked);}}while(this.next().type!=="list_item_end"){body+=!loose&&this.token.type==="text"?this.parseText():this.tok();}return this.renderer.listitem(body,task,checked)}case"html":{return this.renderer.html(this.token.text)}case"paragraph":{return this.renderer.paragraph(this.inline.output(this.token.text))}case"text":{return this.renderer.paragraph(this.parseText())}default:{const errMsg='Token with "'+this.token.type+'" type was not found.';if(this.options.silent){console.log(errMsg);}else {throw new Error(errMsg)}}}}};const{merge:merge$3,checkSanitizeDeprecation:checkSanitizeDeprecation$1,escape:escape$4}=helpers;const{getDefaults:getDefaults,changeDefaults:changeDefaults,defaults:defaults$5}=defaults;function marked(src,opt,callback){if(typeof src==="undefined"||src===null){throw new Error("marked(): input parameter is undefined or null")}if(typeof src!=="string"){throw new Error("marked(): input parameter is of type "+Object.prototype.toString.call(src)+", string expected")}if(callback||typeof opt==="function"){if(!callback){callback=opt;opt=null;}opt=merge$3({},marked.defaults,opt||{});checkSanitizeDeprecation$1(opt);const highlight=opt.highlight;let tokens,pending,i=0;try{tokens=Lexer_1.lex(src,opt);}catch(e){return callback(e)}pending=tokens.length;const done=function(err){if(err){opt.highlight=highlight;return callback(err)}let out;try{out=Parser_1.parse(tokens,opt);}catch(e){err=e;}opt.highlight=highlight;return err?callback(err):callback(null,out)};if(!highlight||highlight.length<3){return done()}delete opt.highlight;if(!pending)return done();for(;i<tokens.length;i++){(function(token){if(token.type!=="code"){return --pending||done()}return highlight(token.text,token.lang,(function(err,code){if(err)return done(err);if(code==null||code===token.text){return --pending||done()}token.text=code;token.escaped=true;--pending||done();}))})(tokens[i]);}return}try{opt=merge$3({},marked.defaults,opt||{});checkSanitizeDeprecation$1(opt);return Parser_1.parse(Lexer_1.lex(src,opt),opt)}catch(e){e.message+="\nPlease report this to https://github.com/markedjs/marked.";if((opt||marked.defaults).silent){return "<p>An error occurred:</p><pre>"+escape$4(e.message+"",true)+"</pre>"}throw e}}marked.options=marked.setOptions=function(opt){merge$3(marked.defaults,opt);changeDefaults(marked.defaults);return marked};marked.getDefaults=getDefaults;marked.defaults=defaults$5;marked.Parser=Parser_1;marked.parser=Parser_1.parse;marked.Renderer=Renderer_1;marked.TextRenderer=TextRenderer_1;marked.Lexer=Lexer_1;marked.lexer=Lexer_1.lex;marked.InlineLexer=InlineLexer_1;marked.inlineLexer=InlineLexer_1.output;marked.Slugger=Slugger_1;marked.parse=marked;var marked_1=marked;
/*! @license DOMPurify | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.0.8/LICENSE */function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2}else {return Array.from(arr)}}var hasOwnProperty=Object.hasOwnProperty,setPrototypeOf=Object.setPrototypeOf,isFrozen=Object.isFrozen,objectKeys=Object.keys;var freeze=Object.freeze,seal=Object.seal;var _ref=typeof Reflect!=="undefined"&&Reflect,apply=_ref.apply,construct=_ref.construct;if(!apply){apply=function apply(fun,thisValue,args){return fun.apply(thisValue,args)};}if(!freeze){freeze=function freeze(x){return x};}if(!seal){seal=function seal(x){return x};}if(!construct){construct=function construct(Func,args){return new(Function.prototype.bind.apply(Func,[null].concat(_toConsumableArray(args))))};}var arrayForEach=unapply(Array.prototype.forEach);var arrayIndexOf=unapply(Array.prototype.indexOf);var arrayJoin=unapply(Array.prototype.join);var arrayPop=unapply(Array.prototype.pop);var arrayPush=unapply(Array.prototype.push);var arraySlice=unapply(Array.prototype.slice);var stringToLowerCase=unapply(String.prototype.toLowerCase);var stringMatch=unapply(String.prototype.match);var stringReplace=unapply(String.prototype.replace);var stringIndexOf=unapply(String.prototype.indexOf);var stringTrim=unapply(String.prototype.trim);var regExpTest=unapply(RegExp.prototype.test);var regExpCreate=unconstruct(RegExp);var typeErrorCreate=unconstruct(TypeError);function unapply(func){return function(thisArg){for(var _len=arguments.length,args=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key];}return apply(func,thisArg,args)}}function unconstruct(func){return function(){for(var _len2=arguments.length,args=Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}return construct(func,args)}}function addToSet(set,array){if(setPrototypeOf){setPrototypeOf(set,null);}var l=array.length;while(l--){var element=array[l];if(typeof element==="string"){var lcElement=stringToLowerCase(element);if(lcElement!==element){if(!isFrozen(array)){array[l]=lcElement;}element=lcElement;}}set[element]=true;}return set}function clone(object){var newObject={};var property=void 0;for(property in object){if(apply(hasOwnProperty,object,[property])){newObject[property]=object[property];}}return newObject}var html$1=freeze(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]);var svg$1=freeze(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","audio","canvas","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","video","view","vkern"]);var svgFilters=freeze(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]);var mathMl=freeze(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]);var text=freeze(["#text"]);var html$1$1=freeze(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns"]);var svg$1$1=freeze(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","tabindex","targetx","targety","transform","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]);var mathMl$1=freeze(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]);var xml=freeze(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]);var MUSTACHE_EXPR=seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm);var ERB_EXPR=seal(/<%[\s\S]*|[\s\S]*%>/gm);var DATA_ATTR=seal(/^data-[\-\w.\u00B7-\uFFFF]/);var ARIA_ATTR=seal(/^aria-[\-\w]+$/);var IS_ALLOWED_URI=seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);var IS_SCRIPT_OR_DATA=seal(/^(?:\w+script|data):/i);var ATTR_WHITESPACE=seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g);var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj};function _toConsumableArray$1(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2}else {return Array.from(arr)}}var getGlobal=function getGlobal(){return typeof window==="undefined"?null:window};var _createTrustedTypesPolicy=function _createTrustedTypesPolicy(trustedTypes,document){if((typeof trustedTypes==="undefined"?"undefined":_typeof(trustedTypes))!=="object"||typeof trustedTypes.createPolicy!=="function"){return null}var suffix=null;var ATTR_NAME="data-tt-policy-suffix";if(document.currentScript&&document.currentScript.hasAttribute(ATTR_NAME)){suffix=document.currentScript.getAttribute(ATTR_NAME);}var policyName="dompurify"+(suffix?"#"+suffix:"");try{return trustedTypes.createPolicy(policyName,{createHTML:function createHTML(html$$1){return html$$1}})}catch(_){console.warn("TrustedTypes policy "+policyName+" could not be created.");return null}};function createDOMPurify(){var window=arguments.length>0&&arguments[0]!==undefined?arguments[0]:getGlobal();var DOMPurify=function DOMPurify(root){return createDOMPurify(root)};DOMPurify.version="2.0.11";DOMPurify.removed=[];if(!window||!window.document||window.document.nodeType!==9){DOMPurify.isSupported=false;return DOMPurify}var originalDocument=window.document;var removeTitle=false;var document=window.document;var DocumentFragment=window.DocumentFragment,HTMLTemplateElement=window.HTMLTemplateElement,Node=window.Node,NodeFilter=window.NodeFilter,_window$NamedNodeMap=window.NamedNodeMap,NamedNodeMap=_window$NamedNodeMap===undefined?window.NamedNodeMap||window.MozNamedAttrMap:_window$NamedNodeMap,Text=window.Text,Comment=window.Comment,DOMParser=window.DOMParser,trustedTypes=window.trustedTypes;if(typeof HTMLTemplateElement==="function"){var template=document.createElement("template");if(template.content&&template.content.ownerDocument){document=template.content.ownerDocument;}}var trustedTypesPolicy=_createTrustedTypesPolicy(trustedTypes,originalDocument);var emptyHTML=trustedTypesPolicy?trustedTypesPolicy.createHTML(""):"";var _document=document,implementation=_document.implementation,createNodeIterator=_document.createNodeIterator,getElementsByTagName=_document.getElementsByTagName,createDocumentFragment=_document.createDocumentFragment;var importNode=originalDocument.importNode;var hooks={};DOMPurify.isSupported=implementation&&typeof implementation.createHTMLDocument!=="undefined"&&document.documentMode!==9;var MUSTACHE_EXPR$$1=MUSTACHE_EXPR,ERB_EXPR$$1=ERB_EXPR,DATA_ATTR$$1=DATA_ATTR,ARIA_ATTR$$1=ARIA_ATTR,IS_SCRIPT_OR_DATA$$1=IS_SCRIPT_OR_DATA,ATTR_WHITESPACE$$1=ATTR_WHITESPACE;var IS_ALLOWED_URI$$1=IS_ALLOWED_URI;var ALLOWED_TAGS=null;var DEFAULT_ALLOWED_TAGS=addToSet({},[].concat(_toConsumableArray$1(html$1),_toConsumableArray$1(svg$1),_toConsumableArray$1(svgFilters),_toConsumableArray$1(mathMl),_toConsumableArray$1(text)));var ALLOWED_ATTR=null;var DEFAULT_ALLOWED_ATTR=addToSet({},[].concat(_toConsumableArray$1(html$1$1),_toConsumableArray$1(svg$1$1),_toConsumableArray$1(mathMl$1),_toConsumableArray$1(xml)));var FORBID_TAGS=null;var FORBID_ATTR=null;var ALLOW_ARIA_ATTR=true;var ALLOW_DATA_ATTR=true;var ALLOW_UNKNOWN_PROTOCOLS=false;var SAFE_FOR_JQUERY=false;var SAFE_FOR_TEMPLATES=false;var WHOLE_DOCUMENT=false;var SET_CONFIG=false;var FORCE_BODY=false;var RETURN_DOM=false;var RETURN_DOM_FRAGMENT=false;var RETURN_DOM_IMPORT=false;var RETURN_TRUSTED_TYPE=false;var SANITIZE_DOM=true;var KEEP_CONTENT=true;var IN_PLACE=false;var USE_PROFILES={};var FORBID_CONTENTS=addToSet({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","plaintext","script","style","svg","template","thead","title","video","xmp"]);var DATA_URI_TAGS=null;var DEFAULT_DATA_URI_TAGS=addToSet({},["audio","video","img","source","image","track"]);var URI_SAFE_ATTRIBUTES=null;var DEFAULT_URI_SAFE_ATTRIBUTES=addToSet({},["alt","class","for","id","label","name","pattern","placeholder","summary","title","value","style","xmlns"]);var CONFIG=null;var formElement=document.createElement("form");var _parseConfig=function _parseConfig(cfg){if(CONFIG&&CONFIG===cfg){return}if(!cfg||(typeof cfg==="undefined"?"undefined":_typeof(cfg))!=="object"){cfg={};}ALLOWED_TAGS="ALLOWED_TAGS"in cfg?addToSet({},cfg.ALLOWED_TAGS):DEFAULT_ALLOWED_TAGS;ALLOWED_ATTR="ALLOWED_ATTR"in cfg?addToSet({},cfg.ALLOWED_ATTR):DEFAULT_ALLOWED_ATTR;URI_SAFE_ATTRIBUTES="ADD_URI_SAFE_ATTR"in cfg?addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES),cfg.ADD_URI_SAFE_ATTR):DEFAULT_URI_SAFE_ATTRIBUTES;DATA_URI_TAGS="ADD_DATA_URI_TAGS"in cfg?addToSet(clone(DEFAULT_DATA_URI_TAGS),cfg.ADD_DATA_URI_TAGS):DEFAULT_DATA_URI_TAGS;FORBID_TAGS="FORBID_TAGS"in cfg?addToSet({},cfg.FORBID_TAGS):{};FORBID_ATTR="FORBID_ATTR"in cfg?addToSet({},cfg.FORBID_ATTR):{};USE_PROFILES="USE_PROFILES"in cfg?cfg.USE_PROFILES:false;ALLOW_ARIA_ATTR=cfg.ALLOW_ARIA_ATTR!==false;ALLOW_DATA_ATTR=cfg.ALLOW_DATA_ATTR!==false;ALLOW_UNKNOWN_PROTOCOLS=cfg.ALLOW_UNKNOWN_PROTOCOLS||false;SAFE_FOR_JQUERY=cfg.SAFE_FOR_JQUERY||false;SAFE_FOR_TEMPLATES=cfg.SAFE_FOR_TEMPLATES||false;WHOLE_DOCUMENT=cfg.WHOLE_DOCUMENT||false;RETURN_DOM=cfg.RETURN_DOM||false;RETURN_DOM_FRAGMENT=cfg.RETURN_DOM_FRAGMENT||false;RETURN_DOM_IMPORT=cfg.RETURN_DOM_IMPORT||false;RETURN_TRUSTED_TYPE=cfg.RETURN_TRUSTED_TYPE||false;FORCE_BODY=cfg.FORCE_BODY||false;SANITIZE_DOM=cfg.SANITIZE_DOM!==false;KEEP_CONTENT=cfg.KEEP_CONTENT!==false;IN_PLACE=cfg.IN_PLACE||false;IS_ALLOWED_URI$$1=cfg.ALLOWED_URI_REGEXP||IS_ALLOWED_URI$$1;if(SAFE_FOR_TEMPLATES){ALLOW_DATA_ATTR=false;}if(RETURN_DOM_FRAGMENT){RETURN_DOM=true;}if(USE_PROFILES){ALLOWED_TAGS=addToSet({},[].concat(_toConsumableArray$1(text)));ALLOWED_ATTR=[];if(USE_PROFILES.html===true){addToSet(ALLOWED_TAGS,html$1);addToSet(ALLOWED_ATTR,html$1$1);}if(USE_PROFILES.svg===true){addToSet(ALLOWED_TAGS,svg$1);addToSet(ALLOWED_ATTR,svg$1$1);addToSet(ALLOWED_ATTR,xml);}if(USE_PROFILES.svgFilters===true){addToSet(ALLOWED_TAGS,svgFilters);addToSet(ALLOWED_ATTR,svg$1$1);addToSet(ALLOWED_ATTR,xml);}if(USE_PROFILES.mathMl===true){addToSet(ALLOWED_TAGS,mathMl);addToSet(ALLOWED_ATTR,mathMl$1);addToSet(ALLOWED_ATTR,xml);}}if(cfg.ADD_TAGS){if(ALLOWED_TAGS===DEFAULT_ALLOWED_TAGS){ALLOWED_TAGS=clone(ALLOWED_TAGS);}addToSet(ALLOWED_TAGS,cfg.ADD_TAGS);}if(cfg.ADD_ATTR){if(ALLOWED_ATTR===DEFAULT_ALLOWED_ATTR){ALLOWED_ATTR=clone(ALLOWED_ATTR);}addToSet(ALLOWED_ATTR,cfg.ADD_ATTR);}if(cfg.ADD_URI_SAFE_ATTR){addToSet(URI_SAFE_ATTRIBUTES,cfg.ADD_URI_SAFE_ATTR);}if(KEEP_CONTENT){ALLOWED_TAGS["#text"]=true;}if(WHOLE_DOCUMENT){addToSet(ALLOWED_TAGS,["html","head","body"]);}if(ALLOWED_TAGS.table){addToSet(ALLOWED_TAGS,["tbody"]);delete FORBID_TAGS.tbody;}if(freeze){freeze(cfg);}CONFIG=cfg;};var _forceRemove=function _forceRemove(node){arrayPush(DOMPurify.removed,{element:node});try{node.parentNode.removeChild(node);}catch(_){node.outerHTML=emptyHTML;}};var _removeAttribute=function _removeAttribute(name,node){try{arrayPush(DOMPurify.removed,{attribute:node.getAttributeNode(name),from:node});}catch(_){arrayPush(DOMPurify.removed,{attribute:null,from:node});}node.removeAttribute(name);};var _initDocument=function _initDocument(dirty){var doc=void 0;var leadingWhitespace=void 0;if(FORCE_BODY){dirty="<remove></remove>"+dirty;}else {var matches=stringMatch(dirty,/^[\r\n\t ]+/);leadingWhitespace=matches&&matches[0];}var dirtyPayload=trustedTypesPolicy?trustedTypesPolicy.createHTML(dirty):dirty;try{doc=(new DOMParser).parseFromString(dirtyPayload,"text/html");}catch(_){}if(removeTitle){addToSet(FORBID_TAGS,["title"]);}if(!doc||!doc.documentElement){doc=implementation.createHTMLDocument("");var _doc=doc,body=_doc.body;body.parentNode.removeChild(body.parentNode.firstElementChild);body.outerHTML=dirtyPayload;}if(dirty&&leadingWhitespace){doc.body.insertBefore(document.createTextNode(leadingWhitespace),doc.body.childNodes[0]||null);}return getElementsByTagName.call(doc,WHOLE_DOCUMENT?"html":"body")[0]};if(DOMPurify.isSupported){(function(){try{var doc=_initDocument("<x/><title>&lt;/title&gt;&lt;img&gt;");if(regExpTest(/<\/title/,doc.querySelector("title").innerHTML)){removeTitle=true;}}catch(_){}})();}var _createIterator=function _createIterator(root){return createNodeIterator.call(root.ownerDocument||root,root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_COMMENT|NodeFilter.SHOW_TEXT,(function(){return NodeFilter.FILTER_ACCEPT}),false)};var _isClobbered=function _isClobbered(elm){if(elm instanceof Text||elm instanceof Comment){return false}if(typeof elm.nodeName!=="string"||typeof elm.textContent!=="string"||typeof elm.removeChild!=="function"||!(elm.attributes instanceof NamedNodeMap)||typeof elm.removeAttribute!=="function"||typeof elm.setAttribute!=="function"||typeof elm.namespaceURI!=="string"){return true}return false};var _isNode=function _isNode(object){return (typeof Node==="undefined"?"undefined":_typeof(Node))==="object"?object instanceof Node:object&&(typeof object==="undefined"?"undefined":_typeof(object))==="object"&&typeof object.nodeType==="number"&&typeof object.nodeName==="string"};var _executeHook=function _executeHook(entryPoint,currentNode,data){if(!hooks[entryPoint]){return}arrayForEach(hooks[entryPoint],(function(hook){hook.call(DOMPurify,currentNode,data,CONFIG);}));};var _sanitizeElements=function _sanitizeElements(currentNode){var content=void 0;_executeHook("beforeSanitizeElements",currentNode,null);if(_isClobbered(currentNode)){_forceRemove(currentNode);return true}var tagName=stringToLowerCase(currentNode.nodeName);_executeHook("uponSanitizeElement",currentNode,{tagName:tagName,allowedTags:ALLOWED_TAGS});if((tagName==="svg"||tagName==="math")&&currentNode.querySelectorAll("p, br").length!==0){_forceRemove(currentNode);return true}if(!ALLOWED_TAGS[tagName]||FORBID_TAGS[tagName]){if(KEEP_CONTENT&&!FORBID_CONTENTS[tagName]&&typeof currentNode.insertAdjacentHTML==="function"){try{var htmlToInsert=currentNode.innerHTML;currentNode.insertAdjacentHTML("AfterEnd",trustedTypesPolicy?trustedTypesPolicy.createHTML(htmlToInsert):htmlToInsert);}catch(_){}}_forceRemove(currentNode);return true}if(tagName==="noscript"&&regExpTest(/<\/noscript/i,currentNode.innerHTML)){_forceRemove(currentNode);return true}if(tagName==="noembed"&&regExpTest(/<\/noembed/i,currentNode.innerHTML)){_forceRemove(currentNode);return true}if(SAFE_FOR_JQUERY&&!currentNode.firstElementChild&&(!currentNode.content||!currentNode.content.firstElementChild)&&regExpTest(/</g,currentNode.textContent)){arrayPush(DOMPurify.removed,{element:currentNode.cloneNode()});if(currentNode.innerHTML){currentNode.innerHTML=stringReplace(currentNode.innerHTML,/</g,"&lt;");}else {currentNode.innerHTML=stringReplace(currentNode.textContent,/</g,"&lt;");}}if(SAFE_FOR_TEMPLATES&&currentNode.nodeType===3){content=currentNode.textContent;content=stringReplace(content,MUSTACHE_EXPR$$1," ");content=stringReplace(content,ERB_EXPR$$1," ");if(currentNode.textContent!==content){arrayPush(DOMPurify.removed,{element:currentNode.cloneNode()});currentNode.textContent=content;}}_executeHook("afterSanitizeElements",currentNode,null);return false};var _isValidAttribute=function _isValidAttribute(lcTag,lcName,value){if(SANITIZE_DOM&&(lcName==="id"||lcName==="name")&&(value in document||value in formElement)){return false}if(ALLOW_DATA_ATTR&&regExpTest(DATA_ATTR$$1,lcName));else if(ALLOW_ARIA_ATTR&&regExpTest(ARIA_ATTR$$1,lcName));else if(!ALLOWED_ATTR[lcName]||FORBID_ATTR[lcName]){return false}else if(URI_SAFE_ATTRIBUTES[lcName]);else if(regExpTest(IS_ALLOWED_URI$$1,stringReplace(value,ATTR_WHITESPACE$$1,"")));else if((lcName==="src"||lcName==="xlink:href"||lcName==="href")&&lcTag!=="script"&&stringIndexOf(value,"data:")===0&&DATA_URI_TAGS[lcTag]);else if(ALLOW_UNKNOWN_PROTOCOLS&&!regExpTest(IS_SCRIPT_OR_DATA$$1,stringReplace(value,ATTR_WHITESPACE$$1,"")));else if(!value);else {return false}return true};var _sanitizeAttributes=function _sanitizeAttributes(currentNode){var attr=void 0;var value=void 0;var lcName=void 0;var idAttr=void 0;var l=void 0;_executeHook("beforeSanitizeAttributes",currentNode,null);var attributes=currentNode.attributes;if(!attributes){return}var hookEvent={attrName:"",attrValue:"",keepAttr:true,allowedAttributes:ALLOWED_ATTR};l=attributes.length;while(l--){attr=attributes[l];var _attr=attr,name=_attr.name,namespaceURI=_attr.namespaceURI;value=stringTrim(attr.value);lcName=stringToLowerCase(name);hookEvent.attrName=lcName;hookEvent.attrValue=value;hookEvent.keepAttr=true;hookEvent.forceKeepAttr=undefined;_executeHook("uponSanitizeAttribute",currentNode,hookEvent);value=hookEvent.attrValue;if(hookEvent.forceKeepAttr){continue}if(lcName==="name"&&currentNode.nodeName==="IMG"&&attributes.id){idAttr=attributes.id;attributes=arraySlice(attributes,[]);_removeAttribute("id",currentNode);_removeAttribute(name,currentNode);if(arrayIndexOf(attributes,idAttr)>l){currentNode.setAttribute("id",idAttr.value);}}else if(currentNode.nodeName==="INPUT"&&lcName==="type"&&value==="file"&&hookEvent.keepAttr&&(ALLOWED_ATTR[lcName]||!FORBID_ATTR[lcName])){continue}else {if(name==="id"){currentNode.setAttribute(name,"");}_removeAttribute(name,currentNode);}if(!hookEvent.keepAttr){continue}if(SAFE_FOR_JQUERY&&regExpTest(/\/>/i,value)){_removeAttribute(name,currentNode);continue}if(regExpTest(/svg|math/i,currentNode.namespaceURI)&&regExpTest(regExpCreate("</("+arrayJoin(objectKeys(FORBID_CONTENTS),"|")+")","i"),value)){_removeAttribute(name,currentNode);continue}if(SAFE_FOR_TEMPLATES){value=stringReplace(value,MUSTACHE_EXPR$$1," ");value=stringReplace(value,ERB_EXPR$$1," ");}var lcTag=currentNode.nodeName.toLowerCase();if(!_isValidAttribute(lcTag,lcName,value)){continue}try{if(namespaceURI){currentNode.setAttributeNS(namespaceURI,name,value);}else {currentNode.setAttribute(name,value);}arrayPop(DOMPurify.removed);}catch(_){}}_executeHook("afterSanitizeAttributes",currentNode,null);};var _sanitizeShadowDOM=function _sanitizeShadowDOM(fragment){var shadowNode=void 0;var shadowIterator=_createIterator(fragment);_executeHook("beforeSanitizeShadowDOM",fragment,null);while(shadowNode=shadowIterator.nextNode()){_executeHook("uponSanitizeShadowNode",shadowNode,null);if(_sanitizeElements(shadowNode)){continue}if(shadowNode.content instanceof DocumentFragment){_sanitizeShadowDOM(shadowNode.content);}_sanitizeAttributes(shadowNode);}_executeHook("afterSanitizeShadowDOM",fragment,null);};DOMPurify.sanitize=function(dirty,cfg){var body=void 0;var importedNode=void 0;var currentNode=void 0;var oldNode=void 0;var returnNode=void 0;if(!dirty){dirty="\x3c!--\x3e";}if(typeof dirty!=="string"&&!_isNode(dirty)){if(typeof dirty.toString!=="function"){throw typeErrorCreate("toString is not a function")}else {dirty=dirty.toString();if(typeof dirty!=="string"){throw typeErrorCreate("dirty is not a string, aborting")}}}if(!DOMPurify.isSupported){if(_typeof(window.toStaticHTML)==="object"||typeof window.toStaticHTML==="function"){if(typeof dirty==="string"){return window.toStaticHTML(dirty)}if(_isNode(dirty)){return window.toStaticHTML(dirty.outerHTML)}}return dirty}if(!SET_CONFIG){_parseConfig(cfg);}DOMPurify.removed=[];if(typeof dirty==="string"){IN_PLACE=false;}if(IN_PLACE);else if(dirty instanceof Node){body=_initDocument("\x3c!--\x3e");importedNode=body.ownerDocument.importNode(dirty,true);if(importedNode.nodeType===1&&importedNode.nodeName==="BODY"){body=importedNode;}else if(importedNode.nodeName==="HTML"){body=importedNode;}else {body.appendChild(importedNode);}}else {if(!RETURN_DOM&&!SAFE_FOR_TEMPLATES&&!WHOLE_DOCUMENT&&RETURN_TRUSTED_TYPE&&dirty.indexOf("<")===-1){return trustedTypesPolicy?trustedTypesPolicy.createHTML(dirty):dirty}body=_initDocument(dirty);if(!body){return RETURN_DOM?null:emptyHTML}}if(body&&FORCE_BODY){_forceRemove(body.firstChild);}var nodeIterator=_createIterator(IN_PLACE?dirty:body);while(currentNode=nodeIterator.nextNode()){if(currentNode.nodeType===3&&currentNode===oldNode){continue}if(_sanitizeElements(currentNode)){continue}if(currentNode.content instanceof DocumentFragment){_sanitizeShadowDOM(currentNode.content);}_sanitizeAttributes(currentNode);oldNode=currentNode;}oldNode=null;if(IN_PLACE){return dirty}if(RETURN_DOM){if(RETURN_DOM_FRAGMENT){returnNode=createDocumentFragment.call(body.ownerDocument);while(body.firstChild){returnNode.appendChild(body.firstChild);}}else {returnNode=body;}if(RETURN_DOM_IMPORT){returnNode=importNode.call(originalDocument,returnNode,true);}return returnNode}var serializedHTML=WHOLE_DOCUMENT?body.outerHTML:body.innerHTML;if(SAFE_FOR_TEMPLATES){serializedHTML=stringReplace(serializedHTML,MUSTACHE_EXPR$$1," ");serializedHTML=stringReplace(serializedHTML,ERB_EXPR$$1," ");}return trustedTypesPolicy&&RETURN_TRUSTED_TYPE?trustedTypesPolicy.createHTML(serializedHTML):serializedHTML};DOMPurify.setConfig=function(cfg){_parseConfig(cfg);SET_CONFIG=true;};DOMPurify.clearConfig=function(){CONFIG=null;SET_CONFIG=false;};DOMPurify.isValidAttribute=function(tag,attr,value){if(!CONFIG){_parseConfig({});}var lcTag=stringToLowerCase(tag);var lcName=stringToLowerCase(attr);return _isValidAttribute(lcTag,lcName,value)};DOMPurify.addHook=function(entryPoint,hookFunction){if(typeof hookFunction!=="function"){return}hooks[entryPoint]=hooks[entryPoint]||[];arrayPush(hooks[entryPoint],hookFunction);};DOMPurify.removeHook=function(entryPoint){if(hooks[entryPoint]){arrayPop(hooks[entryPoint]);}};DOMPurify.removeHooks=function(entryPoint){if(hooks[entryPoint]){hooks[entryPoint]=[];}};DOMPurify.removeAllHooks=function(){hooks={};};return DOMPurify}var purify=createDOMPurify();marked_1.setOptions({headerIds:false});const parse=markdown=>html`
    ${!markdown?nothing:unsafeHTML(purify.sanitize(marked_1(markdown)).replace(/<(h[1-6]|a|p|ul|ol|li|pre|code|strong|em|blockquote|del)(\s+href="[^"]+")*>/g,'<$1 part="md-$1"$2>'))}
  `;const TemplateTypes=Object.freeze({HOST:"host",KNOB:"knob",SLOT:"slot",PREFIX:"prefix",SUFFIX:"suffix",WRAPPER:"wrapper"});const isPropMatch=name=>prop=>prop.attribute===name||prop.name===name;const unquote=value=>typeof value==="string"&&value.startsWith('"')&&value.endsWith('"')?value.slice(1,value.length-1):value;let panelIdCounter=0;let ApiViewerPanel=class ApiViewerPanel extends LitElement{static get styles(){return css`
      :host {
        display: block;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
      }

      :host([hidden]) {
        display: none !important;
      }
    `}render(){return html`<slot></slot>`}firstUpdated(){this.setAttribute("role","tabpanel");if(!this.id){this.id=`api-viewer-panel-${panelIdCounter++}`;}}};ApiViewerPanel=__decorate([customElement("api-viewer-panel")],ApiViewerPanel);let tabIdCounter=0;let ApiViewerTab=class ApiViewerTab extends LitElement{constructor(){super(...arguments);this.selected=false;this.heading="";this.active=false;this._mousedown=false;}static get styles(){return css`
      :host {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        box-sizing: border-box;
        position: relative;
        max-width: 150px;
        overflow: hidden;
        min-height: 3rem;
        padding: 0 1rem;
        color: var(--ave-tab-color);
        font-size: 0.875rem;
        line-height: 1.2;
        font-weight: 500;
        text-transform: uppercase;
        outline: none;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host::before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--ave-tab-indicator-size);
        background-color: var(--ave-primary-color);
        opacity: 0;
      }

      :host([selected]) {
        color: var(--ave-primary-color);
      }

      :host([selected])::before {
        opacity: 1;
      }

      :host::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: var(--ave-primary-color);
        opacity: 0;
        transition: opacity 0.1s linear;
      }

      :host(:hover)::after {
        opacity: 0.08;
      }

      :host([focus-ring])::after {
        opacity: 0.12;
      }

      :host([active])::after {
        opacity: 0.16;
      }

      @media (max-width: 600px) {
        :host {
          justify-content: center;
          text-align: center;
        }

        :host::before {
          top: auto;
          right: 0;
          width: 100%;
          height: var(--ave-tab-indicator-size);
        }
      }
    `}render(){return html`${this.heading}`}firstUpdated(){this.setAttribute("role","tab");if(!this.id){this.id=`api-viewer-tab-${tabIdCounter++}`;}this.addEventListener("focus",()=>this._setFocused(true),true);this.addEventListener("blur",()=>{this._setFocused(false);this._setActive(false);},true);this.addEventListener("mousedown",()=>{this._setActive(this._mousedown=true);const mouseUpListener=()=>{this._setActive(this._mousedown=false);document.removeEventListener("mouseup",mouseUpListener);};document.addEventListener("mouseup",mouseUpListener);});}updated(props){if(props.has("selected")){this.setAttribute("aria-selected",String(this.selected));this.setAttribute("tabindex",this.selected?"0":"-1");}}_setActive(active){this.toggleAttribute("active",active);}_setFocused(focused){this.toggleAttribute("focused",focused);this.toggleAttribute("focus-ring",focused&&!this._mousedown);}};__decorate([property({type:Boolean,reflect:true})],ApiViewerTab.prototype,"selected",void 0);__decorate([property()],ApiViewerTab.prototype,"heading",void 0);__decorate([property({type:Boolean})],ApiViewerTab.prototype,"active",void 0);ApiViewerTab=__decorate([customElement("api-viewer-tab")],ApiViewerTab);const KEYCODE={DOWN:40,LEFT:37,RIGHT:39,UP:38,HOME:36,END:35};let ApiViewerTabs=class ApiViewerTabs extends LitElement{constructor(){super(...arguments);this._boundSlotChange=this._onSlotChange.bind(this);}static get styles(){return css`
      :host {
        display: flex;
      }

      .tabs {
        display: block;
      }

      @media (max-width: 600px) {
        :host {
          flex-direction: column;
        }

        .tabs {
          flex-grow: 1;
          display: flex;
          align-self: stretch;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    `}render(){return html`
      <div class="tabs">
        <slot name="tab"></slot>
      </div>
      <slot name="panel"></slot>
    `}firstUpdated(){this.setAttribute("role","tablist");this.addEventListener("keydown",this._onKeyDown);this.addEventListener("click",this._onClick);const[tabSlot,panelSlot]=Array.from(this.renderRoot.querySelectorAll("slot"));if(tabSlot&&panelSlot){tabSlot.addEventListener("slotchange",this._boundSlotChange);panelSlot.addEventListener("slotchange",this._boundSlotChange);}Promise.all([...this._allTabs(),...this._allPanels()].map(el=>el.updateComplete)).then(()=>{this._linkPanels();});}_onSlotChange(){this._linkPanels();}_linkPanels(){const tabs=this._allTabs();tabs.forEach(tab=>{const panel=tab.nextElementSibling;tab.setAttribute("aria-controls",panel.id);panel.setAttribute("aria-labelledby",tab.id);});const selectedTab=tabs.find(tab=>tab.selected)||tabs[0];this._selectTab(selectedTab);}_allPanels(){return Array.from(this.querySelectorAll("api-viewer-panel"))}_allTabs(){return Array.from(this.querySelectorAll("api-viewer-tab"))}_getAvailableIndex(idx,increment){const tabs=this._allTabs();const total=tabs.length;for(let i=0;typeof idx==="number"&&i<total;i++,idx+=increment||1){if(idx<0){idx=total-1;}else if(idx>=total){idx=0;}const tab=tabs[idx];if(!tab.hasAttribute("hidden")){return idx}}return -1}_panelForTab(tab){const panelId=tab.getAttribute("aria-controls");return this.querySelector(`#${panelId}`)}_prevTab(){const tabs=this._allTabs();const newIdx=this._getAvailableIndex(tabs.findIndex(tab=>tab.selected)-1,-1);return tabs[(newIdx+tabs.length)%tabs.length]}_firstTab(){const tabs=this._allTabs();return tabs[0]}_lastTab(){const tabs=this._allTabs();return tabs[tabs.length-1]}_nextTab(){const tabs=this._allTabs();const newIdx=this._getAvailableIndex(tabs.findIndex(tab=>tab.selected)+1,1);return tabs[newIdx%tabs.length]}reset(){const tabs=this._allTabs();const panels=this._allPanels();tabs.forEach(tab=>{tab.selected=false;});panels.forEach(panel=>{panel.hidden=true;});}selectFirst(){const tabs=this._allTabs();const idx=this._getAvailableIndex(0,1);this._selectTab(tabs[idx%tabs.length]);}_selectTab(newTab){this.reset();const newPanel=this._panelForTab(newTab);if(!newPanel){throw new Error("No panel with for tab")}newTab.selected=true;newPanel.hidden=false;}_onKeyDown(event){const{target:target}=event;if((target&&target instanceof ApiViewerTab)===false){return}if(event.altKey){return}let newTab;switch(event.keyCode){case KEYCODE.LEFT:case KEYCODE.UP:newTab=this._prevTab();break;case KEYCODE.RIGHT:case KEYCODE.DOWN:newTab=this._nextTab();break;case KEYCODE.HOME:newTab=this._firstTab();break;case KEYCODE.END:newTab=this._lastTab();break;default:return}event.preventDefault();this._selectTab(newTab);newTab.focus();}_onClick(event){const{target:target}=event;if(target&&target instanceof ApiViewerTab){this._selectTab(target);target.focus();}}};ApiViewerTabs=__decorate([customElement("api-viewer-tabs")],ApiViewerTabs);const renderItem=(prefix,name,description,valueType,value,attribute)=>html`
    <div part="docs-item">
      <div part="docs-row">
        <div part="docs-column" class="column-name-${prefix}">
          <div part="docs-label">Name</div>
          <div part="docs-value" class="accent">${name}</div>
        </div>
        ${attribute===undefined?nothing:html`
              <div part="docs-column">
                <div part="docs-label">Attribute</div>
                <div part="docs-value">${attribute}</div>
              </div>
            `}
        ${valueType===undefined&&value===undefined?nothing:html`
              <div part="docs-column" class="column-type">
                <div part="docs-label">Type</div>
                <div part="docs-value">
                  ${valueType||(Number.isNaN(Number(value))?typeof value:"number")}
                  ${value===undefined?nothing:html` = <span class="accent">${value}</span> `}
                </div>
              </div>
            `}
      </div>
      <div ?hidden="${description===undefined}">
        <div part="docs-label">Description</div>
        <div part="docs-markdown">${parse(description)}</div>
      </div>
    </div>
  `;const renderTab=(heading,array,content)=>{const hidden=array.length===0;return html`
    <api-viewer-tab
      heading="${heading}"
      slot="tab"
      part="tab"
      ?hidden="${hidden}"
    ></api-viewer-tab>
    <api-viewer-panel slot="panel" part="tab-panel" ?hidden="${hidden}">
      ${content}
    </api-viewer-panel>
  `};let ApiViewerDocs=class ApiViewerDocs extends LitElement{constructor(){super(...arguments);this.name="";this.props=[];this.attrs=[];this.slots=[];this.events=[];this.cssParts=[];this.cssProps=[];}createRenderRoot(){return this}render(){const{slots:slots,props:props,attrs:attrs,events:events,cssParts:cssParts,cssProps:cssProps}=this;const properties=props||[];const attributes=(attrs||[]).filter(({name:name})=>!properties.some(isPropMatch(name)));const emptyDocs=[properties,attributes,slots,events,cssProps,cssParts].every(arr=>arr.length===0);return emptyDocs?html`
          <div part="warning">
            The element &lt;${this.name}&gt; does not provide any documented
            API.
          </div>
        `:html`
          <api-viewer-tabs>
            ${renderTab("Properties",properties,html`
                ${properties.map(prop=>{const{name:name,description:description,type:type,attribute:attribute}=prop;return renderItem("prop",name,description,type,prop.default,attribute)})}
              `)}
            ${renderTab("Attributes",attributes,html`
                ${attributes.map(({name:name,description:description,type:type})=>renderItem("attr",name,description,type))}
              `)}
            ${renderTab("Slots",slots,html`
                ${slots.map(({name:name,description:description})=>renderItem("slot",name,description))}
              `)}
            ${renderTab("Events",events,html`
                ${events.map(({name:name,description:description})=>renderItem("event",name,description))}
              `)}
            ${renderTab("CSS Custom Properties",cssProps,html`
                ${cssProps.map(prop=>{const{name:name,description:description,type:type}=prop;return renderItem("css",name,description,type,unquote(prop.default))})}
              `)}
            ${renderTab("CSS Shadow Parts",cssParts,html`
                ${cssParts.map(({name:name,description:description})=>renderItem("part",name,description))}
              `)}
          </api-viewer-tabs>
        `}updated(props){if(props.has("name")&&props.get("name")){const tabs=this.renderRoot.querySelector("api-viewer-tabs");if(tabs){tabs.selectFirst();}}}};__decorate([property()],ApiViewerDocs.prototype,"name",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"props",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"attrs",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"slots",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"events",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"cssParts",void 0);__decorate([property({attribute:false})],ApiViewerDocs.prototype,"cssProps",void 0);ApiViewerDocs=__decorate([customElement("api-viewer-docs")],ApiViewerDocs);let ApiDocsContent=class ApiDocsContent extends LitElement{constructor(){super(...arguments);this.elements=[];this.selected=0;}createRenderRoot(){return this}render(){const{elements:elements,selected:selected}=this;const{name:name,description:description,properties:properties,attributes:attributes,slots:slots,events:events,cssParts:cssParts,cssProperties:cssProperties}={...EMPTY_ELEMENT,...elements[selected]||{}};const cssProps=(cssProperties||[]).sort((a,b)=>a.name>b.name?1:-1);return html`
      <header part="header">
        <div part="header-title">&lt;${name}&gt;</div>
        <nav>
          <label part="select-label">
            <select
              @change="${this._onSelect}"
              .value="${String(selected)}"
              ?hidden="${elements.length===1}"
              part="select"
            >
              ${elements.map((tag,idx)=>html`<option value="${idx}">${tag.name}</option>`)}
            </select>
          </label>
        </nav>
      </header>
      <div ?hidden="${description===""}" part="docs-description">
        ${parse(description)}
      </div>
      <api-viewer-docs
        .name="${name}"
        .props="${properties}"
        .attrs="${attributes}"
        .events="${events}"
        .slots="${slots}"
        .cssParts="${cssParts}"
        .cssProps="${cssProps}"
      ></api-viewer-docs>
    `}_onSelect(e){this.selected=Number(e.target.value);}};__decorate([property({attribute:false})],ApiDocsContent.prototype,"elements",void 0);__decorate([property({type:Number})],ApiDocsContent.prototype,"selected",void 0);ApiDocsContent=__decorate([customElement("api-docs-content")],ApiDocsContent);async function renderDocs(jsonFetched,selected){const elements=await jsonFetched;const index=elements.findIndex(el=>el.name===selected);return elements.length?html`
        <api-docs-content
          .elements="${elements}"
          .selected="${index>=0?index:0}"
        ></api-docs-content>
      `:emptyDataWarning}class ApiDocsBase extends(ApiViewerMixin(LitElement)){render(){return html`${until(renderDocs(this.jsonFetched,this.selected))}`}}var docsStyles=css`
  p,
  ul,
  ol {
    margin: 1rem 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  a {
    color: var(--ave-link-color);
  }

  a:hover {
    color: var(--ave-link-hover-color);
  }

  pre {
    white-space: pre-wrap;
  }

  api-viewer-docs {
    display: block;
  }

  [part='tab'][heading^='CSS'] {
    min-width: 120px;
    font-size: 0.8125rem;
  }

  [part='docs-item'] {
    display: block;
    padding: 0.5rem;
    color: var(--ave-item-color);
  }

  [part='docs-item']:not(:first-of-type) {
    border-top: solid 1px var(--ave-border-color);
  }

  [part='docs-description'] {
    display: block;
    padding: 0 1rem;
    border-bottom: solid 1px var(--ave-border-color);
  }

  [part='docs-row'] {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  [part='docs-column'] {
    box-sizing: border-box;
    flex-basis: 25%;
    padding-right: 0.5rem;
  }

  [part='docs-column']:only-child {
    flex-basis: 100%;
  }

  .column-name-css,
  .column-type {
    flex-basis: 50%;
  }

  [part='docs-label'] {
    color: var(--ave-label-color);
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.1rem;
  }

  [part='docs-value'] {
    font-family: var(--ave-monospace-font);
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  [part='docs-markdown'] p,
  [part='docs-markdown'] ul,
  [part='docs-markdown'] ol {
    margin: 0.5rem 0;
  }

  .accent {
    color: var(--ave-accent-color);
  }

  @media (max-width: 480px) {
    .column-type {
      margin-top: 1rem;
    }

    .column-name-css,
    .column-type {
      flex-basis: 100%;
    }

    [part='tab'][heading^='CSS'] {
      max-width: 125px;
    }
  }
`;var sharedStyles=css`
  :host {
    display: block;
    text-align: left;
    box-sizing: border-box;
    max-width: 800px;
    min-width: 360px;
    font-size: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Oxygen-Sans', Ubuntu, Cantarell, sans-serif;
    border: 1px solid var(--ave-border-color);
    border-radius: var(--ave-border-radius);

    --ave-primary-color: #01579b;
    --ave-accent-color: #d63200;
    --ave-border-color: rgba(0, 0, 0, 0.12);
    --ave-border-radius: 4px;
    --ave-header-color: #fff;
    --ave-item-color: rgba(0, 0, 0, 0.87);
    --ave-label-color: #424242;
    --ave-link-color: #01579b;
    --ave-link-hover-color: #d63200;
    --ave-tab-indicator-size: 2px;
    --ave-tab-color: rgba(0, 0, 0, 0.54);
    --ave-monospace-font: Menlo, 'DejaVu Sans Mono', 'Liberation Mono', Consolas,
      'Courier New', monospace;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: var(--ave-primary-color);
    border-top-left-radius: var(--ave-border-radius);
    border-top-right-radius: var(--ave-border-radius);
  }

  nav {
    display: flex;
    align-items: center;
  }

  [part='header-title'] {
    color: var(--ave-header-color);
    font-family: var(--ave-monospace-font);
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  [part='select-label'] {
    margin-left: 0.5rem;
  }

  [part='warning'] {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    header {
      flex-direction: column;
    }

    nav {
      margin-top: 0.5rem;
    }
  }
`;let ApiDocs=class ApiDocs extends ApiDocsBase{static get styles(){return [sharedStyles,docsStyles,css`
        api-docs-content {
          display: block;
        }
      `]}};ApiDocs=__decorate([customElement("api-docs")],ApiDocs);var apiDocs=Object.freeze({__proto__:null,get ApiDocs(){return ApiDocs}});

var apiDocs_litHtml = /*#__PURE__*/Object.freeze({
  __proto__: null,
  packd_export_0: apiDocs,
  packd_export_1: litHtml
});

var ce_json = {
  "version": "experimental",
  "tags": [
    {
      "name": "block-link",
      "description": "A simple and super lightweight web component to create block links.",
      "attributes": [
        {
          "name": "main-link",
          "description": "Selector that identifies the main link",
          "type": "String"
        },
        {
          "name": "mainlink",
          "description": "Selector that identifies the main link",
          "type": "String"
        }
      ],
      "properties": [
        {
          "name": "mainLink",
          "type": "string",
          "default": "\"a\""
        }
      ]
    }
  ]
};

const ATTRIBUTE_MAP = {
  "main-link": "mainLink",
  mainlink: "mainLink"
};
const DEFAULT_SELECTOR = "a";
const LINK_REGEX = /^(block-link|a)$/i;
/**
 * A simple and super lightweight web component to create block links.
 * @attr {String} main-link - Selector that identifies the main link
 * @attr {String} mainlink - Selector that identifies the main link
 */

class BlockLink extends HTMLElement {
  constructor() {
    super();
    this.mainLink = DEFAULT_SELECTOR;
    const css = `:host { display: block; }`;
    const html = `<slot></slot>`;
    this.attachShadow({
      mode: "open"
    });
    this.shadowRoot.innerHTML = `
    <style>${css}</style>
    ${html}
    `;
  }

  static get observedAttributes() {
    return ["main-link", "mainlink"];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal !== newVal) {
      this[ATTRIBUTE_MAP[attr]] = newVal;
    }
  }

  connectedCallback() {
    this.addEventListener("click", this._clicked);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._clicked);
  }

  get _mainLinkNode() {
    const custom = this.querySelector(this.mainLink);
    const fallback = this.querySelector(DEFAULT_SELECTOR);
    return custom && LINK_REGEX.test(custom.tagName) ? custom : fallback;
  }
  /**
   * Triggers a click on this component's main link.
   */


  click() {
    if (!this._mainLinkNode) {
      return;
    }

    this._mainLinkNode.click();
  }

  _clicked(e) {
    e.stopPropagation();
    const selection = window.getSelection();
    const textSelected = selection.containsNode(this, true) && !!selection.toString();
    const innerLinkClicked = e.target !== this && LINK_REGEX.test(e.target.tagName);

    if (innerLinkClicked || textSelected) {
      return;
    }

    this.click();
  }

}

customElements.define("block-link", BlockLink);

const { html: html$2 } = litHtml;    
try {
  customElements.define('mdjs-story', class extends HTMLElement {
    constructor(){
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = '<div id="root"><p>Loading...</p></div>';
    }
    set story(story){
      renderWith(require,story(),this.shadowRoot.querySelector('#root'));
    }
  });
} catch (e) {}
    
try {
  customElements.define('mdjs-preview', class extends HTMLElement {
    connectedCallback(){
      this.innerHTML = `
      <mdjs-story></mdjs-story>
      <details>
        <summary style="text-align: center;user-select: none;">
          show code
        </summary>
        <pre><code class="hljs"></code></pre>
      </details>`;
    }
    set story(story){
      this.querySelector('mdjs-story').story = story;
    }
    set code(code){
      this.querySelector('code').textContent = code;
    }
  });
} catch (e) {}
    const story1 = () =>
  html$2`<style>
      ::part(header) {
        // display: none;
      }
      ::part(docs-description) {
        // display: none;
      }
    </style>
    <api-docs .elements="${ce_json.tags}"></api-docs>`;
    const rootNode = document;
    const stories = [{ key: 'story1', story: story1, code: story1 }];
    for (const story of stories) {
      // eslint-disable-next-line no-template-curly-in-string
      const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);
      storyEl.story = story.story;
      storyEl.code = story.code;
    }

export { story1 };
