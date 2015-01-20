---
layout: docs
title: Documentation — Features Overview
submenu: features
---

# Features #

JaVers is designed as a framework for **auditing changes** in your object-oriented data.

With JaVers you can easily commit changes performed on your object graph to a specialized repository
(called JaversRepository).
Then you can browse the detailed change history of a given object in two forms — diffs and snapshots.

The data auditing framework is built on top of the **object diff engine**,
which could be used as a standalone object diff tool for ad-hoc
comparison of two object graphs.

All JaVers functions are exposed via a single Facade, the
[JaVers]({{ site.javadoc_url }}index.html?org/javers/core/Javers.html) instance.
As you can see, JaVers API is concise and simple.

<h2 id="object-diff">Object diff</h2>
JaVers object diff is the easiest way to deeply compare two object graphs.

**How to use it?**

* Create a JaVers instance (see [getting started](/documentation/getting-started/#create-javers-instance)) and  
  use [`javers.compare()`]({{ site.javadoc_url }}org/javers/core/Javers.html#compare-java.lang.Object-java.lang.Object-)
  to compare two object graphs.
   
* As the result, you get list of atomic *Changes*.
  There are several types of Changes: ValueChange, ReferenceChange, ListChange and so on (see the inheritance hierarchy of
  [Change]({{ site.javadoc_url }}index.html?org/javers/core/diff/Change.html) class to get the complete list).

* Take a look at [diff examples](/documentation/diff-examples).

<h2 id="javers-repository">JaVers Repository</h2>
[JaversRepository]({{ site.javadoc_url }}index.html?org/javers/repository/api/JaversRepository.html)
is the central part of our data auditing engine.

It tracks every change made on your data (both values and relations) so you can easily identify when the change was made,
who made it and what was the value before and after.

**How to use it?**

* Configure and build a
  JaVers instance (see [configuration](/documentation/configuration)).

* Integrate JaVers with your system by applying 
  the [javers.commit()]({{ site.javadoc_url }}org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-)
  function in every place where 
  important data (domain objects) are being created and modified by application users.
  
* You don’t need to commit every object. JaVers navigates through the object graph, starting from
  the object passed to
  `javers.commit()` and deeply compares the whole structure with the previous version stored in JaversRepository.
  Thanks to that approach, you can commit large structures, like trees, graphs and DDD aggregates with a single
  `commit()` call.
  
* Once your domain objects are being managed by JaVers, you can query JaVers about change history.
  Use a unified
  [GlobalId]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html)
  to identify both Entities and ValueObjects.
  
* JaVers provides two views on object change history: diffs and snapshots.
  Use [javers.getChangeHistory()]({{ site.javadoc_url }}org/javers/core/Javers.html#getChangeHistory-org.javers.core.metamodel.object.GlobalIdDTO-int-)
  and [javers.getStateHistory()]({{ site.javadoc_url }}org/javers/core/Javers.html#getStateHistory-org.javers.core.metamodel.object.GlobalIdDTO-int-)
  functions to browse the detailed history of a given object.

* Take a look at [repository examples](/documentation/repository-examples).

JaversRepository is designed to be easily implemented for any kind of database.
At the moment we provide MongoDB implementation. SQL implementation will be provided soon.
If you are using another database, for example Cassandra, you are encouraged to implement
the JaversRepository interface and contribute it to JaVers project.

<h2 id="json-serialization">JSON serialization</h2>
JaVers has a well-designed and customizable JSON serialization and deserialization module, based on
[`GSON`](https://code.google.com/p/google-gson/) and Java reflection. 
Your data are split into chunks (atomic changes) and persisted in a database as JSON
with minimal mapping configuration effort
(see [custom JSON serialization](/documentation/configuration#custom-json-serialization)).


<h2 id="release-notes">Release notes</h2>

### 1.0.4
released on 2015-01-20

* [#80](https://github.com/javers/javers/issues/80)
  Added custom comparators support.
  This allows you to register comparators for non-standard collections like Guava Multimap.

### 1.0.3
released on 2015-01-12

* [#47](https://github.com/javers/javers/issues/47)
  Spring integration. Added `@JaversAuditable` annotation for repository methods.

* [#77](https://github.com/javers/javers/issues/77)
  Added missing feature in Generics support.
  <br/>Reported by [Bryan Hunt](https://github.com/binarytemple)

* [#71](https://github.com/javers/javers/issues/71)
  Tracking a top-level object deletion.
  <br/>Reported by [Chuck May](https://github.com/ctmay4)

### 1.0.2
released on 2015-01-08

* [#78](https://github.com/javers/javers/issues/78)
  NullPointerException at ReflectionUtil.getAllFields() when using interface as a variable type

### 1.0.1
released on 2015-01-03

* [#73](https://github.com/javers/javers/issues/73) Listing newObject event on change history.
  <br/>Reported by [Chuck May](https://github.com/ctmay4)


### 1.0.0
released on 2014-12-25

* Production-ready release with stable API