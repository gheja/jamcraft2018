"use strict";

let tickCount;
let itemClasses = [];
let interactionClasses = [];
let cauldron = null;
let plates = [];
let currentPlate = null;
let inventory = null;

let currentDescription = "";

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
		
		if (a.hidden)
		{
			continue;
		}
		
		if (count > 0)
		{
			s += round(count) + " " + a.unit + " " + a.title + "<br/>";
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
	
	get("cauldron_fire").style.display = ((cauldron.temperatureTarget > 20 && cauldron.status != CAULDRON_REMOVED) ? "block" : "none");
	get("cauldron_main").style.display = (cauldron.status != CAULDRON_REMOVED ? "block" : "none");
}

function tick()
{
	tickCount++;
	
	currentDescription = "";
	
	cauldron.tick();
	
	// console.log(toTime(tickCount) + " Temperature: " + cauldron.temperature + " 'C (target: " + cauldron.temperatureTarget + " 'C) = " + toF(cauldron.temperature) + " 'F (target: " + toF(cauldron.temperatureTarget) + " 'F)");
	setText('time', toTime(tickCount, true));
	
	updateDisplay();
	
	if (currentDescription == "")
	{
		if (cauldron.status == CAULDRON_REMOVED)
		{
			currentDescription += "Press <b>Prepare</b> to prepare the cauldron for cooking.<br/><br/>";
		}
		
		currentDescription += "Use <b>+</b> and <b>-</b> to adjust the fire. Each ingredient starts dissolving at a specific temperature. Substances react yadda-yadda...<br/><br/>";
		
		if (cauldron.status != CAULDRON_REMOVED)
		{
			currentDescription += "Press <b>Done</b> when your potion is ready.";
		}
	}
	
	setText("description", currentDescription);
}

function createEvaporationInteractions()
{
	let i, s;
	
	for (i in itemClasses)
	{
		s = itemClasses[i];
		
		if (!s.evaporateTemperature)
		{
			continue;
		}
		
		interactionClasses.push(new Interaction({
			inputSubstances: [
				{ name: i, ratio: 1 }
			],
			outputSubstances: [
				{ name: "air", ratio: 1 }
			],
			speed: 0.1, // units per minute
			evaporation: true
		}));
	}
}

function init()
{
	let a;
	
	tickCount = 0;
	
	itemClasses["air"] = new Substance({
		name: "air",
		title: "air",
		color: "#ffffff",
		description: "",
		evaporateTemperature: 0,
		hidden: true
	});
	
	itemClasses["red"] = new Substance({
		name: "red",
		title: "red",
		color: "#ee3300",
		description: "",
		interactionTemperatureMin: 60,
		interactionTemperatureMax: 70,
		evaporateTemperature: 80
	});
	
	itemClasses["yellow"] = new Substance({
		name: "yellow",
		title: "yellow",
		color: "#ffee33",
		description: "",
		interactionTemperatureMin: 60,
		interactionTemperatureMax: 70,
		evaporateTemperature: 80
	});
	
	itemClasses["orange"] = new Substance({
		name: "orange",
		title: "orange",
		color: "#ffbb00",
		description: "",
		interactionTemperatureMin: 0,
		interactionTemperatureMax: 0,
		evaporateTemperature: 300
	});
	
	interactionClasses.push(new Interaction({
		inputSubstances: [
			{ name: "red", ratio: 0.5 },
			{ name: "yellow", ratio: 0.5 }
		],
		outputSubstances: [
			{ name: "orange", ratio: 0.7 },
			{ name: "air", ratio: 0.3 }
		],
		speed: 0.1 // units per minute
	}));
	
	itemClasses["rosepetal"] = new Ingredient({
		name: "rosepetal",
		title: "Rose Petal",
		icon: "rosepetal.png",
		unit: "tbsp",
		unlocked: true,
		dissolveTemperature: 30,
		dissolveSpeed: 0.2, // units per minute
		substances: [
			{ name: "red", amount: 1 }
		]
	});
	
	itemClasses["appleseed"] = new Ingredient({
		name: "appleseed",
		title: "Apple Seed",
		icon: "appleseed.png",
		unit: "tbsp",
		unlocked: true,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	createEvaporationInteractions();
	
	inventory = {
		store: new Store
	};
	
	cauldron = new Cauldron;
	
	plates.push(new Plate);
	plates.push(new Plate);
	plates.push(new Plate);
	
	inventory.store.createItem("rosepetal", 3);
	inventory.store.createItem("appleseed", 5);
	
	selectPlate(0);
	
	updateDisplayPlates();
	
	window.setInterval(tick, 100);
}

window.onload = init;
