# Increasing Capacity and improving Resilience with asynchronous request processing

There will be two parts of this article, first we define 
what is *Capacity* and *Resilience* of a typical e-commerce site.

Then we show how classical approach to request processing 
(often referred as thread-per-socket) can badly affect your site *Capacity* and *Resilience*.

In the second part we explain the new approach to request processing called
*asynchronous* or some times *non-blocking*. We will show how it can help you to keep your production stable.

Example implementations for <code>Tomcat</code> and <code>Undertow</code> will be shown.

## Use case - typical e-commerce site
Let's assume, you are creating e-commerce site and you are working on the search feature.
Scenario is simple:
* user is typing a query in a search input and fires a HTTP request
* application server receives the request and queries the database server
* database server is doing some hard work to calculate result set
* application server renders data as JSON
* and sends response back to the user's browser

When development is done, you deploy the system on the test environment and start playing with performance tests.

After first test, it turned out that client receives response after less then 500ms, 
and most of the time, your application server is waiting on database server
but after data arrive, response is rendered quite fast.
 
Then you fire load test, it occurred, that your system is performing well when hit by 40 requests per second (RPS).
Beyond that limit, average request processing time is substantially extended to 600ms and more. 

Let's say that database server is old good SQL and doesn't perform
very well under heavy load and is not easy scalable.
You identified database as a bottleneck, because it starts to have troubles when asked to serve more than 20 concurrent sessions.

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


## How classical Java Servlet approach affects Resilience?
What about our use case, is this system Resilient? If you have chosen classical <code>Java Servlet</code> approach
(sometimes referred as thread-per-socket), answer is simple, no. 

Let's consider two parts of your system: users and database. What happens if database
starts to suffer on *slow responses* or some users will have *slow connections*?

**Slow Response from integration point**. Database is just an example, it could be search engine, distributed cache,
external service or anything outside your JVM which you call by network. 

Consider what happens when system you depend on will be overloaded, not necessarily by you but for some another reason.
It will send you responses but really slowly. 
In our case, for example, database server will send query result not in 500ms as usual but in 10 second.

It means that all user search request and then <code>http threads</code> will be waiting for response from database.
Users becomes angry and will click Search button several times, who wants to wait 10 seconds? So more requests to serve.
Soon, http thread pool will saturate, and user search request will be queued and waiting for idle http thread.

Requests to main page are usually served without touching the database 
but they also will be queued and waiting for thread.
 
Even worse, application server will stop responding for http **health checks** from load balancer
and it could decide to kick it off from the cluster. 
It means more requests for remaining servers and inevitable disaster. 
 
The whole system is completely knocked down because of database failure.
Your CTO is calling to you, asking whats going on and gives you very boring lecture about mission critical systems
and how much money company will loose per every second of system unavailability.
 
Don't worry! There are several ways to made our system more resistant to *Slow Responses* from integration point.
The simplest solution is using timeouts, something more clever are *promises* implemented in Java8 as 
<code>Completable Futures</code>.
But the most interesting solution is *Asynchronous requests processing*, I'll explain later how it works. 
                                    
**Slow Connections with users**.
Another part of your system which can easily knocks down the whole system are users.
Usually the are nice and use broadband internet connections. Usually they are not willing to harm you.

Consider what happens when group of your legitimate users will go to the Airport, connect their smartfons to WiFi
(probably all to the same WiFi router) and start to use search feature of your site.

On the test environment all network connections are fast, but on production, some people could connect via poor WiFi or just
slow mobile networks. Suddenly, you could realize that the last phase of our scenario 
, *sending response back to the user's browser*, for some mobile guys last for ages.
Those guys could allocate all http threads from your pool and made 
them wait (the worst thing a thread can do).
Threads will be doing nothing but waiting to send another network packet via slow TCP connections.
  
It could be a fast track to similar disaster as described above, whole system will be knocked down.
The best way to solve this problem is asynchronous requests processing.

## How classical Java Servlet approach affects Capacity?
Lets talk about Capacity in our use case. 40 RPS is not very impressive these days. What if your stakeholders require 
thousands? First you could easily eliminate obvious bottleneck, the old good SQL database, and replace it with something modern, fancy and scalable,
for example <code>SolrCloud</code>.

When you perform another round of load test, you will realize that next capacity bottleneck is http thread pool.
Tomcat defaults pool size to 200. 
It could be extent but every thread costs a lot of resources: memory for stack and CPU time for switching.
You can always add more nodes to the cluster, but still, the overall capacity will be limited by the size of http thread pools.

The most elegant way to solve this problem (without buying more servers) is once again,
asynchronous requests processing backed by NIO.


In the second part of this article I'll explain how it works and 
will show example implementations for <code>Tomcat</code> and <code>Undertow</code>.




