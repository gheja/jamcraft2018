"use strict";

class Profile
{
	constructor()
	{
		this.name = "Player";
		this.feedbacks = [];
		this.rating1 = 0;
		this.rating2 = 0;
		this.rank1 = 0;
		this.rank2 = 0;
		
		this.competitorRatings1 = [];
		this.competitorRatings2 = [];
	}
	
	setup()
	{
		let i, count;
		
		this.competitorRatings1.length = 0;
		this.competitorRatings2.length = 0;
		
		count = Math.floor(Math.random() * 500 + 500);
		
		for (i=0; i<count; i++)
		{
			this.competitorRatings1.push((Math.pow(Math.random(), 0.7) + Math.random() * 0.1 - 0.1) * 4 + 1);
			this.competitorRatings2.push((Math.pow(Math.random(), 0.7) + Math.random() * 0.1 - 0.1) * 4 + 1);
		}
	}
	
	getRank(arr, rating)
	{
		let i, rank;
		
		rank = 1;
		
		for (i in arr)
		{
			if (arr[i] > rating)
			{
				rank++;
			}
		}
		
		return rank;
	}
	
	receiveFeedback(rating, text, customer)
	{
		let arr, a, b, c;
		
		arr = {
			rating: rating,
			text: text,
			customerName: customer.name,
			customerColor: customer.color,
			customerPictureNumber: customer.profilePictureNumber
		};
		
		a = document.createElement("div");
		a.className = "feedback";
		
		b = document.createElement("div");
		b.className = "customer_picture_background";
		b.style.background = arr.customerColor;
		a.appendChild(b);
		
		b = document.createElement("div");
		b.className = "customer_picture customer_picture_" + arr.customerPictureNumber;
		a.appendChild(b);
		
		
		c = document.createElement("div");
		c.className = "feedback_content";
		
		b = document.createElement("div");
		b.className = "rating_background";
		c.appendChild(b);
		
		b = document.createElement("div");
		b.className = "rating_foreground";
		b.style.width = (Math.floor(rating) * 11) + "px";
		c.appendChild(b);
		
		b = document.createElement("div");
		b.className = "feedback_title";
		b.innerHTML = "from <b>" + arr.customerName + "</b>";
		c.appendChild(b);
		
		b = document.createElement("div");
		b.className = "feedback_text";
		b.innerHTML = text + "<br class=\"clearer\" />";
		c.appendChild(b);
		
		a.appendChild(c);
		
		get("feedbacks").appendChild(a);
		
		logMessage("New feedback of <b>" + rating + " stars</b> received from <b>" + customer.name +"</b>.", MESSAGE_NORMAL);
		this.feedbacks.push(arr);
		this.update();
	}
	
	update()
	{
		let i, count1, total1, count2, total2;
		
		count1 = 0;
		total1 = 0;
		count2 = 0;
		total2 = 0;
		
		for (i in this.feedbacks)
		{
			total1 += this.feedbacks[i].rating;
			if (this.feedbacks[i].rating2 != 0)
			{
				total2 += this.feedbacks[i].rating2;
				count2++;
			}
			
			count1++;
		}
		
		if (count1 == 0)
		{
			this.rating1 = 0;
		}
		else
		{
			this.rating1 = total1 / count1;
		}
		
		if (count2 == 0)
		{
			this.rating2 = 0;
		}
		else
		{
			this.rating2 = total2 / count2;
		}
		
		this.rank1 = this.getRank(this.competitorRatings1, this.rating1);
		this.rank2 = this.getRank(this.competitorRatings2, this.rating2);
		
		if (count1 < 5)
		{
			get("feedback_total_stars").style.width = "0px";
			setText("feedback_total_text", "Awaiting " + (5 - count1) + " more feedback.");
		}
		else
		{
			get("feedback_total_stars").style.width = Math.floor(this.rating1 / 5 * 55) + "px";
			setText("feedback_total_text", "<b>" + round(this.rating1) + "</b>/5.0 (" + count1 + " feedbacks), <b>#" + this.rank1 + "</b> of " + (this.competitorRatings1.length + 1));
		}
	}
	
	updateScreen()
	{
		
	}
}
