<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '812766595177360');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=812766595177360&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->







Automatic advanced matching
Use information that your customers have already provided to your business, such as their email addresses or phone numbers, to match your website's visitors to people who are on Facebook. This can help you attribute more conversions to your ads on Facebook and reach more people through remarketing campaigns.Learn more

Turn on automatic advanced matching
Verify the customer information you want to send.

City, State, ZIP/Postal Code

Country

Date of birth

Email

External id

Gender

First and last name

Phone number
This information will be hashed to better protect user privacy before it is sent to Facebook. Sensitive information, such as financial, health and government ID data will not be sent.Learn more

instructions 

Install Meta Pixel on your website
The Meta Pixel is a piece of code that you add to your website by copying the base code below and pasting it into the header section of your website.
1
Copy base code
Copy the Meta Pixel base code below.


<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '812766595177360');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=812766595177360&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
Copied
2
Paste base code to website
Paste the Meta Pixel code between the <head> and </head> tags of your web page. You may already have other existing code between the head tags, so just place the pixel code underneath that, but above </head>. Install the base code on every page of your website.See more detailed instructions
​
See what your website code will look like with the Meta Pixel installed
View example code
3
Save website code changes
Before returning to this screen, refresh your website to save and confirm the changes you made to your website's code.






You may be able to speak with a Meta Technical Pro for step-by-step guidance to implement standard events for your Meta Pixel. Learn how to schedule a call with a Meta Pro.
Events are actions people take on your website. Standard events are predefined by Meta for logging conversions, optimizing for conversions, and building audiences. Below is a list of standard events for the Meta Pixel. For a full list of standard events and their parameters, visit our Meta for Developers site.

Standard events
Website action	Description	Standard event code
Add payment info	Adding customer payment information during a checkout process. For example, clicking a button to save billing information.	fbq('track', 'AddPaymentInfo');
Add to cart	Adding an item to a shopping cart or basket. For example, clicking an add-to-cart button on a website.	fbq('track', 'AddToCart');
Add to wishlist	Adding items to a wishlist. For example, clicking an add-to-wishlist button on a website.	fbq('track', 'AddToWishlist');
Complete registration	Submitting information in exchange for a service provided by your business. For example, signing up for an email subscription.	fbq('track', 'CompleteRegistration');
Contact	Contact between a customer and your business through phone, SMS, email, chat, or other means.	fbq('track', 'Contact');
Customize product	Customizing products through a configuration tool or other application owned by your business.	fbq('track', 'CustomizeProduct');
Donate	Donating funds to your organization or cause.	fbq('track', 'Donate');
Find location	When a person finds one of your locations via web, with an intention to visit. For example, searching for a product and finding it at one of your local stores.	fbq('track', 'FindLocation');
Initiate checkout	The start of a checkout process. For example, clicking a checkout button.	fbq('track', 'InitiateCheckout');
Lead	A submission of information by a customer with the understanding that they may be contacted at a later date by your business. For example, submitting a form or signing up for a trial.	fbq('track', 'Lead');
Purchase	The completion of a purchase, usually signified by receiving order or purchase confirmation, or a transaction receipt. For example, landing on a thank you or confirmation page.	fbq('track', 'Purchase', {value: 0.00, currency: 'USD'});
Schedule	The booking of an appointment to visit one of your locations.	fbq('track', 'Schedule');
Search	A search performed on your website, app or other property. For example, product or travel searches.	fbq('track', 'Search');
Start trial	The start of a free trial of a product or service you offer. For example, trial subscription.	fbq('track', 'StartTrial', {value: '0.00', currency: 'USD', predicted_ltv: '0.00'});
Submit application	The submission of an application for a product, service or program you offer. For example, a credit card, educational program or job.	fbq('track', 'SubmitApplication');
Subscribe	The start of a paid subscription for a product or service you offer.	fbq('track', 'Subscribe', {value: '0.00', currency: 'USD', predicted_ltv: '0.00'});
View content	A visit to a web page you care about. For example, a product or landing page. View content tells you if someone visits a web page's URL, but not what they do or see on that web page.	fbq('track', 'ViewContent');
Note: The page view event is included as part of your pixel base code. Page view tells you when someone lands on a web page with the pixel base code installed.

Example of a standard event
Here's an example of what your website code will look like with standard events installed:

Diagram showing the implementation of a Meta Pixel standard event in website code.
Your website's original code: Paste the Meta Pixel code between the <head> and </head> tags of your web page. You may already have other existing code between the head tags, so just place the pixel code underneath that, but above </head>.
Your Meta Pixel base code: Your Meta Pixel code will look like the diagram above, except your pixel ID will be different from 1234567890.
Your standard event code: Within your Meta Pixel code, above the </script> tag, paste the standard event code that's relevant to your page, such as the Add To Cart code. You'll need to do this for every page you want to track.
The key here is that every page of your website should have everything that's enclosed in section 2 (the base code), but different pages will have different snippets of code for section 3 (standard event code).

Learn how to install the Meta Pixel.