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
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
	}
}
