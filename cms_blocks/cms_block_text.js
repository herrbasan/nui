'use strict';
import ut from '../nui_ut.js';

function init() {
    return new Promise(async (resolve, reject) => {
        resolve(renderTextArea);
    })
}

/* Block - Plaintext
########################################################################################################## */
function renderTextArea(prop){
    let html = ut.htmlObject(/*html*/`
        <div class="nui-input"><textarea>${prop.data}</textarea></div>
    `)

    html.editable = html.el('textarea');
    html.observer = new IntersectionObserver(grow, {threshold:0});
    html.observer.observe(html);

    function updateData(){ 
        grow();
        prop.data = html.editable.value 
    }
    function grow(){
        console.log('grow');
        html.editable.style.height = null;
        html.editable.style.height = (html.editable.scrollHeight + 5) + 'px';
    }

    html.editable.addEventListener('input', updateData);
    html.destroy = () => {
        html.observer.disconnect();
    }

    
    return html;
}

function renderTextField(prop){
    let html = ut.htmlObject(/*html*/`
        <div class="nui-input"><div class="nui-input-editable" contenteditable="true">${prop.data}</div></div>
    `)

    function cleanText(e) {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
    }

    function change(e){
        clearTimeout(html.change_timeout);
        html.change_timeout = setTimeout(updateData, 100);
    }
    function updateData(){ console.log('update'); prop.data = html.editable.innerHTML }
    html.editable = html.el('.nui-input-editable');
    html.editable.addEventListener('paste', cleanText);
    html.editable.addEventListener('input', change);
    html.destroy = () => {
        console.log('Text Field destroyed')
        clearTimeout(html.change_timeout);
        html.editable.removeEventListener('paste', cleanText);
        html.editable.removeEventListener('change', change);
    }

    
    return html;
}


export default init;