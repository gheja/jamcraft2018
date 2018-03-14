"use strict";

class Substance extends Item
{
	constructor(params)
	{
		super();
		
		let k;
		
		this.unit = "ml";
		this.color = "#ff00ff";
		this.description = "Unconfigured substance";
		this.interactionTemperatureMin = 30;
		this.interactionTemperatureMax = 70;
		this.evaporateTemperature = 0;
		this.hidden = false;
		this.effect = "none";
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
	}
}
