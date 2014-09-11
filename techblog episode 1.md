# Increasing Capacity and improving Resilience with asynchronous request processing

There will be two parts od this article, first we define 
what is *Capacity* and *Resilience* of a typical e-commerce site.

Then we show how classical approach to request processing 
(often referred as thread-per-socket) can badly affect your site Capacity and Resilience.

In the second part we explain the new approach to request processing called
 *asynchronous* or some times *non-blocking*. We will show how it can help you too keep your production stable.

Example implementations on Tomcat and Undertow will be shown.

## Use case - typical e-commerce site
Consider, you are creating e-commerce site and you are working on the search feature.
Scenario is simple:
* user is typing a query in a search input and fires a HTTP request
* application server receives the request and queries the database server
* database server is doing some hard work to calculate result set
* application server renders data as JSON and sends response back to the user's browser

When development is done, you deploy the system on test environment and start playing with performance tests.

After first test, you measured that client receives response after less then 500ms, 
and most of the time, your application server is waiting on database server
but after data arrive, response is rendered quite fast.
 
Then you fire load test and measured, that your system is performing well when hit by 40 requests per seconds (RPS).
Beyond that limit, average request processing time is substantially extended to 600ms and more. 

Let's say that database server is old good SQL and do not perform
very well under heavy load and is not easy scalable.
You identified database as a bottleneck, because it starts heaving troubles when asked to serve more than 20 concurrent sessions.

So far so good. 
Since database is a bottleneck it doesn't really mater how good are you in request processing and how many 
application servers you spawn in your cluster.
You still can promise to your stakeholders 40 RPS on production with latency around 500ms

If this is ok for them, job is done, really? Let's talk about *Capacity* and *Resilience* 

##Capacity and Resilience 
Michael T. Nygard defineds *Capacity* as maximum amount of work that system can do in the unit of time
with acceptable latency. In our case:
    
    Capacity = 40 RPS with 95% request processed in less than 500ms
    
What about *Resilience*? It can't be easily measured, Michael T. Nygard describes it as a feature.
Resilience means failure proof. Resilient system contains of loosely-coupled parts. 
When the failure occurs in one part it doesn't propagate to another parts and 
doesn't knock down the whole system. Of course some features will deny to work but others should work normally.





Feature of the system that can isolate failures is hard to knock out even if 