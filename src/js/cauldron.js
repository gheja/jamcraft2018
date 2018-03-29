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
		this.dom = {
			top: get("cauldron_top"),
			canvas: get("cauldron_content_canvas"),
			ctx: null
		};
		
		this.dom.canvas.width = 200;
		this.dom.canvas.height = 100;
		this.dom.ctx = this.dom.canvas.getContext("2d");
		
		this.store = new Store;
	}
	
	start()
	{
		this.cookTime = 0;
	}
	
	prepare()
	{
		helper.hideByName("cauldron_prepare");
		if (once("helper:add_ingredient"))
		{
			helper.showAtObject("Add ingredients by clicking <b>down arrow</b>, buy more by clicking <b>$</b>.", itemClasses["rosepetal"].dom.buttonPlus, null, "add_ingredient");
		}
		
		this.status = CAULDRON_READY;
		this.cookTime = 0;
		this.temperature = 20;
		this.store.createItem("air", 1);
	}
	
	stop()
	{
		this.temperatureTarget = 20;
		this.status = CAULDRON_REMOVED;
		// this.store.clear();
	}
	
	strain()
	{
		let i, n, left;
		
		helper.hideByName("strain");
		
		n = 1.2;
		left = 1;
		
		while (n > 0 && left > 0)
		{
			left = 0;
			
			for (i in this.store.items)
			{
				if (itemClasses[i] instanceof Ingredient && this.store.items[i] > 0)
				{
					this.store.destroyItem(i, 0.1);
					n -= 0.1;
					
					if (n <= 0)
					{
						break;
					}
					
					left += this.store.items[i];
				}
			}
		}
	}
	
	storePotion()
	{
		let i, tmp, slot;
		
		helper.hideByName("strain");
		
		slot = null;
		
		for (i in slots)
		{
			if (slots[i].content == null || slots[i].contentClassName != "item_glass_empty" || !slots[i].cauldronTarget)
			{
				continue;
			}
			
			slot = slots[i];
			break;
		}
		
		if (slot == null)
		{
			logMessage("No more empty glasses left.", MESSAGE_FAIL);
			return;
		}
		
		
		if (this.temperature >= 60)
		{
			slot.contentClassName = "item_glass_broken";
			slot.contentTooltip = "A broken bottle. Not useful anymore.";
			slot.update();
			
			logMessage("You tried to put the hot potion in a bottle but it broke.", MESSAGE_FAIL);
		}
		else
		{
			
			this.store.finalize();
			
			slot.content = {
				"quality": this.store.getPotionQuality(),
				"effect": this.store.getPotionEffect(),
				"color": this.store.getPotionColor(),
				"text": this.store.getPotionText()
			};
			
			slot.content.color = this.store.color;
			slot.dom.content.style.backgroundColor = slot.content.color;
			slot.contentTooltip = slot.content.text;
			slot.contentClassName = "item_glass_full";
			slot.update();
			
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
		helper.hideByName("temperature_adjustment");
		if (once("helper:strain"))
		{
			helper.showAtObject("Use <b>Strain</b> to remove leftover ingredients, <b>done</b> when done.", get("button_cauldron_strain"), null, "strain");
		}
		
		this.temperatureTarget += d;
		
		this.temperatureTarget = Math.min(100, Math.max(20, this.temperatureTarget));
	}
	
	draw()
	{
		this.store.draw(this.dom.ctx);
	}
	
	tick()
	{
		let i, a, j, item, count, ingredient, substance1, substance2, status;
		
		status = "";
		
		if (this.status != CAULDRON_READY && this.status != CAULDRON_COOKING)
		{
			return;
		}
		
		// TODO: this is too hackish
		if (this.temperature < 40)
		{
			this.dom.top.style.backgroundPositionY = (-233) + "px";
		}
		else if (this.temperature < 80)
		{
			this.dom.top.style.backgroundPositionY = (-233 - (1 + tickCount % 3) * 12) + "px";
		}
		else
		{
			this.dom.top.style.backgroundPositionY = (-233 - (4 + tickCount % 3) * 12) + "px";
		}
		
		
		if (this.temperature > 20)
		{
			this.status = CAULDRON_COOKING;
			this.cookTime += 1;
		}
		else
		{
			this.status = CAULDRON_READY;
		}
		
		if (this.temperature < this.temperatureTarget)
		{
			this.temperature += Math.min(2 * GAME_SPEED, this.temperatureTarget - this.temperature);
		}
		
		if (this.temperature > this.temperatureTarget)
		{
			this.temperature += Math.min(-2 * GAME_SPEED, this.temperature - this.temperatureTarget);
		}
		
		for (i in this.store.items)
		{
			count = this.store.items[i];
			item = itemClasses[i];
			
			if (this.store.items[i] == 0)
			{
				continue;
			}
			
			if (item instanceof Ingredient && this.temperature >= item.dissolveTemperature)
			{
				a = item.dissolveSpeed * 0.5 * GAME_SPEED;
				a = Math.min(a, count);
				
				this.store.destroyItem(i, a);
				
				for (j in item.substances)
				{
					this.store.createItem(item.substances[j].name, item.substances[j].amount * a);
				}
				
				status += "<b>" + item.title + "</b> is dissolving.<br/>";
			}
		}
		
		for (i in interactionClasses)
		{
			interactionClasses[i].doInteraction(this.store, this.temperature);
		}
		
		this.store.round();
		
		this.store.update();
		this.dom.top.style.backgroundColor = hslaArrayToString(this.store.color);
		
		currentDescription += status;
	}
}
