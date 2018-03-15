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
		let a, b, obj;
		
		obj = get("ingredients");
		
		a = createDiv("ingredient");
		this.dom.root = a;
		
		b = createDomElement("div", "ingredient_picture ingredient_picture_" + this.name);
		b.dataset.tooltip = this.title + " (ingredient)";
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
	}
	
	update()
	{
		this.dom.root.style.display = (this.unlocked ? "block" : "none");
		this.dom.buttonMinus.disabled = !(currentPlate.store.items[this.name] > 0);
		this.dom.buttonPlus.disabled = !(inventory.store.items[this.name] > 0);
		this.dom.counter.innerHTML = inventory.store.items[this.name];
		
		if (inventory.store.items[this.name] > 0)
		{
			this.dom.counter.dataset.tooltip = "You have " + inventory.store.items[this.name] + " " + this.unit + " of " + this.title + ".";
		}
		else
		{
			this.dom.counter.dataset.tooltip = "You have no " + this.title + " left.";
		}
	}
}
