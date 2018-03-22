"use strict";

class Interaction
{
	constructor(params)
	{
		let k;
		
		this.inputSubstances = [];
		this.outputSubstances = [];
		this.speed = 0;
		this.evaporation = false;
		
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
		let i, a, s, minMultiplier, status;
		
		// TODO: check speed
		minMultiplier = this.speed * GAME_SPEED;
		
		for (i in this.inputSubstances)
		{
			s = this.inputSubstances[i];
			
			if (store.items[s.name] == 0)
			{
				return;
			}
			
			if (!this.evaporation)
			{
				if (temperature < itemClasses[s.name].interactionTemperatureMin || temperature > itemClasses[s.name].interactionTemperatureMax)
				{
					return;
				}
			}
			else
			{
				if (temperature < itemClasses[s.name].evaporateTemperature)
				{
					return;
				}
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
		
		status = "";
		
		// create description
		if (!this.evaporation)
		{
			status += "Reaction: "
			
			for (i in this.inputSubstances)
			{
				s = this.inputSubstances[i];
				
				status += "<b>" + itemClasses[s.name].title + "</b> + ";
			}
			
			status = status.substring(0, status.length - 3);
				
			status += " -> ";
			
			for (i in this.outputSubstances)
			{
				s = this.outputSubstances[i];
				
				status += "<b>" + itemClasses[s.name].title + "</b> + ";
			}
			
			status = status.substring(0, status.length - 3);
		}
		else
		{
			status += "<b>" + itemClasses[this.inputSubstances[0].name].title + "</b> is evaporating.";
		}
		
		currentDescription += status + "<br/>";
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
