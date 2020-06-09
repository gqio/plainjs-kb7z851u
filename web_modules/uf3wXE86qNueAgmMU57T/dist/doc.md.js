import { l as litHtml, r as require } from '../../__require-4c7628c6.js';

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

const renderWith = (require, storyResult, div) => __awaiter(void 0, void 0, void 0, function* () {
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

class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.count = 0;
    const style = `
      * {
        font-size: 200%;
      }

      span {
        width: 4rem;
        display: inline-block;
        text-align: center;
      }

      button {
        width: 4rem;
        height: 4rem;
        border: none;
        border-radius: 10px;
        background-color: seagreen;
        color: white;
      }
    `;
    const html = `
    <button id="dec" class="large btn">-</button>
    <span class="large value">${this.count}</span>
    <button id="inc" class="large btn">+</button>
    `;
    this.attachShadow({
      mode: "open"
    });
    this.shadowRoot.innerHTML = `
    <style>
      ${style}
    </style>
    ${html}
    `;
    this.buttonInc = this.shadowRoot.getElementById("inc");
    this.buttonDec = this.shadowRoot.getElementById("dec");
    this.spanValue = this.shadowRoot.querySelector("span");
    this.inc = this.inc.bind(this);
    this.dec = this.dec.bind(this);
  }

  inc() {
    this.count++;
    this.update();
  }

  dec() {
    this.count--;
    this.update();
  }

  update() {
    this.spanValue.innerText = this.count;
  }

  connectedCallback() {
    this.buttonInc.addEventListener("click", this.inc);
    this.buttonDec.addEventListener("click", this.dec);
  }

  disconnectedCallback() {
    this.buttonInc.removeEventListener("click", this.inc);
    this.buttonDec.removeEventListener("click", this.dec);
  }

}

customElements.define("my-counter", MyCounter);

const { html } = litHtml;const story1 = () => html`
  <my-counter></my-counter>
`;

const { html: html$1 } = litHtml;    
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
        <pre><code></code></pre>
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
    const myStory = () =>
  html$1`<div style="display:flex;justify-content:center">
    ${story1()}
  </div>`;
    const rootNode = document;
    const stories = [{ key: 'myStory', story: myStory, code: myStory }];
    for (const story of stories) {
      // eslint-disable-next-line no-template-curly-in-string
      const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);
      storyEl.story = story.story;
      storyEl.code = story.code;
    }

export { myStory };
