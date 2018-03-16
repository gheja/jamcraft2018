"use strict";

class Slot
{
	constructor(params)
	{
		let k;
		
		this.x = 0;
		this.y = 0;
		this.width = 32;
		this.height = 32;
		this.className = "";
		this.dragGroup = 0;
		
		this.parent = null;
		this.content = null;
		this.contentClassName = "";
		this.onChange = null;
		this.slotTooltip = "Empty slot";
		this.contentTooltip = "Item";
		
		this.dom = {
			slot: null,
			content: null
		};
		
		this.dragging = false;
		this.locked = false;
		this.cauldronTarget = false;
		
		for (k in params)
		{
			if (this.hasOwnProperty(k))
			{
				this[k] = params[k];
			}
		}
		
		this.setup();
	}
	
	getSlotBelow()
	{
		let i, pos1, pos2, x, y;
		
		pos1 = this.dom.content.getBoundingClientRect();
		x = (pos1.x + pos1.width / 2);
		y = (pos1.y + pos1.height / 2);
		
		for (i in slots)
		{
			if (slots[i].dragGroup == this.dragGroup)
			{
				// skip slots that are already occupied
				if (slots[i].content != null)
				{
					continue;
				}
				
				pos2 = slots[i].dom.slot.getBoundingClientRect();
				
				if (x > pos2.x && x < pos2.x + pos2.width && y > pos2.y && y < pos2.y + pos2.width)
				{
					return slots[i];
				}
			}
		}
		
		return null;
	}
	
	moveToSlot(slot)
	{
		slot.content = this.content;
		slot.contentClassName = this.contentClassName;
		slot.contentTooltip = this.contentTooltip;
		slot.update();
		
		if (slot.onChange)
		{
			slot.onChange.call();
		}
		
		this.content = null;
		this.contentClassName = "";
		this.contentTooltip = "Item";
		this.update();
		
		if (this.onChange)
		{
			this.onChange.call();
		}
	}
	
	snapPositionToSlot()
	{
		this.dom.content.style.left = this.dom.slot.style.left;
		this.dom.content.style.top = this.dom.slot.style.top;
		this.update();
	}
	
	highlightAllSlotsInDragGroup()
	{
		let i;
		
		for (i in slots)
		{
			if (slots[i].dragGroup == this.dragGroup)
			{
				slots[i].dom.slot.classList.add("slot_highlighted");
			}
		}
	}
	
	unhighlightAllSlots()
	{
		let i;
		
		for (i in slots)
		{
			slots[i].dom.slot.classList.remove("slot_highlighted");
		}
	}
	
	onMouseDown(e)
	{
		if (this.locked)
		{
			return;
		}
		
		this.dragging = true;
		this.highlightAllSlotsInDragGroup();
		this.onMouseMove(e);
		this.dom.content.style.zIndex = 5200;
		
		// move it to body temporarily - otherwise "overflow: hidden" would cut it
		setDomParent(this.dom.content, document.body);
		
		if (e.stopPropagation)
		{
			e.stopPropagation();
		}
		
		if (e.preventDefault)
		{
			e.preventDefault();
		}
		
		e.cancelBubble=true;
		
		return false;
	}
	
	onMouseUp(e)
	{
		let obj;
		
		if (this.locked)
		{
			return;
		}
		
		this.dragging = false;
		this.unhighlightAllSlots();
		this.dom.content.style.zIndex = "";
		
		obj = this.getSlotBelow();
		
		if (obj != null)
		{
			this.moveToSlot(obj);
			obj.snapPositionToSlot();
		}
		else
		{
			this.snapPositionToSlot();
		}
		
		if (e.stopPropagation)
		{
			e.stopPropagation();
		}
		
		if (e.preventDefault)
		{
			e.preventDefault();
		}
		
		e.cancelBubble=true;
		
		return false;
	}
	
	onMouseMove(e)
	{
		let pos, obj;
		
		if (!this.dragging)
		{
			return;
		}
		
		// object is now relative to body
		
		// TODO: dynamic width
		this.dom.content.style.left = (e.pageX - 16) + "px";
		this.dom.content.style.top = (e.pageY - 16) + "px";
	}
	
	setup()
	{
		let a, obj;
		
		obj = get("container");
		
		a = createDomElement("div", this.className);
		a.style.left = this.x + "px";
		a.style.top = this.y + "px";
		a.style.width = this.width + "px";
		a.style.height = this.height + "px";
		a.dataset.tooltip = this.slotTooltip;
		this.dom.slot = a;
		this.parent.appendChild(a);
		
		a = createDomElement("div", this.contentClassName);
		a.style.left = this.x + "px";
		a.style.top = this.y + "px";
		a.style.width = this.width + "px";
		a.style.height = this.height + "px";
		a.dataset.tooltip = this.contentTooltip;
		a.addEventListener("mousedown", this.onMouseDown.bind(this));
		a.addEventListener("mouseup", this.onMouseUp.bind(this));
		this.dom.content = a;
		this.parent.appendChild(a);
		
		document.body.addEventListener("mousemove", this.onMouseMove.bind(this));
	}
	
	update()
	{
		this.dom.content.className = this.contentClassName;
		
		if (this.dom.content.parentNode != this.parent)
		{
			setDomParent(this.dom.content, this.parent);
		}
		
		this.dom.slot.dataset.tooltip = this.slotTooltip;
		
		if (this.content == null)
		{
			this.dom.content.style.display = "none";
		}
		else
		{
			this.dom.content.style.display = "block";
			this.dom.content.dataset.tooltip = this.contentTooltip;
		}
	}
}
