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
		this.update();
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
		
		b = createDomElement("div", "plate_picture plate_picture_empty");
		b.dataset.tooltip = "An empty plate.";
		this.dom.picture = b;
		a.appendChild(b);
		
		b = createDomElement("button", "plate_select");
		b.onclick = this.select.bind(this);
		b.innerHTML = "select";
		b.dataset.tooltip = "Select this plate so the ingredients can be added to and removed from it.";
		this.dom.select = b;
		a.appendChild(b);
		
		b = createDomElement("button", "plate_use");
		b.onclick = this.use.bind(this);
		b.innerHTML = "&#9660;";
		b.dataset.tooltip = "Put the contents of this plate into the cauldron.";
		this.dom.use = b;
		a.appendChild(b);
		
		obj.appendChild(a);
	}
	
	update()
	{
		let i, empty, item, s;
		
		empty = true;
		s = "";
		
		for (i in this.store.items)
		{
			if (this.store.items[i] != 0)
			{
				empty = false;
				s += "&nbsp;- " + this.store.items[i] + " " + itemClasses[i].unit + " of <b>" + itemClasses[i].title + "</b><br/>";
			}
		}
		
		if (empty)
		{
			s = "An empty plate.";
		}
		else
		{
			s = "This plate contains...<br/>" + s;
		}
		
		
		this.dom.picture.dataset.tooltip = s;
		
		this.dom.select.disabled = (this == currentPlate);
		this.dom.picture.className = "plate_picture" + (empty ? " plate_picture_empty" : "");
		for (i in itemClasses)
		{
			item = itemClasses[i];
			
			if (item instanceof Ingredient)
			{
				item.update();
			}
		}
	}
}
