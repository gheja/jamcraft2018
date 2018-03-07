"use strict";

class Ingredient extends Item
{
	constructor(params)
	{
		super();
		
		let k;
		
		this.name = "?";
		this.title = "?";
		this.icon = "e";
		this.unit = "?";
		this.substances = [];
		this.unlocked = false;
		
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
