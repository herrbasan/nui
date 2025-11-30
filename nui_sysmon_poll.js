'use strict';

import ut from "./nui_ut.js";
import { graph } from "./nui_graph.js";

const sysmon_poll = {};

let g = {};
let pcs = {};
let pcs_change = {};
let history = 240;
let target;
let sortType = {
	cpu:1,
	gpu:2,
	ram:3,
	nic:4,
	hdd:5
}

// Get graph colors based on current mode
function getGraphColors() {
	const isDark = document.body.classList.contains('dark');
	if (isDark) {
		return {
			strokeStyle: 'rgb(76, 132, 229)',
			fillStyle: 'rgba(76, 132, 229, 0.3)'
		};
	} else {
		return {
			strokeStyle: 'rgb(25, 118, 210)',
			fillStyle: 'rgba(25, 118, 210, 0.4)'
		};
	}
}

// Update all existing graph colors when mode changes
sysmon_poll.updateGraphColors = function() {
	const colors = getGraphColors();
	for (let uuid in pcs) {
		const hardware = pcs[uuid].hardware;
		updateHardwareGraphColors(hardware, colors);
	}
}

function updateHardwareGraphColors(html, colors) {
	// Iterate through all properties that might be sensor containers
	for (let key in html) {
		if (html[key] && html[key].sensor_types) {
			updateSensorTypesGraphColors(html[key].sensor_types, colors);
		}
	}
}

function updateSensorTypesGraphColors(html, colors) {
	for (let key in html) {
		if (html[key] && html[key].sensors) {
			updateSensorsGraphColors(html[key].sensors, colors);
		}
	}
}

function updateSensorsGraphColors(html, colors) {
	for (let key in html) {
		if (html[key] && html[key].graph) {
			html[key].graph.strokeStyle = colors.strokeStyle;
			html[key].graph.fillStyle = colors.fillStyle;
		}
	}
}

sysmon_poll.init = async function(_target){
	target = _target
	target.addClass('sysmon');
	// Clear internal state on re-initialization
	pcs = {};
	pcs_change = {};
	g = {};
	detectOnline();
}



sysmon_poll.push = function(item){
	if(item.type == "computer_stats"){
		let data = JSON.parse(item.stats);
		let ip = item.ip.split(':');
		ip = ip[ip.length-1];
		data.ip = ip;
		render(data);
		sortDevices();
		sortPcs();
		if(!this.once){ console.log(data); this.once = true;}
	}
}

sysmon_poll.cleanUp = function(){
	ut.killKids(target);
	pcs = {};
}

function detectOnline(){
	for(let key in pcs){
		let diff = Date.now() - pcs[key].check_ts;
		if(diff > 20000){
			ut.killMe(pcs[key]);
			delete pcs[key];
		}
	}
	setTimeout(detectOnline, 5000);
}

function sortDevices(){
	for(let key in pcs){
		if(!pcs[key].sorted){
			let temp = Array.from(pcs[key].els('.hardware .top .device'));
			ut.sortByKey(temp, 'type_idx', true);
			for(let i=0; i<temp.length; i++){
				pcs[key].el('.hardware .top').appendChild(temp[i]);
			}
			temp = Array.from(pcs[key].els('.hardware .bot .device'));
			ut.sortByKey(temp, 'device_name');
			for(let i=0; i<temp.length; i++){
				pcs[key].el('.hardware .bot').appendChild(temp[i]);
			}
			pcs[key].sorted = true;
		}
	}
}

function sortPcs(force){
	let ar = Array.from(ut.els('.sysmon_pc'));
	if(ar.length != g.last_pcs_length || force){
		ut.sortByKey(ar, 'pc_name');
		for(let i=0; i<ar.length; i++){
			target.appendChild(ar[i]);
		}
		g.last_pcs_length = ar.length;
	}
}

function render(data){
	if(data.uuid){
		if(pcs_change[data.uuid] != data.change){
			console.log('Change on ' + data.name);
			ut.killMe(pcs[data.uuid]);
			delete pcs[data.uuid];
		}
		if(!pcs[data.uuid]) {
			pcs[data.uuid] = ut.htmlObject(/*html*/ `
				<div class="sysmon_pc nui-card">
					<div class="head">
						<div class="name">${data.name}</div>
						<div class="os">${data.os}</div>
					</div>
					<div class="hardware">
						<div class="top"></div>
						<div class="bot"></div>
					</div>
				</div>
			`)
			pcs[data.uuid].pc_name = data.name;
			pcs[data.uuid].hardware = pcs[data.uuid].el('.hardware');
			target.appendChild(pcs[data.uuid]);
		};
		pcs_change[data.uuid] = data.change;
		pcs[data.uuid].online = true;
		pcs[data.uuid].check_ts = Date.now();
		pcs[data.uuid].addClass('online');
		renderHardware(pcs[data.uuid].hardware, data.sensors);
	}
	
}

