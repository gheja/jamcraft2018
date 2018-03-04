"use strict";

class Cauldron
{
	constructor()
	{
		this.temperature = 20;
		this.temperatureTarget = 20;
		this.cookTime = 0;
	}
	
	start()
	{
		this.cookTime = 0;
	}
	
	stop()
	{
		this.temperatureTarget = 20;
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
		this.cookTime = 0;
	}
	
	adjustTemperatureTarget(d)
	{
		this.temperatureTarget += d;
		
		this.temperatureTarget = Math.min(100, Math.max(20, this.temperatureTarget));
	}
	
	tick()
	{
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
