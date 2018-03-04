"use strict";

let tickCount;
let substanceClasses = [];
let interactionClasses = [];
let ingredientClasses = [];
let cauldron = new Cauldron;
let plates = [];

function selectPlate(n)
{
	let i;
	
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
			{ substance: substanceClasses["red"], ratio: 1 },
			{ substance: substanceClasses["yellow"], ratio: 1 }
		],
		outputSubstances: [
			{ substance: substanceClasses["orange"], ratio: 1.7 },
			{ substance: substanceClasses["air"], ratio: 0.3 }
		],
		speed: 0.5 // units per minute
	}));
	
	ingredientClasses["rosepetal"] = new Ingredient({
		name: "Rose Petal",
		icon: "rosepetal.png",
		unit: "tbsp",
		substances: [
			{ substance: substanceClasses["red"], amount: 1 }
		]
	});
	
	plates.push(new Plate);
	plates.push(new Plate);
	plates.push(new Plate);
	
	selectPlate(0);
	
	window.setInterval(tick, 100);
}

window.onload = init;
