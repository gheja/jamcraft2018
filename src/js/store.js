"use strict";

class Store
{
	constructor()
	{
		let i;
		
		this.items = [];
		this.objects = [];
		
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
	
	getPotionEffect()
	{
		let i, tops, max, result, stuffs, a;
		
		max = 0;
		
		for (i in this.items)
		{
			if (!(itemClasses[i] instanceof Substance) || itemClasses[i].hidden)
			{
				continue;
			}
			
			max = Math.max(max, this.items[i]);
		}
		
		if (max < 3)
		{
			return "nothing";
		}
		
		stuffs = [];
		
		for (i in this.items)
		{
			if (!(itemClasses[i] instanceof Substance) || itemClasses[i].hidden || this.items[i] < 3)
			{
				continue;
			}
			
			stuffs.push({ name: i, chance: this.items[i] });
		}
		
		a = arrayPickChance(stuffs);
		
		return itemClasses[a.name].effect;
	}
	
	getPotionColor()
	{
		return "#ff0000";
	}
	
	getPotionText()
	{
		let empty, s, i;
		
		empty = true;
		s = "";
		
		for (i in this.items)
		{
			if (this.items[i] != 0)
			{
				empty = false;
				s += "&nbsp;- " + round(this.items[i]) + " " + itemClasses[i].unit + " of <b>" + itemClasses[i].title + "</b><br/>";
			}
		}
		
		if (empty)
		{
			s = "Pure water.";
		}
		else
		{
			s = "The potion contains<br/>" + s;
			s += "<br/>Quality: " + this.getPotionQuality();
		}
		
		return s;
	}
}
