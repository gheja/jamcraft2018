"use strict";

const CUSTOMER_STATUS_AWAY = 0;
const CUSTOMER_STATUS_RINGING = 1;
const CUSTOMER_STATUS_SWEARING = 2;
const CUSTOMER_STATUS_ASKING = 3;
const CUSTOMER_STATUS_GOING = 4;
const CUSTOMER_STATUS_WAITING = 5;
const CUSTOMER_STATUS_BACK = 6;
const CUSTOMER_STATUS_GOING2 = 7;
const CUSTOMER_STATUS_USING = 8;
const CUSTOMER_STATUS_RESET = 9;
const CUSTOMER_STATUS_STOPPED = 10;

class Customer
{
	constructor(n)
	{
		this.name = "Customer";
		this.mood = 0.5; // 0..1, grumpy..happy
		this.confidence = 0.5;
		this.status = CUSTOMER_STATUS_AWAY;
		this.waitTime = 0;
		this.ringAnswered = false;
		this.orderAccepted = false;
		this.potion = null;
		
		this.color = "hsl(" + (Math.floor(n / 2) * (360 / CUSTOMER_COUNT_MAX * 2)) + ", 90%, " + (n % 2 == 0 ? "30" : "50") + "%)";
		
		this.dom = {
			root: null,
			name: null,
			text: null,
			image: null,
			progress: null
		};
		
		this.need = {
			effect: null,
			subject: null,
			effectTexts: null,
			pronouns: null,
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
				[ "have <subject1> feel better", "<subject2> feels much better", "<suddenly> <subject2> became energetic" ],
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
		
		c = document.createElement("div");
		c.className = "customer_picture";
		
		b.appendChild(c);
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_name";
		b.innerHTML = "Customer Name";
		a.appendChild(b);
		this.dom.name = b;
		
		b = document.createElement("div");
		b.className = "customer_text";
		b.innerHTML = "Text";
		a.appendChild(b);
		this.dom.text = b;
		
		b = document.createElement("button");
		b.innerHTML = "answer";
		b.onclick = this.answerRing.bind(this);
		a.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "accept";
		b.onclick = this.acceptOrder.bind(this);
		a.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "decline";
		b.onclick = this.declineOrder.bind(this);
		a.appendChild(b);
		
		b = document.createElement("button");
		b.innerHTML = "dismiss";
		b.onclick = this.dismiss.bind(this);
		a.appendChild(b);
		
		b = document.createElement("br");
		b.className = "clearer";
		a.appendChild(b);
		
		this.dom.root = a;
		
		get("box_customers").appendChild(this.dom.root);
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
		this.dom.text = null;
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
		this.need.effect = arrayPick([ "health", "love", "explode" ]);
		this.need.effectTexts = arrayPick(this.texts["effect_" + this.need.effect]);
		this.need.subject = arrayPick(this.subjectVariations);
		
		this.need.pronouns = {
			"she": this.need.subject.she,
			"her": this.need.subject.her,
			"subject1": this.need.subject.subject1,
			"subject2": (chance(0.5) ? this.need.subject.subject2 : this.need.subject.she),
			"suddenly": arrayPick(this.texts["suddenly"])
		};
		
		this.need.text = this.replacePlaceholders(arrayPick(this.texts["need"]) + " " + this.need.effectTexts[0] + ".");
	}
	
	describeNeed()
	{
		return this.need.text;
	}
	
	reactToPotion(quality, effect)
	{
		let feedback, r, r2, a, points;
		
		feedback = arrayPick(this.texts["rating_needed"]) + " " + this.need.effectTexts[0] + " ";
		
		points = 3 + (this.mood - 0.5) * 2;
		
		// success
		if (this.need.effect == effect)
		{
			feedback += "and ";
			
			if (chance(0.5))
			{
				feedback += arrayPick(this.texts["rating_success"]);
				
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
					feedback += ", " + arrayPick(this.texts["rating_success"]);
				}
				
				feedback += arrayPick([ ".", "!" ]);
			}
			
			if (chance(0.5))
			{
				feedback += " " + arrayPick(this.texts["rating_thanks"]) + arrayPick([ ".", "!" ]);
				points += 1;
			}
			
			points += 2;
		}
		// failure
		else
		{
			a = arrayPick(this.texts["effect_" + effect]);
			
			points -= 2;
			
			feedback += " " + arrayPick(this.texts["rating_fail"]) + " " + a[2];
			
			if (chance(0.5))
			{
				feedback += ".";
			}
			else
			{
				feedback += ". " + arrayPick(this.texts["rating_never_again"]) + ".";
			}
		}
		
		// TODO: "3 out of 5 stars.", "3 stars.", "3/5"
		
		return {
			points: points,
			comment: this.replacePlaceholders(feedback)
		};
	}
	
