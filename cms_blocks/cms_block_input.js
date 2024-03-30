'use strict';
import ut from '../nui_ut.js';

function init() {
    return new Promise(async (resolve, reject) => {
        resolve(renderInput);
    })
}

function renderInput(prop){
    let html = ut.htmlObject(/*html*/`
        <div class="nui-input">
            <input value="${prop.data}">
        </div>
    `)
    return html;
}

export default init;