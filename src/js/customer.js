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

class Customer
{
	constructor()
	{
		this.name = "Customer";
		this.mood = 0.5; // 0..1, grumpy..happy
		this.confidence = 0.5;
		this.status = CUSTOMER_STATUS_AWAY;
		this.waitTime = 0;
		this.ringAnswered = false;
		this.orderAccepted = false;
		this.potion = null;
		this.currentText = "";
		
		this.need = {
			effect: null,
			subject: null,
			effectTexts: null,
			pronouns: null
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
	}
	
	describeNeed()
	{
		return this.replacePlaceholders(arrayPick(this.texts["need"]) + " " + this.need.effectTexts[0] + ".");
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
		
		return {
			points: points,
			comment: this.replacePlaceholders(feedback)
		};
	}
	
	setupNextWait()
	{
		this.status = CUSTOMER_STATUS_AWAY;
		this.waitTime = 10;
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
	
	giveFeedback()
	{
		let s
		
		s = this.ratePotion(this.potion[0], this.potion[1]);
	}
	
	testGetRandomPotion()
	{
		this.potion = [ arrayPick([ "pure" ]), arrayPick([ "health", "love", "explode" ]) ];
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
					this.status = CUSTOMER_STATUS_RINGING;
					this.currentText = "*ring*";
					this.waitTime = 10;
				break;
				
				case CUSTOMER_STATUS_RINGING:
					if (this.ringAnswered)
					{
						this.status = CUSTOMER_STATUS_ASKING;
						this.currentText = this.describeNeed();
						this.waitTime = 10;
					}
					else
					{
						// TODO: "do not disturb" mode?
						this.status = CUSTOMER_STATUS_SWEARING;
						this.currentText = "*$!#@!$";
					}
				break;
				
				case CUSTOMER_STATUS_SWEARING:
					this.setupNextWait();
				break;
				
				case CUSTOMER_STATUS_ASKING:
					if (this.orderAccepted)
					{
						this.status = CUSTOMER_STATUS_GOING;
						this.currentText = "Thanks, I'll be back.";
						this.waitTime = 10;
					}
					else
					{
						this.status = CUSTOMER_STATUS_AWAY;
						this.currentText = "OK, no problem, bye.";
						this.setupNextWait();
					}
				break;
				
				case CUSTOMER_STATUS_GOING:
					this.status = CUSTOMER_STATUS_WAITING;
					this.currentText = "*waiting*";
				break;
				
				case CUSTOMER_STATUS_WAITING:
					this.status = CUSTOMER_STATUS_BACK;
					this.currentText = "Hi, is he potion ready?";
					this.waitTime = 30;
				break;
				
				case CUSTOMER_STATUS_BACK:
					// TODO: check if got potion or just stood there a few days
					this.status = CUSTOMER_GOING2;
					this.currentText = "Hi, is he potion ready?";
					this.waitTime = 10;
				break;
				
				case CUSTOMER_STATUS_GOING2:
					this.currentText = "*away, will give feedback*";
					this.waitTime = 10;
				break;
				
				case CUSTOMER_STATUS_USING:
					this.giveFeedback();
					this.currentText = "*giving feedback*";
					this.waitTime = 10;
					this.setupNextWait();
				break;
			}
		}
	}
}
