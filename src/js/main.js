"use strict";

let tickCount = 0;
let itemClasses = [];
let interactionClasses = [];
let cauldron = null;
let inventory = null;
let customers = [];
let currentDescription = "";
let currentTooltip = "";
let speed = 0;
let nextScreen = "";
let currentScreen = "intro";
let profile = null;
let helper = null;
let names = [];
let slots = [];
let won = false;
let gold = 0;
let sells = 0;
let ingredientUnlockOrder = [ "red", "brown", "yellow" ];
let dndActive = false;
let tirednessMax = 100;
let tiredness = 0;
let tirednessHidden = true;
let tilesetObj = null;
let tilesetLoaded = false;

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
	let i, pos1, pos2, obj;
	
	for (i=0; i<4; i++)
	{
		get("button_speed_" + i).disabled = (i == n);
	}
	
	speed = n;
	
	if (speed == 4)
	{
		get("container").classList.add("sleeping");
		pos1 = positionFix(get("button_speed_0").getBoundingClientRect());
		pos2 = positionFix(get("button_speed_4").getBoundingClientRect());
		obj = get("button_wake");
		
		obj.style.left = pos1.x + "px";
		obj.style.top = pos1.y + "px";
		obj.style.width = (pos2.x + pos2.width - pos1.x) + "px";
		obj.style.height = (pos2.y + pos2.height - pos1.y) + "px";
		obj.style.display = "block";
	}
	else
	{
		get("container").classList.remove("sleeping");
		
		obj = get("button_wake");
		obj.style.display = "none";
	}
}

function toggleDnd()
{
	dndActive = !dndActive;
	
	if (dndActive)
	{
		get("dnd_status").innerHTML = "ON";
	}
	else
	{
		get("dnd_status").innerHTML = "off";
	}
}

function bumpSellCount()
{
	let unlock, i, a;
	
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
			a = ingredientUnlockOrder[i];
			
			if (!itemClasses[a].unlocked)
			{
				unlockItem(a, true);
				break;
			}
		}
		
		// increase concurrent customer limit
		profile.maxActiveCustomers++;
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
		"box_description",
		"box_codex",
		"box_glasses",
		"box_nothing",
		"box_intro",
		"box_feedbacks",
		"box_messages"
	], "none");
	
	setDisplay([
		"box_time",
		"box_navigation",
	], "block");
	
	switch (nextScreen)
	{
		case "home":
			setDisplay([
				"box_customers",
				"box_cauldron",
				"box_ingredients",
				"box_description",
				"box_glasses",
				"box_feedbacks",
				"box_messages"
			], "block");
		break;
		
		case "codex":
			setDisplay([
				"box_codex"
			], "block");
		break;
		
		default:
			setDisplay([
				"box_nothing"
			], "block");
		break;
	}
	
	currentScreen = nextScreen;
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

function updateDisplay()
{
	let s, pos;
	
	if (tirednessHidden && tiredness > tirednessMax * 0.1)
	{
		// get("tiredness_meter_bg").style.display = "block";
		get("tiredness_meter_fg").style.display = "block";
		get("tiredness_meter_text").style.display = "block";
		if (once("helper:tiredness"))
		{
			helper.showAtObject("This is your tiredness meter, you can reduce it by sleeping.", get("tiredness_meter_text"), null, "tiredness");
		}
		tirednessHidden = false;
	}
	
	setText('temperature_target', Math.round(cauldron.temperatureTarget) + " &deg;C");
	if (cauldron.status == CAULDRON_REMOVED)
	{
		setText('temperature_current', "-");
	}
	else
	{
		setText('temperature_current', Math.round(cauldron.temperature) + " &deg;C");
	}
	
	setText('cooking_time', toHoursMinutes(cauldron.cookTime));
	
	get("button_cauldron_prepare").disabled = (cauldron.status != CAULDRON_REMOVED);
	get("button_cauldron_done").disabled = (cauldron.status == CAULDRON_REMOVED);
	
	if (cauldron.status == CAULDRON_REMOVED)
	{
		s = "No cauldron in use.";
	}
	else
	{
		// setText("cauldron_content", getContentsString(cauldron.store));
		s = cauldron.store.getPotionText(true);
		
		if (cauldron.temperature >= 60)
		{
			s += "<br/><span class=\"warning\">Too hot to put in a glass.</span>";
		}
	}
	
	setText("cauldron_content", s);
	
	get("cauldron_fire").style.display = ((cauldron.temperatureTarget > 20 && cauldron.status != CAULDRON_REMOVED) ? "block" : "none");
	get("cauldron_main").style.display = (cauldron.status != CAULDRON_REMOVED ? "block" : "none");
	get("cauldron_top").style.display = get("cauldron_main").style.display;
	
	pos = positionFix(get("tiredness_meter_bg").getBoundingClientRect());
	
	get("button_wake").disabled = (tiredness > tirednessMax * 0.8);
	
	get("tiredness_meter_fg").style.width = (pos.width * Math.min(1, tiredness / tirednessMax)) + "px";
	
	cauldron.draw();
}

