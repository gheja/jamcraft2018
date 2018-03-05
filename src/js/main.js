"use strict";

let tickCount;
let substanceClasses = [];
let interactionClasses = [];
let ingredientClasses = [];
let cauldron = null;
let plates = [];
let currentPlate = null;
// let inventory = [];

let ingredientCount = [];

function addIngredient(n)
{
	let ingredient;
	
	ingredient = ingredientClasses[n];
	
	if (!ingredient)
	{
		console.log("ERROR: could not find ingredient \"" + n + "\"");
		return;
	}
	
	if (ingredientClasses[n].countInventory == 0)
	{
		return;
	}
	
	ingredient.countInventory--;
	
	if (!currentPlate.contents[n])
	{
		currentPlate.contents[n] = 0;
	}
	
	currentPlate.contents[n]++;
	
	updateDisplayPlates();
}

function removeIngredient(n)
{
	let ingredient;
	
	ingredient = ingredientClasses[n];
	
	if (!ingredient)
	{
		console.log("ERROR: could not find ingredient \"" + n + "\"");
		return;
	}
	
	if (!currentPlate.contents[n] || currentPlate.contents[n] == 0)
	{
		return;
	}
	
	ingredient.countInventory++;
	
	currentPlate.contents[n]--;
	
	if (currentPlate.contents[n] == 0)
	{
		delete currentPlate.contents[n];
	}
	
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

function updateDisplayPlates()
{
	let i, j, s, a;
	
	for (i=0; i<plates.length; i++)
	{
		s = "";
		
		for (j in plates[i].contents)
		{
			a = ingredientClasses[j];
			
			s += plates[i].contents[j] + " " + a.unit + " " + a.name + "<br/>";
		}
		
		if (s == "")
		{
			s = "(empty)";
		}
		
		setText("plate" + i + "_contents", s);
	}
}

function updateDisplay()
{
	let i, s;
	
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
	
	s = "";
	
	for (i in cauldron.substances)
	{
		if (cauldron.substances[i] != 0)
		{
			s += cauldron.substances[i] + "x" + i + " ";
		}
	}
	
	setText("cauldron_content", s);
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
	
	substanceClasses["air"] = new Substance({
		namse: "Air",
		color: "#ffffff",
		description: "",
	});
	
	substanceClasses["red"] = new Substance({
		namse: "red",
		color: "#ee3300",
		description: "",
	});
	
	substanceClasses["yellow"] = new Substance({
		namse: "yellow",
		color: "#ffee33",
		description: "",
	});
	
	substanceClasses["orange"] = new Substance({
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
	
	ingredientClasses["rosepetal"] = new Ingredient({
		name: "Rose Petal",
		icon: "rosepetal.png",
		unit: "tbsp",
		unlocked: true,
		substances: [
			{ name: "red", amount: 1 }
		]
	});
	
	cauldron = new Cauldron;
	
	plates.push(new Plate);
	plates.push(new Plate);
	plates.push(new Plate);
	
	ingredientClasses["rosepetal"].countInventory = 3;
	
	selectPlate(0);
	
	updateDisplayPlates();
	
	window.setInterval(tick, 100);
}

window.onload = init;
