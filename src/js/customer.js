"use strict";

let _missedCustomers = 0;
let _failedOrders = 0;

const CUSTOMER_STATE_AWAY = 0;
const CUSTOMER_STATE_RINGING = 1;
const CUSTOMER_STATE_SWEARING = 2;
const CUSTOMER_STATE_ASKING = 3;
const CUSTOMER_STATE_GOING1 = 4;
const CUSTOMER_STATE_WAITING1 = 5;
const CUSTOMER_STATE_BACK = 6;
const CUSTOMER_STATE_GOING2 = 7;
const CUSTOMER_STATE_WAITING2 = 8;
const CUSTOMER_STATE_STOPPED = 9;
const CUSTOMER_STATE_RESET = 10;

const CUSTOMER_ORDER_UNSEEN = 0;
const CUSTOMER_ORDER_ACCEPTED = 1;
const CUSTOMER_ORDER_DECLINED = 2;
const CUSTOMER_ORDER_FULFILLED = 3;

class Customer
{
	constructor(n)
	{
		this.name = names.pop();
		this.mood = 0.5; // 0..1, grumpy..happy
		this.confidence = 0.5;
		
		this.state = CUSTOMER_STATE_AWAY;
		this.ringAnswered = false;
		this.orderStatus = CUSTOMER_ORDER_UNSEEN;
		this.dismissed = false;
		this.gaveFeedback = false;
		
		this.waitTime = 0;
		this.waitTimeTotal = 0;
		this.potion = null;
		this.profilePictureNumber = Math.floor(Math.random() * 3);
		
		this.color = "hsl(" + (15 + Math.floor(n / 2) * (360 / CUSTOMER_COUNT_MAX * 2)) + ", 90%, " + (n % 2 == 0 ? "30" : "50") + "%)";
		
		this.dom = {
			root: null,
			name: null,
			text: null,
			image: null,
			progress: null,
			button_answer: null,
			button_accept: null,
			button_decline: null,
			button_give: null,
			button_dismiss: null
		};
		
		this.slot = null;
		
		this.need = {
			effect: null,
			price: null,
			subject: null,
			effectTexts: null,
			pronouns: null,
			image_grey: null,
			text: null
		};
		
		// TODO: I/me/myself - would be fun!
		
		this.subjectVariations = [
			{ subject1: "a girl", subject2: "the girl", she: "she", her: "her" },
			{ subject1: "a guy", subject2: "the guy", she: "he", her: "him" },
			{ subject1: "my dog", subject2: "my dog", she: "he", her: "him" },
			{ subject1: "my dog", subject2: "my dog", she: "she", her: "her" },
			{ subject1: "my wife", subject2: "my wife", she: "she", her: "her" },
			{ subject1: "my husband", subject2: "my husband", she: "he", her: "him" },
		];
		
		this.texts = {
			"need": [
				"I want a potion to",
				"I would like to"
			],
			
			"thanks": [
				"Thanks!"
			],
			
			"suddenly": [
				"suddenly",
				"out of the blue",
				"unexpectedly"
			],
			
			"rating_needed": [
				"I wanted a potion to",
				"Asked for a potion to",
				"Asked the witch for a potion to",
				"Ordered a potion to"
			],
			"rating_success": [
				"it worked like a charm",
				"I got exactly what I wanted"
			],
			"rating_fail": [
				"but",
				"however"
			],
			"rating_thanks": [
				"Thank you so much",
				"Best witch around",
				"I can only recommend",
			],
			"rating_never_again": [
				"What the hell",
				"Never again",
				"I'd give zero stars"
			],
			
			"effect_health": [
				[ "have <subject1> feel better", "<subject2> feels much better", "<suddenly> <subject2> became healthier" ]
			],
			"effect_rest": [
				[ "have <subject1> feel rested", "<subject2> feels much better", "<suddenly> <subject2> feels rested" ],
				[ "have <subject1> feel relaxed", "<subject2> is so relaxed", "<subject2> now feels relaxed" ],
			],
			"effect_love": [
				[ "have <subject1> fall in love with me", "now <she> loves me so much", "<suddenly> <subject2> fell in love with me" ],
				[ "be loved by <subject1>", "finally <she> loves me back", "<subject2> is now in love with me" ],
			],
			"effect_explode": [
				[ "destroy <subject1>", "BOOM", "<subject2> blew up" ],
				[ "destroy <subject1>", "nothing left of <her>", "<suddenly> <subject2> exploded" ],
				[ "obliterate <subject1>", "only a crater left", "now <subject2> is no more" ],
				[ "demolish <subject1>", "<she> blew up", "<suddenly> <subject2> blew up" ]
			],
			"effect_nothing": [
				[ "", "", "nothing happened" ],
				[ "", "", "no change whatsoever" ],
				[ "", "", "the potion did nothing" ]
			],
			
			"failed_to_deliver_1": [
				"Asked for a potion and got nothing.",
				"The witch failed to deliver."
			],
			"failed_to_deliver_2": [
				"Total waste of money.",
				"Will never order again.",
				"I'm very disappointed.",
				"Scam."
			],
			
			"failed_to_answer": [
				"Knocked on the door for 10 minutes, no answer.",
				"Tried several times to reach the witch, no success."
			]
		};
	}
	
