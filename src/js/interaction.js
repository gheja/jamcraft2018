"use strict";

class Interaction
{
	constructor(params)
	{
		let k;
		
		this.inputSubstances = [];
		this.outputSubstances = [];
		this.speed = 0;
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
	}
}
