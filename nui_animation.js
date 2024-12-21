'use strict';
import ut from './nui_ut.js';

function ani(obj){
    let ani_default_options = { 
        duration:1000, 
        fill:'forwards',
        composit:'add',
        direction:'normal',
        delay:0,
        endDelay:0,
        iterationStart:0,
        iterations:1

    }
    if(obj.options){
        for(let key in obj.options){
            ani_default_options[key] = obj.options[key];
        }
    }
    obj.options = ani_default_options;
    let keyframes = new KeyframeEffect(obj.el, parseProps(obj.props), obj.options)
    let mation = new Animation(keyframes, document.timeline);
    let loopStop = true;
    let ani = {};
    ani.animation = mation;
    ani.duration = obj.options.duration;
    ani.stops = [];
    for(let i=0; i<obj.props.length; i++){
        if(!obj.props[i].offset){
            if(i == 0){
                obj.props[i].offset = 0;
            }
            else if(i == obj.props.length-1){
                obj.props[i].offset = 1;
            }
            else {
                obj.props[i].offset = i/obj.props.length;
            }
        }
        ani.stops.push(obj.props[i].offset);
    }
    
    reset();
    if(!obj.paused) { loop(); play(); }
    else { obj.el.css(parseProp(obj.props[0])); }
    
    mation.onfinish = finish;
    mation.onremove = remove;
    mation.oncancel = cancel;
    
    ani.play = play;
    ani.pause = pause;
    ani.cancel = cancel;
    ani.update = update;

    function play(time){ 
        events('start');
        if(time != undefined){mation.currentTime = time};
        loopStop = false; 
        mation.play(); 
        loop(); 
    }

    function cancel(){
        events('cancel');
        mation.cancel();
    }

    function pause(){ 
        events('pause'); 
        mation.pause();
    }

    function remove(e){ events('remove'); loopStop = true; }
    
    function finish(e){
        events('finished');
        loopStop = true;
        if(obj.cb) { obj.cb(ani); }
    }

    function reset(){
        ani.lastTime = 0;
        ani.currentTime = 0;
        ani.currentFrame = 0;
        ani.state = 'init';
        ani.lastState = '';
        ani.currentKeyframe = 0;
    }

    function events(msg, data){
        if(obj.events) {
            obj.events({type:msg, target:ani});
        }
    }

    function update(){
        if(mation?.currentTime != ani.lastTime){
            ani.currentTime = mation.currentTime;
            ani.lastTime = ani.currentTime;
            ani.progress = ani.currentTime / obj.options.duration;
        }
        if(ani.lastState != mation.playState){
            ani.lastState = mation.playState;
            events(mation.playState)
        }
        let idx = checkforKeyframe();
        if(ani.currentKeyframe != idx){
            ani.currentKeyframe = idx;
            events('keyframe', {idx:idx});
        }
        if(obj.update) {
            obj.update(ani); 
        }
    }

    function checkforKeyframe(){
        let idx = 0;
        for(let i=0; i<ani.stops.length; i++){
            if(ani.progress >= ani.stops[i]){
                idx = i;
            }
        }
        return idx;
    }

    function loop(){
        if(mation){ update();}
        if(!loopStop){ requestAnimationFrame(loop); }
    }

    function parseProps(props){
        if(!(props instanceof Array)){
            return parseProp(props);
        }
        let out = [];
        for(let i=0; i<props.length; i++){
            out.push(parseProp(props[i]))
        }
        return out;
    }
    
    function parseProp(props){
        let tmpl = {
            tx:{template:'translateX', transform:true, defaultMetric:'px'},
            ty:{template:'translateY', transform:true, defaultMetric:'px'},
            tz:{template:'translateZ', transform:true, defaultMetric:'px'},
            scaleX:{template:'scaleX', transform:true, defaultMetric:false},
            scaleY:{template:'scaleY', transform:true, defaultMetric:false},
            scale:{template:'scale', transform:true, defaultMetric:false},
            rotate:{template:'rotate', transform:true, defaultMetric:'deg'},
            x:{template:'left', defaultMetric:'px'},
            y:{template:'top', defaultMetric:'px'},
            width:{defaultMetric:'px'},
            height:{defaultMetric:'px'},
        }
    
        let ease = {
            sine:{
                in:'cubic-bezier(0.13, 0, 0.39, 0)',
                out:'cubic-bezier(0.61, 1, 0.87, 1)',
                inOut:'cubic-bezier(0.36, 0, 0.64, 1)'
            },
            quad:{
                in:'cubic-bezier(0.11, 0, 0.5, 0)',
                out:'cubic-bezier(0.5, 1, 0.89, 1)',
                inOut:'cubic-bezier(0.44, 0, 0.56, 1)'
            },
            cubic:{
                in:'cubic-bezier(0.32, 0, 0.67, 0)',
                out:'cubic-bezier(0.33, 1, 0.68, 1)',
                inOut:'cubic-bezier(0.66, 0, 0.34, 1)'
            },
            quart:{
                in:'cubic-bezier(0.5, 0, 0.75, 0)',
                out:'cubic-bezier(0.25, 1, 0.5, 1)',
                inOut:'cubic-bezier(0.78, 0, 0.22, 1)'
            },
            quint:{
                in:'cubic-bezier(0.64, 0, 0.78, 0)',
                out:'cubic-bezier(0.22, 1, 0.36, 1)',
                inOut:'cubic-bezier(0.86, 0, 0.14, 1)'
            },
            expo:{
                in:'cubic-bezier(0.7, 0, 0.84, 0)',
                out:'cubic-bezier(0.16, 1, 0.3, 1)',
                inOut:'cubic-bezier(0.9, 0, 0.1, 1)'
            },
            circ:{
                in:'cubic-bezier(0.55, 0, 1, 0.45)',
                out:'cubic-bezier(0, 0.55, 0.45, 1)',
                inOut:'cubic-bezier(0.85, 0.09, 0.15, 0.91)'
            },
            back:{
                in:'cubic-bezier(0.36, 0, 0.66, -0.56)',
                out:'cubic-bezier(0.34, 1.56, 0.64, 1)',
                inOut:'cubic-bezier(0.8, -0.4, 0.5, 1)'
            }
        }
    
        let out = {transform:''}
        for(let key in props){
            if(key in tmpl){
                if(tmpl[key].transform){
                    out.transform += tmpl[key].template + '(' + dm(tmpl[key].defaultMetric, props[key]) + ') '
                } else {
                    if(tmpl[key].template){
                        out[tmpl[key].template] = dm(tmpl[key].defaultMetric, props[key]);
                    }
                    else {
                        out[key] = dm(tmpl[key].defaultMetric, props[key]);
                    }
                }
            }
            else if(key == 'ease' || key == 'easing'){
                out.easing = props[key];
                let deep = ut.deep_get(ease,props[key]);
                if(deep != undefined){
                    out.easing = deep;
                }
            }
            else {
                if(key == 'transform') { props[key] += ' '}
                out[key] = props[key];
            }
        }
        if(out.transform.length < 2){
            delete out.transform;
        }
        return out;
    
        function dm(metric, value){
            if(!metric){ return value; }
            if(isNaN(value)){ return value; }
            return value.toString() + metric;
        }
    }

    return ani;
}

export default ani;