	createDom()
	{
		let a, b, c;
		
		a = document.createElement("div");
		a.className = "customer";
		a.display = "block";
		
		b = document.createElement("div");
		b.className = "customer_picture_background";
		this.dom.image = b;
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_picture_grey";
		this.dom.image_grey = b;
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_picture customer_picture_" + this.profilePictureNumber;
		b.dataset.tooltip = "Customer";
		this.dom.image_front = b;
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_progressbar_background";
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_progressbar";
		this.dom.progressbar = b;
		a.appendChild(b);
		
		
		c = document.createElement("div");
		c.className = "customer_content";
		
		b = document.createElement("div");
		b.className = "customer_name";
		b.innerHTML = this.name;
		c.appendChild(b);
		this.dom.name = b;
		
		b = document.createElement("div");
		b.className = "customer_text";
		b.innerHTML = "Text";
		c.appendChild(b);
		this.dom.text = b;
		
		b = document.createElement("button");
		b.innerHTML = "answer";
		b.className = "button_answer";
		b.dataset.tooltip = "Let the customer in and listen.";
		b.onclick = this.answerRing.bind(this);
		this.dom.button_answer = b;
		c.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "accept";
		b.className = "button_accept";
		b.dataset.tooltip = "Accept this order, the customer will return later for the completed order.";
		b.onclick = this.acceptOrder.bind(this);
		this.dom.button_accept = b;
		c.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "decline";
		b.className = "button_decline";
		b.dataset.tooltip = "Decline this order.";
		b.onclick = this.declineOrder.bind(this);
		this.dom.button_decline = b;
		c.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "give";
		b.className = "button_give";
		b.dataset.tooltip = "Give the potion to the customer.";
		b.onclick = this.givePotion.bind(this);
		this.dom.button_give = b;
		c.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "dismiss";
		b.className = "button_dismiss";
		b.dataset.tooltip = "Hide this visit.<br/><br/>The customer might come back later with a new order.";
		b.onclick = this.dismiss.bind(this);
		this.dom.button_dismiss = b;
		c.appendChild(b);
		
		b = document.createElement("br");
		b.className = "clearer";
		c.appendChild(b);
		
		a.appendChild(c);
		
		this.dom.root = a;
		
		this.slot = new Slot({
			x: 430,
			y: 4,
			className: "slot",
			dragGroup: 2,
			parent: this.dom.root,
			onChange: this.updateButtons.bind(this)
		});
		
		slots.push(this.slot);
		
		this.slot.slotTooltip = "Drag the potion you want to give to this customer into this slot.<br/><br/>After dragging it here click <b>Give</b> when the customer is around.";
		this.slot.hidden = true;
		this.slot.update();
		
		get("box_customers").appendChild(this.dom.root);
		
		registerAllTooltips();
	}
	
	activatePicture()
	{
		if (!this.dom.root)
		{
			return;
		}
		
		this.dom.image_grey.style.animationName = "hide";
		this.dom.image_grey.style.background = "rgba(32,32,32,0)";
	}
	
	deactivatePicture()
	{
		if (!this.dom.root)
		{
			return;
		}
		
		this.dom.image_grey.style.animationName = "show";
		this.dom.image_grey.style.background = "rgba(32,32,32,1)";
	}
	
