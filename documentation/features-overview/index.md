---
layout: docs
title: Documentation - Features Overview
---

# Features Overview #

JaVers is designed as a framework for **auditing changes** in your object-oriented data.

With JaVers you can easily commit changes performed on your objects graph to specialized repository
(called [`JaversRepository`]({{ site.javadoc_url }}index.html?org/javers/repository/api/JaversRepository.html)).
Then you can browse detailed change history of given object in two forms - diffs and snapshots. 

Data auditing framework is built on the top of **object diff** engine, which could be use as standalone object diff tool for ad-hoc
comparing of two objects graphs.

All JaVers functions are exposed via single Facade, the
[`JaVers`]({{ site.javadoc_url }}index.html?org/javers/core/Javers.html) instance.
As you can see, JaVers api is concise and simple.

<a name="object-diff"></a>
## Object diff ##
JaVers Object Diff is the easiest way to deeply compare two graphs of objects.

**How to use it?**

* Create a JaVers instance (see [getting started](/documentation/getting-started/#create-javers-instance)) and  
  use [`javers.compare()`]({{ site.javadoc_url }}org/javers/core/Javers.html#compare-java.lang.Object-java.lang.Object-)
  to compare two graphs of objects. 
   
* As the result you get list of atomic `Changes`.
  There are several types of Changes: *ValueChange*, *ReferenceChange*, *ListChange* and so on (see inheritance hierarchy of 
  [`Change`]({{ site.javadoc_url }}index.html?org/javers/core/diff/Change.html) class, to get complete list).      

<a name="javers-repository"></a>
## JaVers Repository ##
[`JaversRepository`]({{ site.javadoc_url }}index.html?org/javers/repository/api/JaversRepository.html)
is a central part of our data auditing engine. 

It tracks every change made on your data (both values and relations) so you can easily identify when the change was made,
who did it and what was the value before and after.

**How to use it?**

* Configure (see [configuration](/documentation/configuration)) and build the
  [`JaVers`]({{ site.javadoc_url }}index.html?org/javers/core/Javers.html) instance. 

* Integrate JaVers with your system by applying 
  [`javers.commit()`]({{ site.javadoc_url }}org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-)
  function in every place where 
  important data (domain objects) are being created and modified by application users.
  
* You don't need to commit every object. JaVers navigates through objects graph, starting from
  the object provided for
  [`javers.commit()`]({{ site.javadoc_url }}org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-)
  and deeply comparing whole structure with previous version stored in repository.
  Thanks to that approach you can commit large structures, like trees, graphs, DDD aggregates withe a single
  javers.commit() call.
  
* Once your domain objects are managed by JaVers, you can query JaVers about change history. 
  Use unified 
  [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html)
  to identify both Entity instances and Value Objects.
  
* JaVers provides two views on object change history: diffs and snapshots.
  Use [`javers.getChangeHistory()`]({{ site.javadoc_url }}org/javers/core/Javers.html#getChangeHistory-java.lang.Object-java.lang.Class-int-)
  and [`javers.getStateHistory()`]({{ site.javadoc_url }}org/javers/core/Javers.html#getStateHistory-java.lang.Object-java.lang.Class-int-)
  functions to browse detailed history of given object.
  
JaversRepository is designed to be easily implemented for any kind of database,
for now we provide `MongoDB` implementation. SQL implementation will be provided soon.
If you are using another database, for example `Cassandra`, you are encouraged to implement 
JaversRepository interface and contribute it to JaVers project.

<a name="json-serialization"></a>
## JSON serialization ##
JaVers has well designed and customizable JSON serialization & deserialization module, based on 
[`GSON`](https://code.google.com/p/google-gson/) and Java reflection. 
Your data are splited into chunks (atomic changes) and persisted in database as JSON
with minimal mapping configuration effort. (`//TODO` link to JSON TypeAdapters Configuration page)
