"use strict";

class Plate
{
	constructor(params)
	{
		this.ingredients = [];
		this.selected = false;
		
		this.store = new Store;
	}
	
	use()
	{
		this.store.moveAllItems(cauldron.store);
	}
}
