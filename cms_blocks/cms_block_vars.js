'use strict';
import ut from '../nui_ut.js';
import nui_select from '../nui_select.js';

let lang = 'en';
function init() {
    return new Promise(async (resolve, reject) => {
        resolve(renderInputs);
    })
}

function renderInputs(prop) {
    let events = [];
    let html = ut.htmlObject(/*html*/`
        <div class="nui-cms-input-group"></div>;
    `);
    for (let i = 0; i < prop.data.length; i++) {

        if (prop.data[i].type == 'input') {
            let input = ut.htmlObject(/*html*/`
                <div class="nui-input">
                    <label>${prop.data[i].label}</label>
                    <input value="${prop.data[i].data}">
                </div>
            `);
            let fld = input.el('input');
            fld.dataref = prop.data[i];

            fld.addEventListener('input', setInputData);
            events.push(fld);
            html.appendChild(input);
        }
        if (prop.data[i].type == 'select') {
            let out = ut.htmlObject(/*html*/`
                <div class="nui-input">
                    <label>${prop.data[i].label}</label>
                    <div class="select_wrap"></div>
                </div>
            `);
            let sel = nui_select(null, { target: out.el('.select_wrap'), options: prop.data[i].data });
            sel.dataref = prop.data[i];
            sel.addEventListener('change', setSelectData)
            html.appendChild(out);
        }
        if (prop.data[i].type == 'tags') {
            ut.jfetch(g.baseURL + '/col/list', { session: g.cookies.session, collection: prop.data[i].db }).then(ret => {
                let data = ret.message;
                let options = [];
                for (let n = 0; n < data.length; n++) {
                    let selected = false;
                    if(prop.data[i].data.includes(data[n]._id)) {
                        selected = true;
                    }
                    options.push({ name: data[n].lang[lang], value: data[n]._id, selected:selected})
                }
                let out = ut.htmlObject(/*html*/`
                    <div class="nui-input">
                        <label>${prop.data[i].label}</label>
                        <div class="select_wrap"></div>
                    </div>
                `);
                
                let sel = nui_select(null, { target: out.el('.select_wrap'), options: options, searchable: true, multiple: true, noresult: 'Add Tag ...', noresult_fnc: addTag });
                sel.addEventListener('change', (e) => { 
                    let selected = sel.getSelected();
                    let out = []
                    for(let n=0; n<selected.length; n++){
                        out.push(selected[n].id);
                    }
                    prop.data[i].data = out;
                 })
                function addTag(e) {
                    let search = e.target.closest('.superSelect').el('.ss-search-input').value;
                    let prompt = nui.prompt('Add Tag', [{id:'fld_tag_de', label:`DE`, value:search}, {id:'fld_tag_en', label:`EN`, value:search}], done)
                    function done(action, values, prompt_cb){
                        if(action != 'ok') { prompt_cb(); return; }
                        let obj = {name:'tag_' + ut.slugify(values.fld_tag_en), lang:{de:values.fld_tag_de, en:values.fld_tag_en}};
                        ut.jfetch(g.baseURL + '/col/add', {session: g.cookies.session, collection:prop.data[i].db, data:JSON.stringify(obj)}).then((res) => {
                            console.log(res);
                            sel.addOption({name:res.message.lang[lang], value:res.message._id, selected:true});
                            prop.data[i].data.push(res.message._id);
                            prompt_cb();
                        })
                    }
                }
                html.appendChild(out);
            });
        }
    }

    function setInputData(e) {
        e.currentTarget.dataref.data = e.currentTarget.value;
    }

    function setSelectData(e) {
        let data = e.currentTarget.dataref.data;
        let selected = e.currentTarget.getSelected();
        for (let i = 0; i < data.length; i++) {
            if (selected.find(item => item.id == data[i].value)) {
                data[i].selected = true;
            }
            else {
                data[i].selected = false;
            }
        }
    }

    function destroy() {
        for (let i = 0; i < events.length; i++) {
            events[i].removeEventListener('input', setInputData);
        }
        events = null;
        html = null;
    }

    html.destroy = destroy;

    return html;
}

export default init;