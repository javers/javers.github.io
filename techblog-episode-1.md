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

Let's consider one part of your system: users. 
On the test environment all network connections are fast, but on production, some people could connect via poor WiFi or just
slow mobile networks.

What happens if some of your users will suffer on *slow connections*?

**Slow Connections with users**.
Users are often the least tested part of your system and they like to cause troubles.
Let's consider only legitimate users and not those guys who wants to DDOS you. 

We often think that users are nice and use broadband internet connections but that's not true.
Consider what happens when group of them will go to the Airport, connect their smartfons to WiFi
(probably all to the same WLAN router) and start to use search feature of your site.
The other group will connect via slow mobile networks and also star to click.

Suddenly it occurs, that network transport becomes bottleneck in our system. 
For those mobile guys, the last phase of our scenario *'sending response back to the user's browser'*,
will last for ages.
OK, let's say 10 seconds instead of 10 milliseconds in the test environment.
They will receive responses but very slowly and it wouldn't be even your fault but their networks. 

As you know, in classical Java Servlet approach, every active TCP/IP connections is bound to exactly one 
<code>http thread</code>. It means, that each request from mobile guy will allocate one http thread for 10 seconds.
Soon, http thread pool will saturate, and all http request will be queued and waiting for the idle thread.

At this time, some of your mobile friends becomes angry and will click Search button several times,
who wants to wait so long? It means even more request to serve for you.
Nice users with broadband connections will also get nervous because their requests also will
be queued and waiting for the idle thread

Even worse, overloaded application server will stop responding for http **health checks** from load balancer,
who could decide to kick it off from the cluster. 
It means more requests for remaining servers and inevitable disaster. 

The whole system is completely knocked down because of slow connections with mobile guys.
The funny thing is, that all of your servers are almost idle.
Most of http threads do nothing (the worst thing a thread can do)
but waiting to send another network packet via slow TCP connections.

Your CTO is calling to you, asking whats going on and gives you very boring lecture about mission critical systems
and how much money company will loose per every second of system unavailability.
   
Don't worry! There is a smart way to made our system resistant to *Slow Connections*.
Of course, it's an *Asynchronous approach to requests processing*. 
                                    
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




