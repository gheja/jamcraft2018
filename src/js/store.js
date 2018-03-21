"use strict";

class Store
{
	constructor()
	{
		let i;
		
		this.items = [];
		this.objects = [];
		this.color = { h: 0, s: 0, l: 0, a: 0 };
		
		for (i in itemClasses)
		{
			this.items[i] = 0;
		}
	}
	
	createItem(a, count)
	{
		this.items[a] += count;
	}
	
	moveItem(target, a, count)
	{
		count = Math.min(count, this.items[a]);
		
		this.items[a] -= count;
		target.items[a] += count;
	}
	
	moveAllItems(target)
	{
		let i;
		
		for (i in this.items)
		{
			this.moveItem(target, i, this.items[i]);
		}
	}
	
	destroyItem(a, count)
	{
		count = Math.min(count, this.items[a]);
		
		this.items[a] -= count;
	}
	
	round()
	{
		let i;
		
		for (i in this.items)
		{
			this.items[i] = Math.floor(this.items[i] * 1000) / 1000;
		}
	}
	
	finalize()
	{
		let i;
		
		for (i in this.items)
		{
			this.items[i] = parseFloat(round(this.items[i]));
		}
	}
	
	update()
	{
		let i, amount, arr;
		
		arr = [];
		
		for (i in this.items)
		{
			amount = this.items[i];
			
			if (amount > 0 && itemClasses[i] instanceof Substance)
			{
				arr.push({ color: itemClasses[i].color, amount: amount });
			}
		}
		
		this.color = mixColors(arr);
	}
	
	clear()
	{
		let i;
		
		for (i in this.items)
		{
			this.destroyItem(i, 9999);
		}
	}
	
	getPotionQuality()
	{
		let i, total;
		
		total = 0;
		
		for (i in this.items)
		{
			if (!(itemClasses[i] instanceof Ingredient) || itemClasses[i].hidden)
			{
				continue;
			}
			
			total += this.items[i];
		}
		
		if (total < 0.5)
		{
			return "pure";
		}
		
		if (total < 2)
		{
			return "average";
		}
		
		if (total < 3)
		{
			return "impure";
		}
		
		return "garbage";
	}
	
	getPossiblePotionEffects()
	{
		let i, item, amount, stuffs, sum, water;
		
		stuffs = [];
		
		sum = 0;
		
		for (i in this.items)
		{
			item = itemClasses[i];
			amount = this.items[i];
			
			if (!(item instanceof Substance) || item.hidden || item.effect == "nothing" || amount == 0)
			{
				continue;
			}
			
			sum += amount;
			
			stuffs.push({ name: i, chance: amount });
		}
		
		water = 3 - Math.min(3, sum);
		
		if (water > 0)
		{
			stuffs.push({ name: "air", chance: water });
		}
		
		stuffs = arrayNormalizeChances(stuffs);
		
		return stuffs;
	}
	
	getPotionEffect()
	{
		let a;
		
		a = arrayPickChance(this.getPossiblePotionEffects());
		
		return itemClasses[a.name].effect;
	}
	
	getPotionColor()
	{
		return "#ff0000";
	}
	
	getPotionText(listContents)
	{
		let empty, s, t, i, a, percent, percentSum;
		
		empty = true;
		s = "";
		t = "";
		
		if (listContents)
		{
			s += "Contains:<br/>";
			
			for (i in this.items)
			{
				if (this.items[i] != 0 && !itemClasses[i].hidden)
				{
					empty = false;
					s += "&nbsp;- " + round(this.items[i]) + " " + itemClasses[i].unit + " of <b>" + itemClasses[i].title + "</b><br/>";
				}
			}
			
			if (empty)
			{
				s += "&nbsp;- <b>pure water</b><br/>";
			}
		}
		
		s += "Potion quality: <b>" + this.getPotionQuality() + "</b><br/>";
		
		a = this.getPossiblePotionEffects();
		
		percentSum = 0;
		
		if (a.length == 1)
		{
			s += "Potion effect: <b>" + itemClasses[a[0].name].effect + "</b><br/>";
		}
		else
		{
			s += "Possible potion effects:<br/>";
			
			for (i in a)
			{
				// make sure that percents add up to 100 in display
				// last item is always 100% minus sum of all previous
				if (i != a.length - 1)
				{
					percent = Math.floor(a[i].chance * 100);
					percentSum += percent;
				}
				else
				{
					percent = 100 - percentSum;
				}
				
				s += "&nbsp;- <b>" + itemClasses[a[i].name].effect + "</b> (" + percent + "%)<br/>";
			}
		}
		
		return s;
	}
}
