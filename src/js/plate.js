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
		let i, j, a, count;
		
		this.store.moveAllItems(cauldron.store);
	}
}
