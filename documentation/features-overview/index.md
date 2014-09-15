---
layout: docs
title: Documentation - Features Overview
---

# Features Overview

JaVers is designed as a framework for **auditing changes** in your object-oriented data.

With JaVers you can easily commit changes performed on your objects graph to specialized repository
(called <a href="http://javers.org/javadoc_0.8.0/org/javers/repository/api/JaversRepository.html"><code>JaversRepository</code></a>).
Then you can browse detailed change history of given object in two forms - diffs and snapshots. 

Data auditing framework is built on the top of **object diff** engine, which could be use as standalone object diff tool for ad-hoc
comparing of two objects graphs.

All JaVers functions are exposed via single Facade -
<a href="http://javers.org/javadoc_0.8.0/index.html?org/javers/core/Javers.html"><code>JaVers</code></a> instance.
As you can see, JaVers api is concise and simple.

##1. Object diff
JaVers Object Diff is the easiest way to deeply compare two graphs of objects.

**How to use it?**

* Create a JaVers instance (//TODO link to getting started) and  
  use <a href="http://javers.org/javadoc_0.8.0/org/javers/core/Javers.html#compare-java.lang.Object-java.lang.Object-">
  <code>javers.compare()</code></a> to compare two graphs of objects. 
   
* As the result you get list of atomic <a href="http://javers.org/javadoc_0.8.0/index.html?org/javers/core/diff/Change.html"><code>Changes</code></a>.
  There are several types of Changes: *ValueChange*, *ReferenceChange*, *ListChange* and so on (see inheritance hierarchy of 
  <a href="http://javers.org/javadoc_0.8.0/index.html?org/javers/core/diff/Change.html"><code>Change</code></a> class, to get complete list).      

##2. JaVers Repository
<a href="http://javers.org/javadoc_0.8.0/org/javers/repository/api/JaversRepository.html"><code>JaversRepository</code></a>
is a central part of our data auditing engine. 

It tracks every change made on your data (both values and relations) so you can easily identify when the change was made, who did it and
what was the value before and after.

**How to use it?**

* Configure JaVers (see <a href="/documentation/configuration"><code>configuration</code></a>) and build a
  JaVers instance. 

* Integrate JaVers with your system by applying 
  <a href="http://javers.org/javadoc_0.8.0/org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-"><code>javers.commit()</code></a>
  function in every place where 
  important data (domain objects) are being created and modified by application users.
  
* You don't need to commit every object. JaVers navigates through objects graph, starting from
  the object provided for <a href="http://javers.org/javadoc_0.8.0/org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-"><code>javers.commit()</code></a>
  and deeply comparing whole structure with previous version stored in repository.
  Thanks to that approach you can commit large structures, like trees, graphs, DDD aggregates withe a single
  javers.commit() call.
  
* Once your domain objects are managed by JaVers, you can query JaVers about change history. 
  Use unified 
  <a href="http://javers.org/javadoc_0.8.0/index.html?org/javers/core/metamodel/object/GlobalId.html"><code>GlobalId</code></a> 
  to identify both Entity instances and Value Objects.
  
* JaVers provides two views on object change history: diffs and snapshots.
  Use <a href="http://javers.org/javadoc_0.8.0/org/javers/core/Javers.html#getChangeHistory-java.lang.Object-java.lang.Class-int-">
  <code>javers.getChangeHistory()</code></a>
  and <a href="http://javers.org/javadoc_0.8.0/org/javers/core/Javers.html#getStateHistory-java.lang.Object-java.lang.Class-int-">
  <code>javers.getStateHistory()</code></a>
  functions to browse detailed history of given object.
  
JaversRepository is designed to be easily implemented for any kind of database,
for now we provide <code>MongoDB</code> implementation. SQL implementation will be provided soon.
If you are using another database, for example <code>Cassandra</code>, you are encouraged to implement 
JaversRepository interface and contribute it to JaVers project.

##3. JSON serialization
JaVers has well designed and customizable JSON serialization & deserialization module, based on 
<a href="https://code.google.com/p/google-gson/"><code>GSON</code></a>  and Java reflection. 
Your data are splited into chunks (atomic changes) and persisted in database as JSON
with minimal mapping configuration effort. (//TODO link to JSON TypeAdapters)