function renderHardware(html, data){
	for(let type in data){
		for(let i=0; i<data[type].length; i++){
			let type_id = type + '_' + i;
			if(!html[type_id]){
				html[type_id] =  ut.htmlObject(/*html*/`
				<div class="device ${type}">
					<div class="name">${data[type][i].name}</div>
					<div class="sensor_types"></div>
				</div>
				`)
				html[type_id].device_name = data[type][i].name;
				html[type_id].sensor_types = html[type_id].el('.sensor_types');
				html[type_id].type_idx = sortType[type] || 100;
				if(type == 'hdd'){
					html.el('.bot').appendChild(html[type_id]);
				}
				else {
					html.el('.top').appendChild(html[type_id]);
				}
			}
			renderSensorType(html[type_id].sensor_types, type_id, data[type][i])
		}
	}
}

function renderSensorType(html, id, data){
	for(let type in data){
		let type_id = id + '_' + type;
		if(type != 'name' && type != 'volumes'){
			if(!html[type_id]){
				html[type_id] =  ut.htmlObject(/*html*/`
				<div class="sensor_type ${type}">
					<div class="name">${data[type].name}</div>
					<div class="sensors"></div>
				</div>
				`)
				html[type_id].sensors = html[type_id].el('.sensors');
				html.appendChild(html[type_id]);
			}
			renderSensors(html[type_id].sensors, type_id, data[type]);
		}
		
	}
}

function renderSensors(html, id, data){
	for(let type in data){
		let type_id = id + '_' + type;
		let device_type = id.split('_')[0];
		if(type != 'name'){
			if(!html[type_id]){
				html[type_id] =  ut.htmlObject(/*html*/`
				<div class="sensor ${type}">
					<div class="name">${data[type].name}</div>
					<div class="data"></div>
					<div class="plot"></div>
				</div>
				`)
				if(device_type != 'hdd'){
					let maxVal = 0;
					let minVal = 0;
					let reverse = false;
					if(data[type].data.type == '°C'){ maxVal = 100; minVal=0; reverse=false;}
					if(data[type].data.type == '%'){ maxVal = 100; minVal=0;}
					const colors = getGraphColors();
					html[type_id].graph = graph.init(html[type_id].el('.plot'), {lineWidth:2, strokeStyle:colors.strokeStyle, fillStyle:colors.fillStyle, reverse:reverse, maxVal:maxVal, minVal:minVal});
				}
				else {
					ut.killMe(html[type_id].el('.plot'));
				}
				html[type_id].sensor = html[type_id].el('.sensor');
				html[type_id].plot = html[type_id].el('.data');
				html[type_id].ring = [];
				html.appendChild(html[type_id]);
			}
			renderData(html[type_id], data[type].data, id)
		}
	}
}

function renderData(html, data, type){
	let value = data.value;
	// Values are already correctly scaled with their units from both web and native polling
	// Both go through the same flatten() function which preserves the LibreHardwareMonitor format
	html.plot.innerHTML = sysmon_poll.formatSensorValue(value, data.type);
	html.ring.push(value);
	if(html.ring.length > history){ html.ring.shift();}
	if(html.graph){
		html.graph.draw(html.ring)
	}
}

/**
 * Formats sensor values based on type with consistent rules
 * @param {number} value - Raw sensor value
 * @param {string} type - Sensor type/unit (e.g., '°C', 'GHz', '%', etc.)
 * @returns {string} Formatted value with unit
 */
sysmon_poll.formatSensorValue = function(value, type) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }

    let formattedValue;

    switch (type) {
        case '°C':
        case '°F':
            // Round temperatures to 1 decimal place
            formattedValue = Math.round(value * 10) / 10;
            break;

        case 'GHz':
        case 'MHz':
            // Round frequencies to integers
            formattedValue = Math.round(value);
            break;

        case '%':
            // Round percentages to 1 decimal place
            formattedValue = Math.round(value * 10) / 10;
            break;

        case 'RPM':
            // Round fan speeds to integers
            formattedValue = Math.round(value);
            break;

        case 'V':
            // Round voltages to 2 decimal places
            formattedValue = Math.round(value * 100) / 100;
            break;

        case 'W':
        case 'kW':
            // Round power to 1 decimal place
            formattedValue = Math.round(value * 10) / 10;
            break;

        case 'KB/s':
        case 'MB/s':
        case 'GB/s':
            // Round bandwidth to 1 decimal place
            formattedValue = Math.round(value * 10) / 10;
            break;

        case 'B':
        case 'KB':
        case 'MB':
        case 'GB':
        case 'TB':
            // Round storage sizes to integers
            formattedValue = Math.round(value);
            break;

        default:
            // For unknown types, round to 2 decimal places
            formattedValue = Math.round(value * 100) / 100;
            break;
    }

    return formattedValue + ' ' + type;
};

export { sysmon_poll }