	hideDom()
	{
		this.dom.root.style.animationName = "slideout";
		this.dom.root.addEventListener("webkitAnimationEnd", this.destroyDom.bind(this), false);
	}
	
	destroyDom()
	{
		get("box_customers").removeChild(this.dom.root);
		this.dom.root = null;
		arrayRemove(slots, this.slot);
		this.slot = null;
	}
	
	setText(s)
	{
		if (this.dom.text)
		{
			this.dom.text.innerHTML = s + "&nbsp;";
		}
	}
	
	replacePlaceholders(text)
	{
		let i;
		
		for (i in this.need.pronouns)
		{
			text = text.replace("<" + i + ">", this.need.pronouns[i]);
		}
		
		return text;
	}
	
	setupNeed()
	{
		let unlockedEffects, i, item, a;
		
		unlockedEffects = [];
		
		for (i in itemClasses)
		{
			item = itemClasses[i];
			
			if (item instanceof Substance)
			{
				if (item.unlocked && item.effect != "nothing")
				{
					unlockedEffects.push({ "effect": item.effect, "potionPrice" : item.potionPrice });
				}
			}
		}
		
		if (unlockedEffects.length == 0)
		{
			console.log("No substances unlocked.");
			return;
		}
		
		a = arrayPick(unlockedEffects);
		
		this.need.effect = a.effect;
		this.need.price = Math.round(a.potionPrice * (1 + Math.random() * 0.2 - 0.1)); // +/- 20% random
		this.need.effectTexts = arrayGetPick(this.texts, "effect_" + this.need.effect);
		this.need.subject = arrayPick(this.subjectVariations);
		
		this.need.pronouns = {
			"she": this.need.subject.she,
			"her": this.need.subject.her,
			"subject1": this.need.subject.subject1,
			"subject2": (chance(0.5) ? this.need.subject.subject2 : this.need.subject.she),
			"suddenly": arrayGetPick(this.texts, "suddenly")
		};
		
		this.need.text = this.replacePlaceholders(arrayGetPick(this.texts, "need") + " " + this.need.effectTexts[0] + ".");
	}
	
	describeNeed()
	{
		return this.need.text;
	}
	
	reactToPotion(quality, effect)
	{
		let feedback, r, r2, a, rating;
		
		feedback = arrayGetPick(this.texts, "rating_needed") + " " + this.need.effectTexts[0] + " ";
		
		rating = 3 + (this.mood - 0.5) * 2;
		
		// success
		if (this.need.effect == effect)
		{
			feedback += "and ";
			
			if (chance(0.5))
			{
				feedback += arrayGetPick(this.texts, "rating_success");
				
				if (chance(0.5))
				{
					feedback += ", " + this.need.effectTexts[1];
				}
				
				feedback += arrayPick([ ".", "!" ]);
			}
			else
			{
				feedback += this.need.effectTexts[1];
				
				if (chance(0.5))
				{
					feedback += ", " + arrayGetPick(this.texts, "rating_success");
				}
				
				feedback += arrayPick([ ".", "!" ]);
			}
			
			if (chance(0.5))
			{
				feedback += " " + arrayGetPick(this.texts, "rating_thanks") + arrayPick([ ".", "!" ]);
				rating += 1;
			}
			
			rating += (1 + Math.random() * 1);
		}
		// failure
		else
		{
			a = arrayGetPick(this.texts, "effect_" + effect);
			
			rating -= (1 + Math.random() * 1);
			
			feedback += " " + arrayGetPick(this.texts, "rating_fail") + " " + a[2];
			
			if (chance(0.5))
			{
				feedback += ".";
			}
			else
			{
				feedback += ". " + arrayGetPick(this.texts, "rating_never_again") + ".";
			}
		}
		
		// TODO: "3 out of 5 stars.", "3 stars.", "3/5"
		
		return {
			rating: clamp(Math.round(rating), 1, 5),
			text: this.replacePlaceholders(feedback)
		};
	}
	
	setWaitTime(min, max)
	{
		this.waitTime = Math.floor(min + Math.random() * (max - min)) / GAME_SPEED;
		this.waitTimeTotal = this.waitTime;
	}
	
