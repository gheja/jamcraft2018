"use strict";

const MESSAGE_NORMAL = 0;
const MESSAGE_FAIL = 1;

function logMessage(s, format)
{
	let obj;
	
	obj = get("messages");
	
	if (format == MESSAGE_FAIL)
	{
		s = "<span class=\"fail\">" + s + "</span>";
	}
	
	obj.innerHTML = toTime(tickCount) + " " + s + "<br/>"  + obj.innerHTML;
}

function toHoursMinutes(x)
{
	let h, m, a;
	
	a = x * 30;
	
	h = Math.floor(a / 3600);
	m = Math.floor(a % (3600) / 60);
	
	return h + " " + (h == 1 ? "hour" : "hours") + ", " + m + " " + (m == 1 ? "minute" : "minutes");
}

function toTime(x, trimMinute)
{
	let d, h, m, s, a;
	
	function lead(x, n)
	{
		let s;
		
		s = x.toString();
		
		while (s.length < n)
		{
			s = "0" + s;
		}
		
		return s;
	}
	
	a = x * 30;
	
	d = Math.floor(a / (24 * 3600));
	h = Math.floor(a % (24 * 3600) / 3600);
	m = Math.floor(a % (3600) / 60);
	s = a % 60;
	
	// return d + "d " + lead(h, 2) + ":" + lead(m, 2) + ":" + lead(s, 2);
	
	return "day " + (d + 1) + ", "+ lead(h, 2) + ":" + lead(Math.floor(m / 10) * 10, 2);
}

function toF(x)
{
	return Math.floor(x * 1.8 + 32);
}

function get(x)
{
	let obj;
	
	obj = document.getElementById(x);
	
	if (obj == null)
	{
		console.log("ERROR: could not find element by id \"" + x + "\"");
		return;
	}
	
	return obj;
}

function setText(name, text)
{
	let obj;
	
	obj = get(name);
	
	if (obj == null)
	{
		return;
	}
	
	obj.innerHTML = text;
}

function arrayPick(a)
{
	return a[Math.floor(Math.random() * a.length)];
}

function arrayPickChance(a)
{
	let i, total, r;
	
	total = 0;
	
	for (i in a)
	{
		total += a[i].chance;
	}
	
	r = Math.floor(Math.random() * total);
	
	for (i in a)
	{
		r -= a[i].chance;
		
		if (r <= 0)
		{
			return a[i];
		}
	}
	
	return null;
}

// source: https://stackoverflow.com/a/6274381/460571 - thanks!
function arrayShuffle(a)
{
	var j, x, i;
	
	for (i = a.length - 1; i > 0; i--)
	{
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
}

function chance(x)
{
	return Math.floor() < x;
}

function clamp(x, min, max)
{
	return Math.max(min, Math.min(max, x));
}
