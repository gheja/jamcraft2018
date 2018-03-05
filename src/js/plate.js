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
		
		for (i in this.store.ingredients)
		{
			// all of it
			this.store.moveIngredient(cauldron.store, i, 9999);
		}
	}
}
