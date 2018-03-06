"use strict";

class Store
{
	constructor()
	{
		let i;
		
		this.items = [];
		
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
	
	clear()
	{
		let i;
		
		for (i in this.items)
		{
			this.destroyItem(i, 9999);
		}
	}
}
