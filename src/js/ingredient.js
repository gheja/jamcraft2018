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
	
	addToPlate()
	{
		inventory.store.moveItem(currentPlate.store, this.name, 1);
		this.update();
		currentPlate.update();
	}
	
	removeFromPlate()
	{
		currentPlate.store.moveItem(inventory.store, this.name, 1);
		this.update();
		currentPlate.update();
	}
	
	setup()
	{
		let a, b, obj, s, i;
		
		obj = get("ingredients");
		
		a = createDiv("ingredient");
		this.dom.root = a;
		
		b = createDomElement("div", "ingredient_picture ingredient_picture_" + this.name);
		b.dataset.tooltip = this.title;
		this.dom.picture = b;
		a.appendChild(b);
		
		b = createDomElement("div", "ingredient_counter");
		b.dataset.tooltip = "You have x " + this.unit + " of " + this.title + ".";
		this.dom.counter = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_minus");
		b.onclick = this.removeFromPlate.bind(this);
		b.dataset.tooltip = "Remove 1 " + this.unit + " " + this.title + " from the selected plate.";
		b.innerHTML = "&#9650;";
		this.dom.buttonMinus = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_plus");
		b.onclick = this.addToPlate.bind(this);
		b.dataset.tooltip = "Put 1 " + this.unit + " " + this.title + " from the selected plate.";
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
		this.dom.buttonMinus.disabled = !(currentPlate.store.items[this.name] > 0);
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
		
		tooltip += "<br/><br/>" + this.assembledDescription + "<br/><br/>Click for more info.";
		
		this.dom.counter.dataset.tooltip = tooltip;
		this.dom.picture.dataset.tooltip = tooltip;
	}
}
