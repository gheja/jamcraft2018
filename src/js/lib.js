"use strict";

const MESSAGE_NORMAL = 0;
const MESSAGE_FAIL = 1;
const MESSAGE_WARNING = 2;

function logMessage(s, format)
{
	let obj;
	
	obj = get("messages");
	
	if (format == MESSAGE_FAIL)
	{
		s = "<span class=\"fail\">" + s + "</span>";
	}
	else if (format == MESSAGE_WARNING)
	{
		s = "<span class=\"warning\">" + s + "</span>";
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
	
	return "day " + (d + 1) + ", "+ lead(h, 2) + ":" + lead(m, 2);
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

function createDomElement(tagName, className)
{
	let obj;
	
	obj = document.createElement(tagName);
	obj.className = className;
	
	return obj;
}

function createDiv(className)
{
	return createDomElement("div", className);
}

function getAllVariations(recipe)
{
	var i, depth, item, lists, current_list, indexes, variations, finished;
	
	lists = [];
	current_list = [];
	indexes = [];
	variations = [];
	depth = 0;
	item = '';
	
	for (i=0; i<recipe.length; i++)
	{
		if (recipe[i] == '(')
		{
			current_list = [];
			item = '';
		}
		else if (recipe[i] == ')')
		{
			current_list.push(item);
			lists.push(current_list);
			indexes.push(0);
		}
		else if (recipe[i] == ',')
		{
			current_list.push(item);
			item = '';
		}
		else
		{
			item += recipe[i];
		}
	}
	
	finished = 0;
	while (!finished)
	{
		item = '';
		for (i=0; i<lists.length; i++)
		{
			item += lists[i][indexes[i]];
		}
		variations.push(item);
		
		indexes[lists.length-1]++;
		
		for (i=lists.length-1; i>=0; i--)
		{
			if (indexes[i] == lists[i].length)
			{
				if (i == 0)
				{
					finished = 1;
					break;
				}
				indexes[i-1]++;
				indexes[i] = 0;
			}
		}
	}
	
	return variations;
}
