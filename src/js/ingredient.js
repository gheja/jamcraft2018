"use strict";

class Ingredient extends Item
{
	constructor(params)
	{
		super();
		
		let k;
		
		this.icon = "e";
		this.unit = "?";
		this.substances = [];
		
		this.chanceGarden = 0;
		this.chanceMerchant = 0;
		this.dissolveTemperature = 50;
		this.dissolveSpeed = 1;
		this.buyAmount = 5;
		this.buyCost = 5;
		this.assembledDescription = "";
		this.tilesetLeft = 0;
		this.tilesetTop = 0;
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
		
		this.dom = {
			root: null,
			inventoryPlus: null,
			inventoryMinus: null
		};
	}
	
	buy()
	{
		if (gold < this.buyCost)
		{
			logMessage("You don't have enough golds to buy this.", MESSAGE_FAIL);
			return;
		}
		
		gold -= this.buyCost;
		
		inventory.store.items[this.name] += this.buyAmount;
		
		this.update();
	}
	
	addToCauldron()
	{
		helper.hideByName("new_ingredient");
		helper.hideByName("add_ingredient");
		
		if (once("helper:temperature_adjustment"))
		{
			helper.showAtObject("Use the <b>up</b> and <b>down arrows</b> to adjust temperature.", get("button_cauldron_up"), null, "temperature_adjustment");
		}
		
		if (cauldron.status == CAULDRON_REMOVED)
		{
			logMessage("No cauldron in use.", MESSAGE_FAIL);
			return;
		}
		
		inventory.store.moveItem(cauldron.store, this.name, 1);
		this.update();
	}
	
	setup()
	{
		let a, b, obj, s, i;
		
		obj = get("ingredients");
		
		a = createDiv("ingredient");
		this.dom.root = a;
		
		b = createDomElement("div", "ingredient_picture");
		b.style.backgroundPositionX = "-" + this.tilesetLeft + "px";
		b.style.backgroundPositionY = "-" + this.tilesetTop + "px";
		b.dataset.tooltip = this.title;
		this.dom.picture = b;
		a.appendChild(b);
		
		b = createDomElement("div", "ingredient_counter");
		b.dataset.tooltip = "You have x " + this.unit + " of " + this.title + ".";
		this.dom.counter = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_buy");
		b.onclick = this.buy.bind(this);
		b.dataset.tooltip = "Buy " + this.buyAmount + " " + this.unit + " " + this.title + " for " + this.buyCost + " gold.";
		b.innerHTML = "$";
		this.dom.buttonBuy = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_plus");
		b.onclick = this.addToCauldron.bind(this);
		b.dataset.tooltip = "Put 1 " + this.unit + " " + this.title + " in the cauldron.";
		b.innerHTML = "&#9660;";
		this.dom.buttonPlus = b;
		a.appendChild(b);
		
		obj.appendChild(a);
		
		s = "";
		
		for (i in this.substances)
		{
			s += "<b>" + this.substances[i].name + "</b>, ";
		}
		
		s = s.substr(0, s.length - 2);
		
		this.assembledDescription = "Starts to dissolve at <b>" + this.dissolveTemperature + " &deg;C</b>, contains " + s + ".";
	}
	
	update()
	{
		let tooltip;
		
		this.dom.root.style.display = (this.unlocked ? "block" : "none");
		this.dom.buttonPlus.disabled = !(inventory.store.items[this.name] > 0);
		this.dom.counter.innerHTML = inventory.store.items[this.name];
		
		if (inventory.store.items[this.name] > 0)
		{
			this.dom.root.className = "ingredient";
			tooltip = "You have " + inventory.store.items[this.name] + " " + this.unit + " of <b>" + this.title + "</b>.";
		}
		else
		{
			this.dom.root.className = "ingredient ingredient_disabled";
			tooltip = "You have no <b>" + this.title + "</b> left.";
		}
		
		tooltip += "<br/><br/>" + this.assembledDescription + "<br/><br/>Check the <b>Codex</b> for more info.";
		
		this.dom.counter.dataset.tooltip = tooltip;
		this.dom.picture.dataset.tooltip = tooltip;
	}
}
