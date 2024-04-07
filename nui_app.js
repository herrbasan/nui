'use strict';
import ut from './nui_ut.js';
let css_vars;
let appTools = {
    appWindow:appWindow,
    dropZone:dropZone
};

/* App Tools
##########################################################################################
########################################################################################## */

async function appWindow(prop){
    return new Promise(async (resolve, rejcet) => {
        let html = renderWindowFrame(prop);
        await checkCSS('./nui/css/nui_app.css', '--nui-app');
        ut.killKids(document.body);
        document.body.appendChild(html);
        resolve(html);
    })
}

function renderWindowFrame(prop){
    let title = document.title || 'Window'
    let inner = prop?.inner || '';
    if(ut.isElement(inner)){ inner = inner.innerHTML}
    let html = ut.htmlObject(/*html*/`
    <div class="nui-app">
        <div class="nui-title-bar">
            <div class="title">
                <div class="nui-icon-container" onclick="document.body.classList.toggle('dark')">${prop?.icon || ut.icon('settings')}</div>
                <div class="label">${title}</div>
            </div>
            <div class="controls">
                <div class="nui-icon-container close">${ut.icon('close')}</div>
            </div>
        </div>
        <div class="nui-app-content">
            <div class="nui-app-main">${inner}</div>
        </div>
        <div class="nui-status-bar"></div>
    </div>
    `)

    if(prop.fnc_close){
        html.el('.nui-title-bar .close').addEventListener('click', prop.fnc_close);
    }
    else {
        if(window.electron_helper){
            html.el('.nui-title-bar .close').addEventListener('click', electron_helper.app.exit);
        }
    }

    if(window.electron_helper){
        window.electron_helper.window.hook_event('focus', winEvents);
	    window.electron_helper.window.hook_event('blur', winEvents);
    }
    function winEvents(sender, e){
        if(e.type == 'focus'){ ut.el('body').addClass('focus');}
        if(e.type == 'blur'){ ut.el('body').removeClass('focus');}
    }

    return html;
}

async function dropZone(ar, fnc, target){
    return new Promise(async (resolve, rejcet) => {
        let html = renderDropZone(ar, fnc);
        await checkCSS('./nui/css/nui_app.css', '--nui-app');
        if(target){ target.appendChild(html)}
        resolve(html);
    })
}

function renderDropZone(ar, fnc){
    console.log(ar)
    let id = 'dropzone_' + ut.id();
    if(!fnc) { fnc = console.log }
    let html = ut.htmlObject(/*html*/`
        <div id="${id}" class="nui-dropzone">
            <div class="nui-dropzone-content"></div>
        </div>
    `)
    html.content = html.el('.nui-dropzone-content');
    for(let i=0; i<ar.length; i++){
        let item = ut.createElement('div', {id:ar[i].name, class:'item', inner:ar[i].label, target:html.content});
        item.addEventListener('dragleave', dropzoneHover);
        item.addEventListener('dragenter', dropzoneHover);
    }
    window.dropzone = id;
    window.addEventListener('dragover', (e) => { e.preventDefault(); })
	window.addEventListener('dragleave', showDropzone)
	window.addEventListener('dragenter', showDropzone)
	window.addEventListener('drop', showDropzone)

    function dropzoneHover(e){
        if(e.type == 'dragenter'){
            e.currentTarget.addClass('active');
        }
        if(e.type == 'dragleave'){
            e.currentTarget.removeClass('active');
            if(!html.isOver){ html.removeClass('filedrag'); }
        }
    }

    async function showDropzone(e){
        if(e.type == 'dragenter'){
            html.addClass('filedrag');
            html.isOver = true;
        }
        if(e.type == 'dragleave'){
            html.isOver = false;
        }
        if(e.type == 'dragleave' && e.target.id == id){
            html.removeClass('filedrag');
        }
        if(e.type == 'drop'){
            html.removeClass('filedrag');
            let items = html.content.els('.item');
            for(let i=0; i<items.length; i++){
                items[i].removeClass('active');
            }
            e.preventDefault();
            
            fnc(e.dataTransfer.files);
        }
    }
    return html;
}

function checkCSS(url, prop){
	return new Promise(async (resolve, reject) => {
		if(!css_vars){
			css_vars = ut.getCssVars();
			if(!css_vars[prop]){
				console.log('Injecting ' + url)
				await ut.headImport({url:url, type:'css'});
			}
			css_vars = ut.getCssVars();
			resolve();
		}
		else {
			resolve();
		}
	})
}



export default appTools;
