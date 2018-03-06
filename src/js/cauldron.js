"use strict";

const CAULDRON_REMOVED = 0;
const CAULDRON_READY = 1;
const CAULDRON_COOKING = 2;

class Cauldron
{
	constructor()
	{
		let i;
		
		this.temperature = 20;
		this.temperatureTarget = 20;
		this.cookTime = 0;
		this.status = CAULDRON_REMOVED;
		
		this.store = new Store;
	}
	
	start()
	{
		this.cookTime = 0;
	}
	
	prepare()
	{
		this.status = CAULDRON_READY;
		this.cookTime = 0;
		this.temperature = 20;
	}
	
	stop()
	{
		this.temperatureTarget = 20;
		this.status = CAULDRON_REMOVED;
		this.store.clear();
	}
	
	storePotion()
	{
		let i;
		
		if (this.temperature > 50)
		{
			logMessage("You tried to put the potion in a glass but it broke.", MESSAGE_FAIL);
		}
		else
		{
			logMessage("Potion stored.", MESSAGE_NORMAL);
		}
		
		this.store.clear();
	}
	
	done()
	{
		this.stop();
		this.storePotion();
	}
	
	adjustTemperatureTarget(d)
	{
		this.temperatureTarget += d;
		
		this.temperatureTarget = Math.min(100, Math.max(20, this.temperatureTarget));
	}
	
	tick()
	{
		let i, a, j, item, count, ingredient, substance1, substance2;
		
		if (this.status != CAULDRON_READY && this.status != CAULDRON_COOKING)
		{
			return;
		}
		
		if (this.temperature > 20)
		{
			this.cookTime += 1;
		}
		
		if (this.temperature < this.temperatureTarget)
		{
			this.temperature += Math.min(2, this.temperatureTarget - this.temperature);
		}
		
		if (this.temperature > this.temperatureTarget)
		{
			this.temperature += Math.min(-2, this.temperature - this.temperatureTarget);
		}
		
		for (i in this.store.items)
		{
			count = this.store.items[i];
			item = itemClasses[i];
			
			if (this.store.items[i] == 0)
			{
				continue;
			}
			
			if (item instanceof Ingredient && this.temperature > item.dissolveTemperature)
			{
				a = item.dissolveSpeed * 0.5;
				a = Math.min(a, count);
				
				this.store.destroyItem(i, a);
				
				for (j in item.substances)
				{
					this.store.createItem(item.substances[j].name, item.substances[j].amount * a);
				}
			}
		}
		
		for (i in interactionClasses)
		{
			interactionClasses[i].doInteraction(this.store, this.temperature);
		}
		
		this.store.round();
	}
}
