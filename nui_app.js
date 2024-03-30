'use strict';
import ut from './nui_ut.js';
let css_vars;
let appTools = {renderWindow:renderWindow};

/* App Tools
##########################################################################################
########################################################################################## */

async function renderWindow(prop){
    return new Promise(async (resolve, rejcet) => {
        let html = renderHTML(prop);
        await checkCSS('./nui/css/nui_app.css', '--nui-app');
        ut.killKids(document.body);
        document.body.appendChild(html);
        resolve(html);
    })
}

function renderHTML(prop){
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