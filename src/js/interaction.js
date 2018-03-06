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
	
	doInteraction(store, temperature)
	{
		let i, a, s, minMultiplier;
		
		// TODO: check speed
		minMultiplier = this.speed;
		
		for (i in this.inputSubstances)
		{
			s = this.inputSubstances[i];
			
			if (store.items[s.name] == 0)
			{
				return;
			}
			
			if (temperature < itemClasses[s.name].interactionTemperatureMin || temperature > itemClasses[s.name].interactionTemperatureMax)
			{
				return;
			}
			
			a = Math.min(store.items[s.name], s.ratio * this.speed);
			
			minMultiplier = Math.min(minMultiplier, a);
		}
		
		// TODO: pointless? can any of the input substances be 0?
		if (minMultiplier == 0)
		{
			return;
		}
		
		// delete input substances
		for (i in this.inputSubstances)
		{
			s = this.inputSubstances[i];
			
			store.destroyItem(s.name, minMultiplier * s.ratio);
		}
		
		// create output substances
		for (i in this.outputSubstances)
		{
			s = this.outputSubstances[i];
			
			store.createItem(s.name, minMultiplier * s.ratio);
		}
	}
	
	checkInteractionsInStore(store)
	{
		let i, j, checked;
		
		checked = [];
		
		console.log("---");
		
		for (i in store.items)
		{
			checked.push(i);
			
			for (j in store.items)
			{
				if (checked.indexOf(j) != -1)
				{
					continue;
				}
				
				console.log(i + " - " + j);
			}
		}
	}
}
