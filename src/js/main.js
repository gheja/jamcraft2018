"use strict";

let tickCount = 0;
let tickSkipCount = 0;
let itemClasses = [];
let interactionClasses = [];
let cauldron = null;
let plates = [];
let currentPlate = null;
let inventory = null;
let customers = [];
let currentDescription = "";
let currentTooltip = "";
let speed = 0;
let nextScreen = "";
let profile = null;
let helper = null;
let names = [];
let slots = [];
let won = false;
let gold = 0;
let sells = 0;
let ingredientUnlockOrder = [ "red", "orange", "brown" ];

function round(x)
{
	x = Math.round(x * 10) / 10;
	
	return Math.floor(x) + "." + Math.floor(x * 10 % 10);
}

function updateDebugFlag()
{
	if (get("debug_checkbox").checked)
	{
		document.body.className = "debug";
	}
	else
	{
		document.body.className = "";
	}
}

function clearTooltip()
{
	setTooltip("");
}

function setTooltipFromDom(e)
{
	setTooltip(e.target.dataset.tooltip);
}

function setTooltip(s)
{
	currentTooltip = s;
}

function registerAllTooltips()
{
	let i, array;
	
	array = document.getElementsByTagName("*");
	
	for (i in array)
	{
		if (array[i].dataset && array[i].dataset.tooltip)
		{
			if (!array[i].dataset.tooltipRegistered)
			{
				array[i].addEventListener("mouseover", setTooltipFromDom.bind());
				array[i].addEventListener("mouseout", clearTooltip.bind());
				
				// mouseout does not fire when the object is disabled,
				// so if a button gets disabled during its click event
				// the mouseout will not fire...
				array[i].addEventListener("click", clearTooltip.bind());
				
				array[i].dataset.tooltipRegistered = true;
			}
		}
	}
}

function setSpeed(n)
{
	let i;
	
	for (i=0; i<4; i++)
	{
		get("button_speed_" + i).disabled = (i == n);
	}
	
	speed = n;
}

function bumpSellCount()
{
	let unlock, i;
	
	unlock = false;
	
	sells++;
	
	if (sells == 2 || sells % 5 == 0)
	{
		unlock = true;
	}
	
	if (unlock)
	{
		for (i in ingredientUnlockOrder)
		{
			if (!itemClasses[i].unlocked)
			{
				unlockItem(i, true);
				break;
			}
		}
	}
}

function switchScreen()
{
	function setDisplay(a, mode)
	{
		let i;
		
		for (i in a)
		{
			get(a[i]).style.display = mode;
		}
	}
	
	setDisplay([
		"box_customers",
		"box_cauldron",
		"box_ingredients",
		"box_plates",
		"box_description",
		"box_codex"
	], "none");
	
	switch (nextScreen)
	{
		case "home":
			setDisplay([
				"box_customers",
				"box_cauldron",
				"box_ingredients",
				"box_description",
				"box_plates"
			], "block");
		break;
		
		case "codex":
			setDisplay([
				"box_codex"
			], "block");
		break;
	}
}

function goScreen(x)
{
	let obj;
	
	obj = get("crossfade");
	obj.style.animationName = "crossfade";
	obj.addEventListener("webkitAnimationEnd", function(element) { element.target.style.animationName = ""; });
	
	nextScreen = x;
	
	window.setTimeout(function() { switchScreen(); }, 250);
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
			s += "&nbsp;- " + round(count) + " " + a.unit + " of <b>" + a.title + "</b><br/>";
		}
	}
	
	if (s == "")
	{
		s = "Cauldron is empty.";
	}
	else
	{
		s = "Cauldron contents:<br/>" + s;
	}
	
	return s;
}

