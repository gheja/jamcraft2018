var _stuffs;

class ItemGlass extends Item
{
	constructor()
	{
		super();
		
		this.store = new Store;
	}
	
	describePurity()
	{
		let i, total;
		
		total = 0;
		
		for (i in this.store.items)
		{
			if (!(itemClasses[i] instanceof Ingredient) || itemClasses[i].hidden)
			{
				continue;
			}
			
			total += this.store.items[i];
		}
		
		if (total < 0.5)
		{
			return "pure";
		}
		
		if (total < 2)
		{
			return "not bad";
		}
		
		if (total < 3)
		{
			return "impure";
		}
		
		return "garbage";
	}
	
	describeEffect()
	{
		let i, tops, max, result, stuffs, a;
		
		max = 0;
		
		for (i in this.store.items)
		{
			if (!(itemClasses[i] instanceof Substance) || itemClasses[i].hidden)
			{
				continue;
			}
			
			max = Math.max(max, this.store.items[i]);
		}
		
		if (max < 3)
		{
			return "not much";
		}
		
		stuffs = [];
		
		for (i in this.store.items)
		{
			if (!(itemClasses[i] instanceof Substance) || itemClasses[i].hidden || this.store.items[i] < 3)
			{
				continue;
			}
			
			stuffs.push({ name: i, chance: this.store.items[i] - 3 });
		}
		
		a = arrayPickChance(stuffs);
		
		return itemClasses[a.name].effect;
	}
}
