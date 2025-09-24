'use strict';

function imgdata(img) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	canvas.width = img.width;
	canvas.height = img.height;
	context.drawImage(img, 0, 0 );
	return context.getImageData(0, 0, img.width, img.height);
}


console.log("Run");
let canvas = document.querySelector('canvas');

let SCALE = 4;
canvas.width = 128*SCALE;
canvas.height = 64*SCALE;

let ctx = canvas.getContext('2d');


let img_font = new Image();
let font;

let sel = 0;

document.addEventListener("wheel", (e)=>{
	if (e.deltaY > 0) {
		console.log("Up");
		sel++;
	} else {
		console.log("Down");
		sel--;
	}
});

let click = 0;
document.addEventListener("mouseup", (e)=>{
	console.log("Click");
	click++;
});

function draw_glyph(fb_x, fb_y, code, bg) {

	let x = (code % 16)|0;
	let y = (code / 16)|0;
	x *= 10;
	y *= 10;
	ctx.fillStyle = "#CCF";

	for (let v = 0; v < 10; v++)
	for (let u = 1; u < 10-1; u++) {

		let index = font.width * (v+y) + (u+x);
		if ((font.data[ index*4 ]>0) ^ bg) {
			ctx.fillRect((fb_x+u)*SCALE, (fb_y+v)*SCALE, SCALE, SCALE);
		}
	}

}


function draw_string(x, y, str, bg) {

	for (let i = 0; i < str.length; i++) {
		draw_glyph(x, y, str.charCodeAt(i), bg);
		x += 8;
	}

}

function time_ms() {
	return new Date().getTime();
}


let last = time_ms();
let bpm = 76;
let samples = new Int16Array(128);
let sindex = 0;

function fb_clear()
{
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#CCF";
}

function menu_measure() {

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#CCF";

	let now = time_ms();
	if (now - last > 1000) {
		bpm = (Math.random() * 20) + 60;
		bpm |= 0;
		last = now;
		console.log("tick");
	}

	samples[sindex++] = (Math.random() * 32 - 16)/2;


	let sample_last = samples[127];
	for (let i = 0; i < 128; i++) {
		//ctx.fillRect(i*SCALE, (32*SCALE) - sample_last, SCALE, (32*SCALE) + samples[i] )
		ctx.fillRect(i*SCALE, (32)*SCALE, SCALE, -(samples[i]+1)*SCALE);
	}

	sindex %= 128;

	draw_string(0, 0, `${bpm} BPM`);
	draw_string(0, 64-10, "Click to quit");

	//ctx.fillRect(0, 32*SCALE, 128*SCALE, SCALE);

	sel = 0;
	if (click) {
		click = 0;
		statefn = menu_main;
	}

	requestAnimationFrame(statefn);
}

function menu_basic(menu) {
	sel = Math.min(menu.length-1, Math.max(0, sel))

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < menu.length; i++) {
		draw_string(0, i*10, menu[i].label, i==sel);
	}

	if (click) {

		if (menu[sel].fn) {
			statefn = menu[sel].fn;
			sel = 0;
		}

		click = 0;
	}

	requestAnimationFrame(statefn);
}

function menu_hist1() {
	fb_clear();

	draw_string(0,  0, "Mean HR:  76", 0);
	draw_string(0, 10, "Mean PPI: 750", 0);
	draw_string(0, 20, "RMSSD:    23", 0);
	draw_string(0, 30, "SDNN:     22", 0);
	draw_string(0, 40, "SNS:      1.214", 0);
	draw_string(0, 50, "PNS:     -1.136", 0);

	sel = 0;
	if (click) {
		click = 0;
		statefn = menu_history;
	}

	requestAnimationFrame(statefn);
}


function menu_history_delete() {
	let menu = [
		{label: " 2025-09-17", fn: menu_history},
		{label: " (empty)", fn: null},
		{label: " (empty)", fn: null},
		{label: " (empty)", fn: null},
		{label: " Cancel Delete", fn: menu_history},
	];
	menu_basic(menu);
}

function menu_history() {
	let menu = [
		{label: " 2025-09-17", fn: menu_hist1},
		{label: " (empty)", fn: null},
		{label: " (empty)", fn: null},
		{label: " (empty)", fn: null},
		{label: " Delete", fn: menu_history_delete},
		{label: " Back", fn: menu_main},
	];
	menu_basic(menu);
}

function menu_not_implemented()
{
	fb_clear();
	draw_string(0, 0, "Not implemented", 0);

	sel = 0;
	if (click) {
		click = 0;
		statefn = menu_main;
	}

	requestAnimationFrame(statefn);
}

function menu_main() {

	let menu = [
		{label: " Measure HR", fn: menu_measure},
		{label: " Basic HRV anal", fn: menu_not_implemented},
		{label: " Kubios", fn: menu_not_implemented},
		{label: " History", fn: menu_history},
	];
	menu_basic(menu);
}


var statefn = menu_main;

img_font.onload = ()=> {
	font = imgdata(img_font);
	requestAnimationFrame(statefn);
}



img_font.src = "./cp437.png";


