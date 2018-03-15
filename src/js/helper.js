"use strict";

const HELPER_DIRECTION_TOP = 0;
const HELPER_DIRECTION_RIGHT = 1;
const HELPER_DIRECTION_BOTTOM = 2;
const HELPER_DIRECTION_LEFT = 3;

class Helper
{
	constructor()
	{
	}
	
	destroy(obj)
	{
		// when event fired more than once...
		if (!obj || !obj.parentNode)
		{
			return;
		}
		
		obj.parentNode.removeChild(obj);
	}
	
	hide(event)
	{
		let obj;
		
		obj = event.target;
		
		while (obj.parentNode != document.body)
		{
			if (obj.parentNode == null)
			{
				console.log("Could not find parent");
				return;
			}
			
			obj = obj.parentNode;
		}
		
		obj.className = "helper";
		
		// destroy the element
		window.setTimeout(this.destroy.bind(this, obj), 1000);
	}
	
	activate(obj)
	{
		obj.className = "helper helper_active";
	}
	
	showAtPosition(s, x, y, direction)
	{
		let obj;
		
		obj = document.createElement("div");
		
		obj.className = "helper";
		obj.style.top = Math.round(y - 80) + "px";
		obj.style.left = Math.round(x) + "px";
		obj.innerHTML = s + "<span class=\"dim\"> | Click to close.</span>";
		
		obj.addEventListener("click", this.hide.bind(this));
		
		window.setTimeout(this.activate.bind(this, obj), 100);
		
		document.body.appendChild(obj);
	}
	
	showAtObject(s, obj, direction)
	{
		let position;
		
		position = obj.getBoundingClientRect();
		
		this.showAtPosition(s, position.x + position.width / 2, position.y, direction);
	}
}
