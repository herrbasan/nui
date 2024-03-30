'use strict';
import ut from '../nui_ut.js';
import Sortable from '../lib/sortable.js'
import mediaPlayer from '../nui_media_player.js';

let settings = {};

function init(prop) {
    return new Promise((resolve, reject) => {
        settings = prop;
        resolve(render);
    })
}

function render(prop){
    let html = ut.htmlObject(/*html*/`
        <div class="nui-cms-media files">
            <div class="content nui-card">
                <div class="buttons">
                    <button class="btn_upload nui-icon">${ut.icon('upload', true)}</button>
                    <button class="btn_browse nui-icon">${ut.icon('media_folder', true)}</button>
                </div>
                <div class="media"></div>
                <div class="background">${ut.icon('image')}</div>
            </div>
            <ul class="thumbs files nui-card">
                
            </ul>
        </div>
    `)
    html.media = html.el('.media');
    html.btn_upload = html.el('.btn_upload');
    html.btn_browse = html.el('.btn_browse'); 
    html.thumbs = html.el('.thumbs');
    html.selection = 0;
    
    update();
    selectMedia(0);

    function update(){
        ut.killKids(html.thumbs);
        html.items = [];
        for(let i=0; i<prop.data.length; i++){
            if(!prop.data[i].name) { prop.data[i].name = prop.data[i].filename; }
            let item = ut.htmlObject(/*html*/`
                <li class="item" id="thumb_${i}">
                    <div class="handle">0</div>
                    <div class="pic"></div>
                    <div class="name">${prop.data[i].name}</div>
                    <div class="size">${ut.formatFileSize(prop.data[i].filesize)}</div>
                </li>
            `)
            console.log(prop.data[i])
            let url = settings.media_url(prop.data[i], 'thumb');
            if(prop.data[i].mime.split('/')[0] == 'image' || prop.data[i].mime.split('/')[0] == 'video'){
                if(prop.data[i].ticket){
                    let img = ut.createElement('img', { attributes:{src:'./images/loader.svg'}, target:item.el('.pic')})
                    window.g.media_ticket.push({ticket:prop.data[i].ticket , img:img, url:url, data:prop.data[i]});
                }
                else {
                    ut.createElement('img', { attributes:{src:url}, target:item.el('.pic')})
                }
            }
            else {
                let ext = prop.data[i].ext;
                if(!ext){ 
                    ut.createElement('div', {target:item.el('.pic'), class:'fileicon ' + ext, inner:``});
                }
                else {
                    ut.createElement('div', {target:item.el('.pic'), class:'fileicon ' + ext, inner:`<div class="extension">${ext}</div>`});
                }
            }
            html.thumbs.appendChild(item);
            item.idx = i;
            item.data = prop.data[i];
            editable(item.el('.name'), prop.data[i], 'name');
            item.addEventListener('click', (e) => {
 
                    selectMedia(i)
                
            })
           
            if(i == html.selection){
                item.addClass('selected')
            }
            html.items.push(item);
        }
        updateNumbers();
        let s_list = Sortable.create(html.thumbs, {removeOnSpill:true, group: {name:'shared', pull:false}, animation:150, onEnd:sortEnd})
    }

 
				

    function updateNumbers(){
        let els = html.els('.item');
        for(let i=0; i<els.length; i++){
            els[i].el('.handle').innerText = (i+1);
        }
    }

    function sortEnd(e){
        let els = html.els('.item');
        let out = []
        for(let i=0; i<els.length;i++){
            out.push(els[i].data);
        }
        prop.data = out;
        if(out.length == 0){
            clearImage();
        }
        updateNumbers();
    }

    function clearSelection(){
        for(let i=0; i<html.items.length; i++){
            html.items[i].removeClass('selected');
        }
    }

    function selectMedia(idx){
        if(html.items.length == 0) { return; }
        if(idx == html.currentSelection) { return; }
        html.currentSelection = idx;
        if(!idx) { idx = 0; }
        if(idx == -1) { idx = html.items.length-1; }
        clearImage();
        clearSelection();
        html.items[idx].addClass('selected');
        let data = html.items[idx].data;
        if(data.mime.split('/')[0] == 'image'){
            html.media.appendChild(renderImage(data));
        }
        if(data.mime.split('/')[0] == 'video' || data.mime.split('/')[0] == 'audio'){
            html.media.appendChild(renderVideo(data));
        }
    }

    function renderImage(data){
        let item = ut.createElement('div', {class:'media_item'});
        let img = new Image();
        let url = settings.media_url(data, 'big');
        if(data.ticket){
            img.src = './images/loader.svg';
            window.g.media_ticket.push({ticket:data.ticket , img:img, url:url, data:data.data});
        }
        else {
            img.src = url;
        }
        img.style.opacity = 0;
        img.addEventListener('load', (e) => {
            setTimeout(() => {img.style.opacity = null},10);
        }, {once:true})
        item.appendChild(img);
        return item;
    }

    function renderVideo(data){
        let item = ut.createElement('div', {class:'media_item'});
        if(data.mime.split('/')[0] == 'audio'){
            let player = item.appendChild(mediaPlayer({url:settings.media_url(data), type:'audio'}))
            let html = ut.htmlObject(/*html*/`
                <div class="cms_audio_info">
                    <div class="icon">${ut.icon('volume')}</div>
                    <div class="filename">${data.filename}</div>
                </div>
            `)
            player.el('.wrap').prepend(html)
        }
        else {
            item.appendChild(mediaPlayer({url:settings.media_url(data), hide_fs_button:true, poster:settings.media_url(data, 'big')}))
        }
        return item;
    }
    function clearImage(){
        let prev = html.media.els('.media_item')
        if(prev){
           for(let i=0; i<prev.length; i++){
            ut.killMe(prev[i])
           }
        }
        
    }
    
    html.img = html.el('.media img');
    
    let add = function() {
        settings.media_browser((items) => {
            if(!prop.data) { prop.data = []; }
            for(let i=0; i<items.length; i++){
                prop.data.push(items[i]);
            }
            update();
            selectMedia(-1);
        })
    }

    function upload(obj){
        settings.media_upload((items) => {
            if(!prop.data) { prop.data = []; }
            for(let i=0; i<items.length; i++){
                prop.data.push(items[i]);
            }
            update();
            selectMedia(-1);
        });
    }

    html.btn_browse.addEventListener('click', add);
    html.btn_upload.addEventListener('click', upload);
    html.destroy = () => {
        html.btn_browse.removeEventListener('click', add);
        html.btn_upload.removeEventListener('click', upload);
    }
    return html;
}

function editable(_el, data, key){
    _el.addEventListener('dblclick', showPrompt)
    function showPrompt(e){
        let prompt = nui.prompt('Change Item', [{id:'fld_'+key, label:`Change "${data[key]}" to:`, value:data[key]}], done)
        function done(action, values, prompt_cb){
            if(action != 'ok') { prompt_cb(); return; }
            let value = values['fld_'+key]
            
            if(!value || value == ''){
                data[key] = data.filename;
                _el.innerText = data.filename;
            }
            else {
                data[key] = value;
                _el.innerText = value;
            }
            prompt_cb();
        }
    }
}

export default init;