	setupNextVisit()
	{
	}
	
	answerRing()
	{
		helper.hideByName("customer_answer");
		_missedCustomers = 0;
		this.ringAnswered = true;
		this.setWaitTime(0, 0);
		this.tick();
	}
	
	acceptOrder()
	{
		helper.hideByName("customer_order");
		if (once("helper:tiredness"))
		{
			helper.showAtObject("Start cooking your potion by clicking <b>prepare</b>.", get("button_cauldron_prepare"), null, "cauldron_prepare");
		}
		
		logMessage("Accepted: <b>" + (this.need.effect) + "</b> for <b>" + this.name +"</b>.", MESSAGE_NORMAL);
		this.orderAccepted = true;
		this.setWaitTime(0, 0);
		this.tick();
	}
	
	declineOrder()
	{
		helper.hideByName("customer_order");
		this.orderAccepted = false;
		this.setWaitTime(0, 0);
		this.tick();
	}
	
	givePotion()
	{
		helper.hideByName("customer_order");
		this.orderAccepted = true;
		this.potion = this.slot.content;
		this.slot.locked = true;
		this.updateButtons();
		this.setWaitTime(0, 0);
		this.tick();
		
		bumpSellCount();
		
		gold += this.need.price;
		
		logMessage("Gave potion to <b>" + this.name +"</b>, received <b>" + this.need.price + " gold</b>.", MESSAGE_NORMAL);
	}
	
	dismiss()
	{
		// if slot is not empty but the potion was not given to the customer
		if (this.slot.content != null && this.potion == null)
		{
			logMessage("Remove potion from the slot before dismissing.", MESSAGE_WARNING);
			return;
		}
		
		this.hideDom();
		this.dismissed = true;
		
		this.deactivatePicture();
		
		if (this.state == CUSTOMER_STATE_STOPPED)
		{
			this.state = CUSTOMER_STATE_RESET;
			this.setWaitTime(30, 30);
		}
	}
	
	giveFeedback()
	{
		let s
		
		s = this.reactToPotion(this.potion.quality, this.potion.effect);
		
		this.mood += (s.rating - 3) / 10;
		
		profile.receiveFeedback(s.rating, s.text, this);
		
		this.gaveFeedback = true;
	}
	
	helperFirstAnswer()
	{
		helper.showAtObject("A customer is knocking on your door. Use this button to answer.", this.dom.button_answer, null, "customer_answer");
	}
	
	helperFirstAccept()
	{
		helper.showAtObject("After listening to the customer, decide if you want to take this order", this.dom.button_accept, null, "customer_order");
	}
	
	updateButtons()
	{
		// when the customer is away there is no DOM
		if (this.state == CUSTOMER_STATE_AWAY)
		{
			return;
		}
		
		this.dom.button_answer.disabled = (this.state != CUSTOMER_STATE_RINGING);
		this.dom.button_accept.disabled = (this.state != CUSTOMER_STATE_ASKING);
		this.dom.button_decline.disabled = (this.state != CUSTOMER_STATE_ASKING);
		this.dom.button_give.disabled = (
			this.potion != null ||
			this.slot == null ||
			this.slot.content == null ||
			(this.state != CUSTOMER_STATE_ASKING && this.state != CUSTOMER_STATE_BACK)
		);
		this.dom.button_dismiss.disabled = (
			this.state != CUSTOMER_STATE_STOPPED &&
			this.state != CUSTOMER_STATE_RESET &&
			this.state != CUSTOMER_STATE_WAITING2
		);
	}
	
	bumpMissedCustomers()
	{
		let s;
		
		s = {
			text: "",
			rating: 0
		};
		
		_missedCustomers++;
		
		if (_missedCustomers > 3)
		{
			// 33% chance of leaving a negative feedback
			if (Math.random() > 0.3)
			{
				s.text = arrayGetPick(this.texts, "failed_to_answer");
				s.rating = Math.floor(1 + Math.round(Math.random() * 1));
				
				profile.receiveFeedback(s.rating, s.text, this);
			}
			
		}
		
	}
	
