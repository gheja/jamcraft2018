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
	}
	
	removeFromPlate()
	{
		currentPlate.store.moveItem(inventory.store, this.name, 1);
		this.update();
	}
	
	setup()
	{
		let a, b, obj;
		
		obj = get("ingredients");
		
		a = createDiv("ingredient");
		this.dom.root = a;
		
		b = createDomElement("div", "ingredient_picture ingredient_picture_" + this.name);
		a.appendChild(b);
		
		b = createDomElement("div", "ingredient_counter");
		this.dom.counter = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_minus");
		b.onclick = this.removeFromPlate.bind(this);
		b.innerHTML = "-";
		this.dom.buttonMinus = b;
		a.appendChild(b);
		
		b = createDomElement("button", "ingredient_plus");
		b.onclick = this.addToPlate.bind(this);
		b.innerHTML = "+";
		this.dom.buttonPlus = b;
		a.appendChild(b);
		
		obj.appendChild(a);
	}
	
	update()
	{
		this.dom.root.style.display = (this.unlocked ? "block" : "none");
		this.dom.buttonMinus = (currentPlate.store.items[this.name] > 0);
		this.dom.buttonPlus = (inventory.store.items[this.name] > 0);
		this.dom.counter.innerHTML = inventory.store.items[this.name];
	}
}
