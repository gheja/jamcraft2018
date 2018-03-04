"use strict";

const CAULDRON_REMOVED = 0;
const CAULDRON_READY = 1;
const CAULDRON_COOKING = 2;

class Cauldron
{
	constructor()
	{
		this.temperature = 20;
		this.temperatureTarget = 20;
		this.cookTime = 0;
		this.status = CAULDRON_REMOVED;
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
	}
	
	storePotion()
	{
		if (this.temperature > 50)
		{
			logMessage("You tried to put the potion in a glass but it broke.", MESSAGE_FAIL);
		}
		else
		{
			logMessage("Potion stored.", MESSAGE_NORMAL);
		}
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
	}
}
