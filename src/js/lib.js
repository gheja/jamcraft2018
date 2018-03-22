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
	
	a = x * TICK_SECONDS;
	
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
	
	a = x * TICK_SECONDS;
	
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

function arrayNormalizeChances(a)
{
	let i, sum;
	
	sum = 0;
	
	for (i in a)
	{
		sum += a[i].chance;
	}
	
	for (i in a)
	{
		if (sum == 0)
		{
			a[i].chance = 1;
		}
		else
		{
			a[i].chance = a[i].chance / sum;
		}
	}
	
	return a;
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
	return Math.random() < x;
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

function setDomParent(obj, parent)
{
	obj.parentNode.removeChild(obj);
	parent.appendChild(obj);
}

function arrayRemove(arr, item)
{
	let i;
	
	for (i in arr)
	{
		if (arr[i] == item)
		{
			arr.splice(i, 1);
			return;
		}
	}
}

function mixColors(arr)
{
	let i, h, s, l, a, item, total, total2;
	
	h = 0;
	s = 0;
	l = 0;
	a = 0;
	total = 0;
	total2 = 0;
	
	for (i in arr)
	{
		item = arr[i];
		
		if (item.color.s != 0)
		{
			h += item.color.h * item.amount;
			total2 += item.amount;
		}
		s += item.color.s * item.amount;
		l += item.color.l * item.amount;
		a += item.color.a * item.amount;
		
		total += item.amount;
	}
	
	// avoid division by zero
	total = Math.max(total, 1);
	total2 = Math.max(total2, 1);
	
	h = h / total2;
	s = s / total;
	l = l / total;
	a = a / total;
	
	return { h: h, s: s, l: l, a: a };
}

function hslaArrayToString(color)
{
	// lightness is actually value in the arrays, 100% value == 50% lightness
	return "hsla(" + color.h + ", " + color.s + "%, " + (color.l / 2) + "%, " + color.a + ")";
}

function arrayGet(arr, key)
{
	if (key in arr)
	{
		return arr[key];
	}
	else
	{
		console.log(arr);
		throw Error("Cannot find key \"" + key + "\" in array (dumped to console).");
	}
}

function arrayGetPick(arr, key)
{
	return arrayPick(arrayGet(arr, key));
}

function positionFix(pos)
{
	if (pos.x === undefined)
	{
		pos.x = pos.left;
	}
	
	if (pos.y === undefined)
	{
		pos.y = pos.top;
	}
	
	return pos;
}