function tick()
{
	let i, skip;
	
	skip = false;
	
	// if player is not on the home screen then game should be paused
	if (currentScreen != "home")
	{
		skip = true;
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
		
		// every 30 minutes
		if ((tickCount * TICK_SECONDS) % 1800 == 0)
		{
			if (restockBottle())
			{
				logMessage("You've got a new bottle.", MESSAGE_NORMAL);
			}
		}
		
		tiredness += 0.012;
		
		if (cauldron.status == CAULDRON_COOKING)
		{
			tiredness += 0.012;
		}
		
		// if too tired then fall asleep automatically
		if (tiredness >= tirednessMax)
		{
			setSpeed(4);
		}
		
		// sleeping
		if (speed == 4)
		{
			tiredness = Math.max(0, tiredness - 0.08);
		}
	}
}

function tickTimer()
{
	let i, count;
	
	switch (speed)
	{
		case 0: // paused
			count = 0;
		break;
		
		case 1: // normal
			count = 1
		break;
		
		case 2: // fast
			count = 3;
		break;
		
		case 3: // faster
			count = 6;
		break;
		
		case 4: // sleeping
			count = 6;
		break;
	}
	
	for (i=0; i<count; i++)
	{
		tick();
	}
	
	setText("time", toTime(tickCount, true));
	setText("gold", "<b>" + gold + " gold</b>");
	
	updateDisplay();
	
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
		helper.showAtObject("New ingredient. Check Codex for details.", last.dom.buttonPlus, null, "new_ingredient");
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

function restockBottle()
{
	let i, obj;
	
	obj = null;
	
	for (i in slots)
	{
		if (slots[i].content == null && slots[i].cauldronTarget)
		{
			obj = slots[i];
			break;
		}
	}
	
	if (!obj)
	{
		return false;
	}
	
	obj.content = { "quality": "pure", "effect": "nothing", "color": "#ffffff" };
	obj.contentClassName = "item_glass_empty";
	obj.contentTooltip = "An empty bottle.<br/><br/>Brew potions in the cauldron and then put it in one of the bottles with <b>done</b>.";
	obj.snapPositionToSlot();
	obj.update();
	
	return true;
}

function onResize()
{
	let obj, pos1, pos2;
	
	obj = get("container");
	
	pos1 = positionFix(document.body.getBoundingClientRect());
	pos2 = positionFix(obj.getBoundingClientRect());
	
	obj.style.left = Math.floor((pos1.width - pos2.width) / 2) + "px";
	obj.style.top = Math.floor((pos1.height - pos2.height) / 2) + "px";
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

function hideFeedbackHelpers()
{
	helper.hideByName("feedbacks_1");
	helper.hideByName("feedbacks_2");
	helper.hideByName("feedbacks_3");
	helper.hideByName("feedbacks_4");
}

function tilesetLoadedCallback()
{
	tilesetLoaded = true;
	
	get("button_start").disabled = false;
}

function tilesetInit()
{
	tilesetObj = new Image();
	tilesetObj.addEventListener('load', tilesetLoadedCallback);
	tilesetObj.src = "./images/gfx.png";
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
		color: { h: 0, s: 0, l: 100, a: 0.4 },
		description: "",
		evaporateTemperature: 0,
		hidden: true
	});
	
	itemClasses["red"] = new Substance({
		name: "red",
		title: "red",
		color: { h: 0, s: 92, l: 92, a: 1 },
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
		color: { h: 60, s: 100, l: 100, a: 1 },
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
		color: { h: 29, s: 92, l: 92, a: 1 },
		description: "",
		effect: "love",
		potionPrice: 40,
		interactionTemperatureMin: 0,
		interactionTemperatureMax: 0,
		evaporateTemperature: 300
	});
	
	itemClasses["brown"] = new Substance({
		name: "brown",
		title: "brown",
		color: { h: 29, s: 92, l: 60, a: 1 },
		description: "",
		effect: "rest",
		potionPrice: 23,
		interactionTemperatureMin: 0,
		interactionTemperatureMax: 0,
		evaporateTemperature: 300
	});
	
	itemClasses["placeholder"] = new Substance({
		name: "placeholder",
		title: "Placeholder substance",
		color: { h: 29, s: 92, l: 92, a: 1 },
		description: "",
		effect: "nothing",
		potionPrice: 0,
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
			{ name: "orange", ratio: 1 },
		],
		speed: 0.5 // units per minute
	}));
	
	itemClasses["rosepetal"] = new Ingredient({
		name: "rosepetal",
		title: "Rose Petal",
		unit: "tbsp",
		tilesetLeft: 0,
		tilesetTop: 141,
		dissolveTemperature: 30,
		dissolveSpeed: 0.5, // units per minute
		substances: [
			{ name: "red", amount: 1 }
		]
	});
	
	itemClasses["appleseed"] = new Ingredient({
		name: "appleseed",
		title: "Apple Seed",
		unit: "tbsp",
		tilesetLeft: 0,
		tilesetTop: 173,
		dissolveTemperature: 50,
		dissolveSpeed: 0.5, // units per minute
		substances: [
			{ name: "brown", amount: 1 }
		]
	});
	
	itemClasses["jasminebud"] = new Ingredient({
		name: "jasminebud",
		title: "Jasmine bud",
		unit: "tbsp",
		tilesetLeft: 160,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.5, // units per minute
		substances: [
			{ name: "yellow", amount: 1 }
		]
	});
	
	itemClasses["batwings"] = new Ingredient({
		name: "batwings",
		title: "Bat wings",
		unit: "pair",
		tilesetLeft: 32,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.5, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["cactusspines"] = new Ingredient({
		name: "cactusspines",
		title: "Cactus spines",
		unit: "tsp",
		tilesetLeft: 32,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["cricket"] = new Ingredient({
		name: "cricket",
		title: "Cricket",
		unit: "pcs",
		tilesetLeft: 64,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["driedbeetle"] = new Ingredient({
		name: "driedbeetle",
		title: "Dried beetle",
		unit: "pcs",
		tilesetLeft: 96,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["komodoscale"] = new Ingredient({
		name: "komodoscale",
		title: "Komodo scale",
		unit: "pcs",
		tilesetLeft: 128,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["lavender"] = new Ingredient({
		name: "lavender",
		title: "Lavender",
		unit: "tsp",
		tilesetLeft: 128,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["mustardseed"] = new Ingredient({
		name: "mustardseed",
		title: "Mustard seed",
		unit: "tsp",
		tilesetLeft: 192,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["pinecone"] = new Ingredient({
		name: "pinecone",
		title: "Pine cone",
		unit: "pcs",
		tilesetLeft: 96,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["rosethorn"] = new Ingredient({
		name: "rosethorn",
		title: "Rose thorns",
		unit: "pcs",
		tilesetLeft: 64,
		tilesetTop: 141,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["seashell"] = new Ingredient({
		name: "seashell",
		title: "Sea shell",
		unit: "tsp",
		tilesetLeft: 160,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["snakeskin"] = new Ingredient({
		name: "snakeskin",
		title: "Snake skin",
		unit: "pcs",
		tilesetLeft: 192,
		tilesetTop: 173,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
		]
	});
	
	itemClasses["wingofladybug"] = new Ingredient({
		name: "wingofladybug",
		title: "Wing of ladybug",
		unit: "pair",
		tilesetLeft: 0,
		tilesetTop: 205,
		dissolveTemperature: 40,
		dissolveSpeed: 0.1, // units per minute
		substances: [
			{ name: "placeholder", amount: 1 }
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
		customers[i].setState(CUSTOMER_STATE_AWAY, { first: (i < 2) });
	}
	arrayShuffle(customers);
	
	for (i in itemClasses)
	{
		if (itemClasses[i] instanceof Ingredient)
		{
			itemClasses[i].setup();
		}
	}
	
	for (i in itemClasses)
	{
		if (itemClasses[i] instanceof Ingredient)
		{
			itemClasses[i].update();
		}
	}
	
	inventory.store.createItem("rosepetal", 10);
	inventory.store.createItem("appleseed", 10);
	inventory.store.createItem("jasminebud", 10);
	
	profile = new Profile;
	helper = new Helper;
	
	profile.setup();
	profile.update();
	unlockItem("red", false);
	
	setSpeed(0);
	
	a = get("box_glasses")
	
	for (i=0; i<20; i++)
	{
		slots.push(new Slot({
			x: 4 + ((i % 4) * 42),
			y: 10 + (Math.floor(i / 4) * 42),
			className: "slot",
			dragGroup: 2,
			parent: a,
			cauldronTarget: true
		}));
	}
	
	for (i=0; i<INITIAL_BOTTLE_COUNT; i++)
	{
		restockBottle();
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
	
	window.setInterval(tickTimer, 50);
	window.addEventListener("resize", onResize);
	onResize();
	
	tilesetInit();
	
	registerAllTooltips();
}

window.onload = init;
