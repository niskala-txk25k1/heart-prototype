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

let SCALE = 2;
canvas.width = 128*SCALE;
canvas.height = 64*SCALE;

let ctx = canvas.getContext('2d');

let img_font = new Image();
let font;


var statefn = menu_main;

img_font.onload = ()=> {
	font = imgdata(img_font);
	requestAnimationFrame(statefn);
}

let network = {
	ssid : "KME759_Group_2",
	pass : "redacted"
}


img_font.src = "./cp437.png";



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

let button = {
	trigger: 0,
	active: 0,
	t_down: 0,
	t_up:   0,
}

function rect(x, y, w, h) {
	ctx.fillRect(x*SCALE, y*SCALE, w*SCALE, h*SCALE);
}

function eat_trigger() {
	if (button.trigger) {
		button.trigger = 0;
		return true;
	}
	return false;
}

function button_held_ms() {
	if (!button.active) {
		return false;
	}

	return time_ms() - button.t_down;
}

document.addEventListener("mousedown", (e)=>{
	console.log("down");
	button.active = 1;
	button.t_down = time_ms();
});

document.addEventListener("mouseup", (e)=>{
	console.log("up");
	if (button.active) {
		button.trigger = 1;
		button.active  = 0;
	}
	button.t_up = time_ms();
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

let now = 0;
function freq(hz=1.0, phase=0.0) {
	return Math.sin( ((now+phase)/1000.0) * Math.PI*2.0 * hz ) 
}

function menu_measure() {

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#CCF";
	ctx.strokeStyle = "#CCF";

	now = time_ms();
	if (now - last > 1000) {
		bpm = (Math.random() * 20) + 60;
		bpm |= 0;
		last = now;
		console.log("tick");
	}

	//samples[sindex++] = (Math.random() * 32 - 16)/2;
	let f = 0.6;
	let s = 0;
	for (let i = 1; i < 8; i++) {
		s += freq(f) / i;
		f *= 1.5;
	}
	samples[sindex++] = (s * 5);



	let sample_last = samples[sindex];
	for (let i = 0; i < 128; i++) {
		//ctx.fillRect(i*SCALE, (32*SCALE) - sample_last, SCALE, (32*SCALE) + samples[i] )
		let sample = samples[(i+sindex)%128];
		//ctx.fillRect(i*SCALE, (32)*SCALE, SCALE, -(sample+1)*SCALE);
		let min = Math.min(sample, sample_last);
		let max = Math.max(sample, sample_last);
		let mid = ((min+max)/2)|0;
		rect(i, 32+min, 1, Math.max(max-min,1) );
		//rect(i, 32+min, 1, mid-min );
		//rect(i, 32+mid, 1, max-mid );
		//rect(i, 32+sample, 1,1)

		sample_last = sample;
	}

	sindex %= 128;

	draw_string(0, 0, `${bpm} BPM`);
	draw_string(0, 64-10, "Click to quit");

	//ctx.fillRect(0, 32*SCALE, 128*SCALE, SCALE);

	sel = 0;
	if (eat_trigger()) {
		statefn = menu_main;
	}

	requestAnimationFrame(statefn);
}

let buffer = ""
function menu_text_editor()
{
	statefn = menu_not_implemented;
	requestAnimationFrame(statefn);
}

function menu_confirm_finger() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#CCF";
	ctx.strokeStyle = "#CCF";

	now = time_ms();
	if (now - last > 1000) {
		bpm = (Math.random() * 20) + 60;
		bpm |= 0;
		last = now;
		console.log("tick");
	}

	//samples[sindex++] = (Math.random() * 32 - 16)/2;
	let f = 0.6;
	let s = 0;
	for (let i = 1; i < 8; i++) {
		s += freq(f) / i;
		f *= 1.5;
	}
	samples[sindex++] = (s * 5);



	let sample_last = samples[sindex];
	for (let i = 0; i < 128; i++) {
		//ctx.fillRect(i*SCALE, (32*SCALE) - sample_last, SCALE, (32*SCALE) + samples[i] )
		let sample = samples[(i+sindex)%128];
		//ctx.fillRect(i*SCALE, (32)*SCALE, SCALE, -(sample+1)*SCALE);
		let min = Math.min(sample, sample_last);
		let max = Math.max(sample, sample_last);
		let mid = ((min+max)/2)|0;
		rect(i, 48+min, 1, Math.max(max-min,1) );

		sample_last = sample;
	}

	sindex %= 128;

	draw_string(0, 0, `Place finger on`);
	draw_string(0, 10, "the sensor. ");
	draw_string(0, 20, "Confirm feed OK.");

	//ctx.fillRect(0, 32*SCALE, 128*SCALE, SCALE);

	sel = 0;
	if (eat_trigger()) {
		statefn = menu_main;
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
	if (eat_trigger()) {
		statefn = menu_history;
	}

	requestAnimationFrame(statefn);
}

function menu_hist2() {
	fb_clear();

	draw_string(0,  0, "Mean HR:  76", 0);
	draw_string(0, 10, "Mean PPI: 750", 0);
	draw_string(0, 20, "RMSSD:    23", 0);
	draw_string(0, 30, "SDNN:     22", 0);

	sel = 0;
	if (eat_trigger()) {
		statefn = menu_history;
	}

	requestAnimationFrame(statefn);
}

function menu_hist1_opt() {
	let menu = [
		{label: " Confirm",     fn: null},
		{label: " Cancel",       fn: menu_main},
	];
	menu_basic(menu, "Delete?");
}

function menu_history() {
	let menu = [
		{label: " 1.Kubios", fn: menu_hist1, fn2: menu_hist1_opt},
		{label: " 2.Local",    fn: menu_hist2, fn2: menu_hist1_opt},
		{label: " 3.(empty)",    fn: null},
		{label: " 4.(empty)",    fn: null},
		{label: " Back",       fn: menu_main},
	];
	menu_basic(menu, "History:");
}

function menu_settings() {
	let menu = [
		{label: " SSID: KME691_Group2",       fn: null},
		{label: " Password: *******",   fn: null},
		{label: " Back",       fn: menu_main},
	];
	menu_basic(menu, "Settings:");
}


function menu_dev_settings() {
	let menu = [
		{label: " Text editor",   fn: menu_text_editor},
		{label: " Snake",   fn: null},
		{label: " Back",          fn: menu_main},
	];
	menu_basic(menu, "Developer menu:");
}

function menu_not_implemented()
{
	fb_clear();
	draw_string(0, 0, "Not implemented", 0);

	sel = 0;
	if (eat_trigger()) {
		statefn = menu_main;
	}

	requestAnimationFrame(statefn);
}

function menu_main() {

	let menu = [
		{label: " HR measure",   fn: menu_measure},
		{label: " HRV analysis", fn: menu_confirm_finger},
		{label: " Kubios",       fn: menu_not_implemented},
		{label: " History",      fn: menu_history},
		{label: " Settings",      fn: menu_settings, fn2: menu_dev_settings},
	];
	menu_basic(menu, "H.E.A.R.T.");
}


function menu_basic(menu, header="") {
	sel = Math.min(menu.length-1, Math.max(0, sel))

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	let y = 0;
	if (header) {
		draw_string(0, y, header, 0);
		y+=10;
	}

	for (let i = 0; i < menu.length; i++) {
		draw_string(0, y, menu[i].label, i==sel);
		y += 10;
	}

	if (eat_trigger()) {
		if (menu[sel].fn) {
			statefn = menu[sel].fn;
			sel = 0;
		}
	}

	let t_held = Math.max(button_held_ms() - 200, 0);
	let held = Math.min(t_held/500.0, 1.0);
	if (!menu[sel].fn2) {
		held = 0;
	}
	rect(0, (64 - 2), held*128, 2)
	if (held == 1.0) {
		button.active = 0;

		if (menu[sel].fn2) {
			statefn = menu[sel].fn2;
			sel = 0;
		}
	}



	requestAnimationFrame(statefn);
}


