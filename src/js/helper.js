"use strict";

const HELPER_DIRECTION_TOP = 0;
const HELPER_DIRECTION_RIGHT = 1;
const HELPER_DIRECTION_BOTTOM = 2;
const HELPER_DIRECTION_LEFT = 3;

let activeHelpers = [
];

class Helper
{
	constructor()
	{
		this.helpersShown = [];
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
		let obj, i;
		
		obj = event.target;
		
		// the clicked object can be a child of the actual helper
		// walk through all of the parents and delete the root
		while (obj.parentNode != document.body)
		{
			for (i in activeHelpers)
			{
				if (activeHelpers[i].dom.root == obj)
				{
					arrayRemove(activeHelpers, i);
					break;
				}
			}
			
			if (obj.parentNode == null)
			{
				console.log("Could not find parent");
				return;
			}
			
			obj = obj.parentNode;
		}
		
		obj.className = "helper";
		
		// destroy the element
		window.setTimeout(this.destroy.bind(this, obj), 310);
	}
	
	hideByName(name)
	{
		let i;
		
		// emulate a click on the helper
		for (i in activeHelpers)
		{
			if (activeHelpers[i].name == name)
			{
				activeHelpers[i].dom.root.click();
			}
		}
	}
	
	activate(obj)
	{
		obj.className = "helper helper_active";
	}
	
	showAtPosition(s, x, y, direction, name)
	{
		let obj;
		
		this.helpersShown.push(name);
		
		obj = document.createElement("div");
		
		obj.className = "helper";
		obj.style.top = Math.round(y - 80) + "px";
		obj.style.left = Math.round(x) + "px";
		obj.innerHTML = s + "<span class=\"dim\"> Click to close.</span>";
		
		obj.addEventListener("click", this.hide.bind(this));
		
		window.setTimeout(this.activate.bind(this, obj), 100);
		
		activeHelpers.push({
			name: name,
			dom: {
				root: obj
			}
		});
		
		document.body.appendChild(obj);
	}
	
	showAtObject(s, obj, direction, name)
	{
		let position;
		
		position = positionFix(obj.getBoundingClientRect());
		
		this.showAtPosition(s, position.x + position.width / 2, position.y, direction, name);
	}
}