function updateDisplayPlates()
{
	let i;
	
	for (i=0; i<plates.length; i++)
	{
		plates[i].update();
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
	
	setText('cooking_time', toHoursMinutes(cauldron.cookTime));
	
	get("button_cauldron_prepare").disabled = (cauldron.status != CAULDRON_REMOVED);
	get("button_cauldron_done").disabled = (cauldron.status == CAULDRON_REMOVED);
	
	setText("cauldron_content", getContentsString(cauldron.store));
	
	get("cauldron_fire").style.display = ((cauldron.temperatureTarget > 20 && cauldron.status != CAULDRON_REMOVED) ? "block" : "none");
	get("cauldron_main").style.display = (cauldron.status != CAULDRON_REMOVED ? "block" : "none");
}

function tick()
{
	let i, skip;
	
	tickSkipCount++;
	
	skip = true;
	
	switch (speed)
	{
		case 0:	// paused
		
		break;
		
		case 1: // normal
			if (tickSkipCount >= 6)
			{
				skip = false;
				tickSkipCount = 0;
			}
		break;
		
		case 2: // fast
			if (tickSkipCount >= 3)
			{
				skip = false;
				tickSkipCount = 0;
			}
		break;
		
		case 3: // faster
			skip = false;
		break;
		
		case 4: // sleeping
			skip = false;
		break;
	}
	
	if (!skip)
	{
		tickCount++;
		
		currentDescription = "";
		
		cauldron.tick();
		profile.tick();
		
		for (i in customers)
		{
			customers[i].tick();
		}
		
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
	}
	
	if (currentTooltip != "")
	{
		setText("description", currentTooltip);
		get("description").className = "tooltip";
	}
	else
	{
		setText("description", currentDescription);
		get("description").className = "";
	}
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

// When a new Substance gets unlocked, you need to find the Igredient that
// contains that Substance. We have to unlock it here.
function updateUnlockedIngredients(announce)
{
	let i, j, n, ok, item, substance, last;
	
	last = null;
	
	for (i in itemClasses)
	{
		item = itemClasses[i];
		
		if (item instanceof Ingredient)
		{
			ok = true;
			
			for (j in item.substances)
			{
				substance = item.substances[j];
				
				if (!itemClasses[substance.name].unlocked)
				{
					ok = false;
				}
			}
			
			if (ok && !item.unlocked)
			{
				if (announce)
				{
					logMessage("<b>" + item.title + "</b> is now unlocked.", MESSAGE_NORMAL);
				}
				
				last = item;
				item.unlocked = true;
				item.update();
			}
		}
	}
	
	if (announce && last != null)
	{
		helper.showAtObject("New ingredient. Check Codex for details.", last.dom.buttonPlus);
	}
}

// When a new Substance gets unlocked, you will also be able to create the
// Substance made of unlocked ones. Unlock them here.
function updateUnlockedSubstances()
{
	let i, j, n, ok, interaction, substance;
	
	for (i in interactionClasses)
	{
		interaction = interactionClasses[i];
		
		ok = true;
		
		for (j in interaction.inputSubstances)
		{
			substance = interaction.inputSubstances[j];
			
			if (!itemClasses[substance.name].unlocked)
			{
				ok = false;
			}
		}
		
		if (ok)
		{
			for (j in interaction.outputSubstances)
			{
				substance = interaction.outputSubstances[j];
				
				itemClasses[substance.name].unlocked = true;
			}
		}
	}
}

function unlockItem(name, announce)
{
	itemClasses[name].unlocked = true;
	// itemClasses[name].update;
	updateUnlockedSubstances();
	updateUnlockedIngredients(announce);
}

function cleanTrash()
{
	let i;
	
	for (i in slots)
	{
		if (slots[i].className == "slot_trash")
		{
			slots[i].content = null;
			slots[i].contentClassName = "";
			slots[i].update();
		}
	}
}

function init()
{
	let a, b, i;
	
	tickCount = 0;
	gold = 100;
	
	for (i in itemClasses)
	{
		if (itemClasses[i] instanceof Ingredient)
		{
			itemClasses[i].setup();
			itemClasses[i].update();
		}
	}
	
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
		effect: "health",
		potionPrice: 20,
		interactionTemperatureMin: 60,
		interactionTemperatureMax: 70,
		evaporateTemperature: 80
	});
	
	itemClasses["yellow"] = new Substance({
		name: "yellow",
		title: "yellow",
		color: "#ffee33",
		description: "",
		effect: "nothing",
		potionPrice: 20,
		interactionTemperatureMin: 60,
		interactionTemperatureMax: 70,
		evaporateTemperature: 80
	});
	
	itemClasses["orange"] = new Substance({
		name: "orange",
		title: "orange",
		color: "#ffbb00",
		description: "",
		effect: "love",
		potionPrice: 40,
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
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["batwings"] = new Ingredient({
		name: "batwings",
		title: "Bat wings",
		icon: "appleseed.png",
		unit: "pair",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["cactusspines"] = new Ingredient({
		name: "cactusspines",
		title: "Cactus spines",
		icon: "appleseed.png",
		unit: "tsp",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["cricket"] = new Ingredient({
		name: "cricket",
		title: "Cricket",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["driedbeetle"] = new Ingredient({
		name: "driedbeetle",
		title: "Dried beetle",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["jasminebud"] = new Ingredient({
		name: "jasminebud",
		title: "Jasmine bud",
		icon: "appleseed.png",
		unit: "tbsp",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["komodoscale"] = new Ingredient({
		name: "komodoscale",
		title: "Komodo scale",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["lavender"] = new Ingredient({
		name: "lavender",
		title: "Lavender",
		icon: "appleseed.png",
		unit: "tsp",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["mustardseed"] = new Ingredient({
		name: "mustardseed",
		title: "Mustard seed",
		icon: "appleseed.png",
		unit: "tsp",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["pinecone"] = new Ingredient({
		name: "pinecone",
		title: "Pine cone",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["rosethorn"] = new Ingredient({
		name: "rosethorn",
		title: "Rose thorns",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["seashell"] = new Ingredient({
		name: "seashell",
		title: "Sea shell",
		icon: "appleseed.png",
		unit: "tsp",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["snakeskin"] = new Ingredient({
		name: "snakeskin",
		title: "Snake skin",
		icon: "appleseed.png",
		unit: "pcs",
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["wingofladybug"] = new Ingredient({
		name: "wingofladybug",
		title: "Wing of ladybug",
		icon: "appleseed.png",
		unit: "pair",
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
	
	names = getAllVariations('(Z,K,W,B,N,En,Ew,An,Ar)(ub,or,er,eer,et,ak)(a,e,o)(r,t,n,w)(,ak,an,un,uk,ux,on,ik,arks,oot,as,ak,ax,ek,es,o,os,on,ok,ox)');
	arrayShuffle(names);
	
	for (i=0; i<CUSTOMER_COUNT_MAX; i++)
	{
		customers.push(new Customer(i));
	}
	
	for (i=0; i<CUSTOMER_COUNT_MAX; i++)
	{
		customers[i].setupNextVisit();
	}
	arrayShuffle(customers);
	
	for (i in itemClasses)
	{
		if (itemClasses[i] instanceof Ingredient)
		{
			itemClasses[i].setup();
		}
	}
	
	
	plates.push(new Plate);
	plates.push(new Plate);
	plates.push(new Plate);
	
	for (i in plates)
	{
		plates[i].setup();
	}
	
	plates[0].select();
	
	for (i in plates)
	{
		plates[i].update();
	}
	
	for (i in itemClasses)
	{
		if (itemClasses[i] instanceof Ingredient)
		{
			itemClasses[i].update();
		}
	}
	
	inventory.store.createItem("rosepetal", 3);
	inventory.store.createItem("appleseed", 5);
	
	profile = new Profile;
	helper = new Helper;
	
	profile.setup();
	profile.update();
	unlockItem("red", false);
	
	updateDisplayPlates();
	
	setSpeed(1);
	
	a = get("box_glasses")
	
	for (i=0; i<20; i++)
	{
		slots.push(new Slot({
			x: 4 + ((i % 4) * 42),
			y: 10 + (Math.floor(i / 4) * 42),
			className: "slot",
			dragGroup: 2,
			parent: a,
			cauldronTarget: true,
			
			content: { "quality": "pure", "effect": "nothing", "color": "#ffffff" },
			contentClassName: "item_glass_empty",
			contentTooltip: "An empty bottle.<br/><br/>Brew potions in the cauldron and then put it in one of the bottles with <b>done</b>."
		}));
	}
	
	slots.push(new Slot({
		x: 68,
		y: 230,
		className: "slot_trash",
		dragGroup: 2,
		parent: a,
		
		onChange: cleanTrash.bind(),
		slotTooltip: "Trash can. Drag items here to delete."
	}));
	
	window.setInterval(tick, 50);
	
	registerAllTooltips();
}

window.onload = init;
