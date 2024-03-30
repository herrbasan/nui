'use strict';
import ut from '../nui_ut.js';

let fb = console.log;

function init() {
    return new Promise(async (resolve, reject) => {
        await loadRichTextEditor();
        resolve(renderRichTextEditor);
    })
}

/* Block - Richtext
########################################################################################################## */

function loadRichTextEditor(){
    return new Promise((resolve, reject) => {
        if(!window.trumbowyg){
            ut.headImport([
                {url:'./nui/lib/jquery.min.js', type:'js'}, 
            ]).then(() => {
                ut.headImport([
                    {url:'./nui/lib/trumbowyg/trumbowyg.min.js', type:'js'},
                    {url:'./nui/lib/trumbowyg/ui/trumbowyg.css', type:'css'}
                ]).then(() => {
                    resolve();
                })
            })
            
        }
    })
}

function renderRichTextEditor(prop) {
    let html = ut.htmlObject(`<div class="nui-richtext"><textarea></textarea></div>`);
    
    let editor_options = {
        autogrow: true,
        minimalLinks: true,
        removeformatPasted:true,
        allowTagsFromPaste: {
            allowedTags: ['h1','h2','h3','h4', 'p', 'br','blockquote']
        },
        semantic: {
            'div': 'div',
            'article' : 'article'
        },
        btns: [
            ['formatting'],
            ['strong', 'em'],
            ['link'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            /*['undo', 'redo'],*/
        ]
    }
   
    html.editor = $(html.el('textarea')).trumbowyg(editor_options);
    html.editor.on('tbwfocus', (e) => { html.addClass('active')})
    html.editor.on('tbwblur', (e) => { html.removeClass('active')})
    html.editor.on('tbwchange', change)
    html.editor.trumbowyg('html', prop.data);

    function change(){
        clearTimeout(html.change_timeout);
        html.change_timeout = setTimeout(updateData, 100);
    }
    function updateData(){ prop.data = html.getData(); }
    html.getData = () => { return html.editor.trumbowyg('html')}
    html.setData = (data) => { html.editor.trumbowyg('html', data); }
    html.destroy = () => { 
        clearTimeout(html.change_timeout);
        html.editor.off('tbwfocus', (e) => { html.addClass('active')})
        html.editor.off('tbwblur', (e) => { html.removeClass('active')})
        html.editor.off('tbwchange', change)
        html.editor.trumbowyg('destroy');
    }

	return html;
}


export default init;