	bumpFailedOrders()
	{
		let s;
		
		_failedOrders++;
		
		s = {
			text: "",
			rating: 0
		};
		
		s.text = arrayGetPick(this.texts, "failed_to_deliver_1");
		
		if (chance(0.5))
		{
			s.text += " " + arrayGetPick(this.texts, "failed_to_deliver_2");
		}
		
		s.rating = 1;
		
		profile.receiveFeedback(s.rating, s.text, this);
	}
	
	setState(state, params)
	{
		switch (state)
		{
			case CUSTOMER_STATE_AWAY:
				this.ringAnswered = false;
				this.orderStatus = CUSTOMER_ORDER_UNSEEN;
				this.dismissed = false;
				this.potion = null;
				this.gaveFeedback = false;
				this.deactivatePicture();
				this.setText("");
				
				if (params && params.first)
				{
					this.setWaitTime(5, 50);
				}
				else
				{
					this.setWaitTime(150, 500);
				}
			break;
			
			case CUSTOMER_STATE_RINGING:
				this.setupNeed();
				this.createDom();
				this.setText("*knock* *knock*");
				this.dom.image.style.background = this.color;
				this.dom.image_front.dataset.tooltip = "Customer is knocking on your door.";
				this.activatePicture();
				
				if (once("helper:customer_answer"))
				{
					window.setTimeout(this.helperFirstAnswer.bind(this), 700);
				}
				
				this.setWaitTime(30, 30);
			break;
			
			case CUSTOMER_STATE_SWEARING:
				if (params)
				{
					switch (params.reason)
					{
						case 1:
							logMessage("A customer just got tired of knocking.", MESSAGE_WARNING);
							this.mood -= 0.05;
							this.bumpMissedCustomers();
						break;
						
						case 2:
							logMessage("A customer just got dissapointed.", MESSAGE_WARNING);
							this.mood -= 0.2;
							this.bumpFailedOrders();
						break;
					}
				}
				
				this.dom.image_front.dataset.tooltip = "Customer is disappointed.";
				this.setText("*$!#@!$");
				this.setWaitTime(5, 5);
			break;
			
			case CUSTOMER_STATE_ASKING:
				this.setText(this.describeNeed());
				this.dom.image_front.dataset.tooltip = "Customer is talking with you.";
				this.dom.name.innerHTML += " (" + this.need.effect + ", " + this.need.price + " gold)";
				
				this.slot.hidden = false;
				this.slot.update();
				
				if (once("helper:customer_order"))
				{
					window.setTimeout(this.helperFirstAccept.bind(this), 1000);
				}
				
				this.setWaitTime(300, 300);
			break;
			
			case CUSTOMER_STATE_GOING1:
				this.setText("Thanks, I'll be back.");
				this.setWaitTime(10, 10);
			break;
			
			case CUSTOMER_STATE_WAITING1:
				this.setText("*away*");
				this.dom.image_front.dataset.tooltip = "Customer is away, will return for the completed order.";
				this.deactivatePicture();
				this.setWaitTime(100, 100);
			break;
			
			case CUSTOMER_STATE_BACK:
				this.setText("Hi, is the potion ready?");
				this.dom.image_front.dataset.tooltip = "Customer is waiting for the completed order. Put it in the slot on the right.";
				this.activatePicture();
				this.setWaitTime(100, 100);
			break;
			
			case CUSTOMER_STATE_GOING2:
				this.setText("Thanks!");
				this.dom.image_front.dataset.tooltip = "Customer is talking with you.";
				this.mood += 0.1;
				this.setWaitTime(10, 10);
			break;
			
			case CUSTOMER_STATE_WAITING2:
				this.deactivatePicture();
				this.setText("*away, will give feedback*");
				this.dom.image_front.dataset.tooltip = "Customer went away. Should try your potion and leave a feedback soon.";
				this.setWaitTime(30, 100);
				
				this.slot.hidden = true;
				this.slot.update();
			break;
			
			case CUSTOMER_STATE_STOPPED:
				if (params)
				{
					switch (params.reason)
					{
						case 1:
							this.setText("OK, no problem, bye.");
						break;
						
						case 2:
							this.setText("*done*");
							this.dom.image_front.dataset.tooltip = "Customer left.";
							if (!this.gaveFeedback)
							{
								this.giveFeedback();
							}
						break;
					}
				}
				this.dom.image_front.dataset.tooltip = "Customer left.";
				this.deactivatePicture();
				
				// after destroyDom() slot does not exist anymore
				if (this.slot)
				{
					// if the slot has content and was given to the customer
					if (this.slot.content == null && this.potion != null)
					{
						this.slot.hidden = true;
						this.slot.update();
					}
				}
				
				this.setWaitTime(10, 10);
			break;
			
			case CUSTOMER_STATE_RESET:
			break;
		}
		
		this.state = state;
	}
	
