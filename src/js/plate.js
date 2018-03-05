"use strict";

class Plate
{
	constructor(params)
	{
		this.contents = [];
		this.selected = false;
	}
	
	use()
	{
		let i, j, a, count;
		
		for (i in this.contents)
		{
			count = this.contents[i];
			
			a = ingredientClasses[i];
			
			for (j in a.substances)
			{
				cauldron.substances[a.substances[j].name] += a.substances[j].amount * count;
			}
		}
		
		this.contents = [];
	}
}
