"use strict";

class Ingredient
{
	constructor(params)
	{
		let k;
		
		this.name = "?";
		this.icon = "e";
		this.unit = "?";
		this.substances = [];
		this.unlocked = false;
		
		this.countInventory = 0;
		this.countGarden = 0;
		this.countMerchant = 0;
		
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
	}
}
