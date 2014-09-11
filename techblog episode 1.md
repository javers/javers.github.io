# Increasing Capacity and improving Resilience with asynchronous request processing

There will be two parts od this article, first we define 
what is Capacity and Resilience of a typical e-commerce site.

Then we show how classical approach to request processing 
(often referred as thread-per-socket) can badly affect your site Capacity and Resilience.

In the second part we explain new approach to request processing called
 asynchronous or some times non-blocking. We will show how it can increase site Capacity and Resilience. 
Example implementations on Tomcat and Undertow will be shown.

## Use case - typical e-commerce site
Consider, you are creating e-commerce site and you are working on the search feature.
Scenario is simple:
* user is typing a query in a search input and fires a HTTP request
* application server receives the request and queries the database server
* database server is doing some hard work to calculate result set
* application server renders data as JSON and sends response back to the user's browser