	tick()
	{
		let a, i, activeCount;
		
		this.waitTime--;
		
		if (this.waitTimeTotal > 0 && (this.state == CUSTOMER_STATE_RINGING || this.state == CUSTOMER_STATE_ASKING || this.state == CUSTOMER_STATE_WAITING1 || this.state == CUSTOMER_STATE_BACK))
		{
			a = Math.floor((this.waitTime / this.waitTimeTotal) * 64);
		}
		else
		{
			a = 0;
		}
		
		if (this.dom.progressbar)
		{
			this.dom.progressbar.style.width = a + "px";
		}
		
		if (this.waitTime <= 0)
		{
			switch (this.state)
			{
				case CUSTOMER_STATE_AWAY:
					activeCount = 0;
					
					for (i in customers)
					{
						if (customers[i].state != CUSTOMER_STATE_AWAY)
						{
							activeCount++;
						}
					}
					
					// too many active customers at once
					if (activeCount >= profile.maxActiveCustomers)
					{
						// get back later
						this.setState(CUSTOMER_STATE_AWAY);
					}
					else
					{
						if (dndActive)
						{
							logMessage("A customer was at the door, saw the Do Not Disturb sign.", MESSAGE_NORMAL);
							this.setState(CUSTOMER_STATE_AWAY);
						}
						else
						{
							this.setState(CUSTOMER_STATE_RINGING);
						}
					}
				break;
				
				case CUSTOMER_STATE_RINGING:
					if (this.ringAnswered)
					{
						this.setState(CUSTOMER_STATE_ASKING);
					}
					else
					{
						this.setState(CUSTOMER_STATE_SWEARING, { reason: 1 });
					}
				break;
				
				case CUSTOMER_STATE_SWEARING:
					this.setState(CUSTOMER_STATE_STOPPED);
				break;
				
				case CUSTOMER_STATE_ASKING:
					if (this.orderAccepted)
					{
						if (this.potion != null)
						{
							this.setState(CUSTOMER_STATE_GOING2);
						}
						else
						{
							this.setState(CUSTOMER_STATE_GOING1);
						}
					}
					else
					{
						this.setState(CUSTOMER_STATE_STOPPED, { reason: 1 });
					}
				break;
				
				case CUSTOMER_STATE_GOING1:
					this.setState(CUSTOMER_STATE_WAITING1);
				break;
				
				case CUSTOMER_STATE_WAITING1:
					if (dndActive)
					{
						logMessage("<b>" + this.name + "</b> was at the door, saw the Do Not Disturb sign.", MESSAGE_NORMAL);
						this.setWaitTime(100, 100);
					}
					else
					{
						this.setState(CUSTOMER_STATE_BACK);
					}
				break;
				
				case CUSTOMER_STATE_BACK:
					// TODO: check if got potion or just stood there a few days
					if (this.potion)
					{
						this.setState(CUSTOMER_STATE_GOING2);
					}
					else
					{
						this.setState(CUSTOMER_STATE_SWEARING, { reason: 2 });
					}
				break;
				
				case CUSTOMER_STATE_GOING2:
					this.setState(CUSTOMER_STATE_WAITING2);
				break;
				
				case CUSTOMER_STATE_WAITING2:
					this.setState(CUSTOMER_STATE_STOPPED, { reason: 2 });
				break;
				
				case CUSTOMER_STATE_STOPPED:
					if (this.dismissed)
					{
						this.setState(CUSTOMER_STATE_RESET);
					}
				break;
				
				case CUSTOMER_STATE_RESET:
					this.setState(CUSTOMER_STATE_AWAY);
				break;
			}
			
			this.updateButtons();
		}
	}
}
