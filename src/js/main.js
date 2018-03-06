"use strict";

let tickCount;
let itemClasses = [];
let interactionClasses = [];
let cauldron = null;
let plates = [];
let currentPlate = null;
let inventory = null;

function round(x)
{
	x = Math.round(x * 10) / 10;
	
	return Math.floor(x) + "." + Math.floor(x * 10 % 10);
}

function addIngredient(n)
{
	let item;
	
	item = itemClasses[n];
	
	if (!item)
	{
		console.log("ERROR: could not find item \"" + n + "\"");
		return;
	}
	
	inventory.store.moveItem(currentPlate.store, n, 1);
	
	updateDisplayPlates();
}

function removeIngredient(n)
{
	let item;
	
	item = itemClasses[n];
	
	if (!item)
	{
		console.log("ERROR: could not find item \"" + n + "\"");
		return;
	}
	
	currentPlate.store.moveItem(inventory.store, n, 1);
	
	updateDisplayPlates();
}

function selectPlate(n)
{
	let i;
	
	currentPlate = plates[n];
	
	for (i=0; i<plates.length; i++)
	{
		plates[i].selected = (i == n);
		
		get("button_plate_" + i).disabled = (i == n);
	}
}

function usePlate(n)
{
	if (cauldron.status == CAULDRON_REMOVED)
	{
		logMessage("No cauldron in use.", MESSAGE_FAIL);
		return;
	}
	
	plates[n].use();
	
	updateDisplayPlates();
}

function getContentsString(store)
{
	let i, a, count, s;
	
	s = "";
	
	for (i in store.items)
	{
		a = itemClasses[i];
		count = store.items[i];
		
		if (count > 0)
		{
			s += round(count) + " " + a.unit + " " + a.name + "<br/>";
		}
	}
	
	if (s == "")
	{
		s = "(empty)";
	}
	
	return s;
}

function updateDisplayPlates()
{
	let i, j, s, a, count;
	
	for (i=0; i<plates.length; i++)
	{
		setText("plate" + i + "_contents", getContentsString(plates[i].store));
	}
}

function updateDisplay()
{
	setText('temperature_target', cauldron.temperatureTarget + " &deg;C");
	if (cauldron.status == CAULDRON_REMOVED)
	{
		setText('temperature_current', "-");
	}
	else
	{
		setText('temperature_current', cauldron.temperature + " &deg;C");
	}
	if (cauldron.status == CAULDRON_REMOVED)
	{
		setText('cauldron_status', "no cauldron");
	}
	else
	{
		setText('cauldron_status', cauldron.temperatureTarget <= 20 ? "off" : "heating");
	}
	
	setText('cooking_time', toHoursMinutes(cauldron.cookTime));
	
	get("button_cauldron_prepare").disabled = (cauldron.status != CAULDRON_REMOVED);
	get("button_cauldron_done").disabled = (cauldron.status == CAULDRON_REMOVED);
	
	setText("cauldron_content", getContentsString(cauldron.store));
}

function tick()
{
	tickCount++;
	
	cauldron.tick();
	
	// console.log(toTime(tickCount) + " Temperature: " + cauldron.temperature + " 'C (target: " + cauldron.temperatureTarget + " 'C) = " + toF(cauldron.temperature) + " 'F (target: " + toF(cauldron.temperatureTarget) + " 'F)");
	setText('time', toTime(tickCount, true));
	
	updateDisplay();
}

function init()
{
	let a;
	
	tickCount = 0;
	
	itemClasses["air"] = new Substance({
		namse: "Air",
		color: "#ffffff",
		description: "",
	});
	
	itemClasses["red"] = new Substance({
		namse: "red",
		color: "#ee3300",
		description: "",
	});
	
	itemClasses["yellow"] = new Substance({
		namse: "yellow",
		color: "#ffee33",
		description: "",
	});
	
	itemClasses["orange"] = new Substance({
		namse: "orange",
		color: "#ffbb00",
		description: "",
	});
	
	interactionClasses.push(new Interaction({
		inputSubstances: [
			{ substance: "red", ratio: 1 },
			{ substance: "yellow", ratio: 1 }
		],
		outputSubstances: [
			{ substance: "orange", ratio: 1.7 },
			{ substance: "air", ratio: 0.3 }
		],
		speed: 0.5 // units per minute
	}));
	
	itemClasses["rosepetal"] = new Ingredient({
		name: "Rose Petal",
		icon: "rosepetal.png",
		unit: "tbsp",
		unlocked: true,
		dissolveTemperature: 30,
		dissolveSpeed: 0.2, // units per minute
		substances: [
			{ name: "red", amount: 1 }
		]
	});
	
	inventory = {
		store: new Store
	};
	
	cauldron = new Cauldron;
	
	plates.push(new Plate);
	plates.push(new Plate);
	plates.push(new Plate);
	
	inventory.store.createItem("rosepetal", 3);
	
	selectPlate(0);
	
	updateDisplayPlates();
	
	window.setInterval(tick, 100);
}

window.onload = init;
