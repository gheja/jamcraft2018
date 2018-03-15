"use strict";

class Plate
{
	constructor(params)
	{
		this.ingredients = [];
		this.selected = false;
		
		this.store = new Store;
		
		this.dom = {
			root: null,
			image: null,
			select: null,
			use: null
		};
	}
	
	use()
	{
		let i;
		
		if (cauldron.status == CAULDRON_REMOVED)
		{
			logMessage("No cauldron in use.", MESSAGE_FAIL);
			return;
		}
		
		this.store.moveAllItems(cauldron.store);
	}
	
	select()
	{
		let i;
		
		currentPlate = this;
		
		for (i in plates)
		{
			plates[i].update();
		}
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
		
		obj = get("plates");
		
		a = createDiv("plate");
		this.dom.root = a;
		
		b = createDomElement("div", "plate_picture_empty");
		a.appendChild(b);
		
		b = createDomElement("button", "plate_select");
		b.onclick = this.select.bind(this);
		b.innerHTML = "select";
		this.dom.select = b;
		a.appendChild(b);
		
		b = createDomElement("button", "plate_use");
		b.onclick = this.use.bind(this);
		b.innerHTML = "&#9660;";
		this.dom.select = b;
		a.appendChild(b);
		
		obj.appendChild(a);
	}
	
	update()
	{
		
		return;
		
		this.dom.root.style.display = (this.unlocked ? "block" : "none");
		this.dom.buttonMinus = (currentPlate.store.items[this.name] > 0);
		this.dom.buttonPlus = (inventory.store.items[this.name] > 0);
		this.dom.counter.innerHTML = inventory.store.items[this.name];
//			plates[i].dom.select.disabled = (plates[i] == currentPlate);
	}
}