	setupNextWait()
	{
		this.status = CUSTOMER_STATUS_AWAY;
		this.waitTime = Math.floor(Math.random() * 10);
		this.ringAnswered = false;
		this.orderAccepted = false;
		this.potion = null;
	}
	
	answerRing()
	{
		this.ringAnswered = true;
		this.waitTime = 1;
		this.tick();
	}
	
	acceptOrder()
	{
		this.orderAccepted = true;
		this.waitTime = 1;
		this.tick();
	}
	
	declineOrder()
	{
		this.orderAccepted = false;
		this.waitTime = 1;
		this.tick();
	}
	
	dismiss()
	{
		this.hideDom();
		this.status = CUSTOMER_STATUS_RESET;
		this.waitTime = 3;
	}
	
	giveFeedback()
	{
		let s
		
		s = this.reactToPotion(this.potion[0], this.potion[1]);
		
		this.setText(s.comment);
	}
	
	testGetRandomPotion()
	{
		this.potion = [ arrayPick([ "pure" ]), arrayPick([ "health", "love", "explode" ]) ];
		this.waitTime = 1;
		this.tick();
	}
	
	tick()
	{
		this.waitTime--;
		
		if (this.waitTime <= 0)
		{
			switch (this.status)
			{
				case CUSTOMER_STATUS_AWAY:
					this.setupNeed();
					this.createDom();
					this.status = CUSTOMER_STATUS_RINGING;
					this.setText("*knock* *knock*");
					this.waitTime = 3;
					this.dom.image.style.background = this.color;
				break;
				
				case CUSTOMER_STATUS_RINGING:
					if (this.ringAnswered)
					{
						this.status = CUSTOMER_STATUS_ASKING;
						this.setText(this.describeNeed());
						this.waitTime = 10;
					}
					else
					{
						// TODO: "do not disturb" mode?
						this.status = CUSTOMER_STATUS_SWEARING;
						this.setText("*$!#@!$");
						this.waitTime = 1;
					}
				break;
				
				case CUSTOMER_STATUS_SWEARING:
						// this.status = CUSTOMER_STATUS_RESET;
						this.dom.image.style.background = "#222222";
						this.status = CUSTOMER_STATUS_STOPPED;
						this.waitTime = 3;
				break;
				
				case CUSTOMER_STATUS_ASKING:
					if (this.orderAccepted)
					{
						this.status = CUSTOMER_STATUS_GOING;
						this.dom.name.innerHTML += " (" + this.need.effect + ")";
						this.setText("Thanks, I'll be back.");
					}
					else
					{
						this.status = CUSTOMER_STATUS_RESET;
						this.setText("OK, no problem, bye.");
					}
					
					this.waitTime = 3;
				break;
				
				case CUSTOMER_STATUS_GOING:
					this.status = CUSTOMER_STATUS_WAITING;
					this.setText("*away*");
					this.waitTime = 3;
					
					this.dom.image.style.background = "#222222";
				break;
				
				case CUSTOMER_STATUS_WAITING:
					this.status = CUSTOMER_STATUS_BACK;
					this.setText("Hi, is he potion ready?");
					this.waitTime = 10;
					
					this.dom.image.style.background = this.color;
				break;
				
				case CUSTOMER_STATUS_BACK:
					
					// TODO: check if got potion or just stood there a few days
					if (this.potion)
					{
						this.status = CUSTOMER_STATUS_GOING2;
						this.setText("Thanks!");
					}
					else
					{
						this.status = CUSTOMER_STATUS_SWEARING;
						this.setText("*$!#@!$");
					}
					this.waitTime = 1;
				break;
				
				case CUSTOMER_STATUS_GOING2:
					this.dom.image.style.background = "#222222";
					this.status = CUSTOMER_STATUS_USING;
					this.setText("*away, will give feedback*");
					this.waitTime = 3;
				break;
				
				case CUSTOMER_STATUS_STOPPED:
					this.setText("");
				break;
				
				case CUSTOMER_STATUS_USING:
					this.giveFeedback();
					this.status = CUSTOMER_STATUS_RESET;
					this.waitTime = 1;
				break;
				
				case CUSTOMER_STATUS_RESET:
					this.dom.image.style.background = "#222222";
					this.setText("");
					this.setupNextWait();
				break;
			}
		}
	}
}
