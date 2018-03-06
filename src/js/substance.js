"use strict";

// class Substance extends Item
class Substance
{
	constructor(params)
	{
		let k;
		
		this.name = "?";
		this.unit = "ml";
		this.color = "#ff00ff";
		this.description = "Unconfigured substance";
		this.unlocked = false;
		this.interactionTemperatureMin = 0;
		this.interactionTemperatureMax = 70;
		this.evaporateTemperature = 90;
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
	}
}
