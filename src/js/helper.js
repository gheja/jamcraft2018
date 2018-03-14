"use strict";

const HELPER_DIRECTION_TOP = 0;
const HELPER_DIRECTION_RIGHT = 1;
const HELPER_DIRECTION_BOTTOM = 2;
const HELPER_DIRECTION_LEFT = 3;

class Helper
{
	constructor()
	{
		this.message = "";
		this.direction = HELPER_DIRECTION_TOP;
	}
	
	showAtPosition(s, x, y, direction)
	{
		this.direction = direction
		this.message = s;
		
		console.log(this.message);
	}
	
	showAtObject(s, obj, direction)
	{
		this.showAtPosition(s, 100, 100, direction);
	}
}