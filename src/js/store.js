"use strict";

class Store
{
	constructor()
	{
		let i;
		
		this.ingredients = [];
		this.substances = [];
		
		for (i in substanceClasses)
		{
			this.substances[i] = 0;
		}
		
		for (i in ingredientClasses)
		{
			this.ingredients[i] = 0;
		}
	}
	
	createIngredient(a, count)
	{
		this.ingredients[a] += count;
	}
	
	moveIngredient(target, a, count)
	{
		count = Math.min(count, this.ingredients[a]);
		
		this.ingredients[a] -= count;
		target.ingredients[a] += count;
	}
	
	destroyIngredient(a, count)
	{
		count = Math.min(count, this.ingredients[a]);
		
		this.ingredients[a] -= count;
	}
	
	clear()
	{
		let i;
		
		for (i in this.ingredients)
		{
			this.destroyIngredient(i, 9999);
		}
	}
}
