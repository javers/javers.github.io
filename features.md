---
layout: page
title: Features Overview
category: Documentation
submenu: features
sidebar-url: features-sidebar.html
redirect_from:
  - /documentation/features/
---

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

* Create a JaVers instance (see [getting started](/documentation/getting-started#create-javers-instance)) and
  use [`javers.compare()`]({{ site.javadoc_url }}org/javers/core/Javers.html#compare-java.lang.Object-java.lang.Object-)
  to compare two object graphs.

* As the result, you get list of atomic *Changes*.
  There are several types of Changes: ValueChange, ReferenceChange, ListChange and so on (see the inheritance hierarchy of
  [Change]({{ site.javadoc_url }}index.html?org/javers/core/diff/Change.html) class to get the complete list).

* Take a look at [diff examples](/documentation/diff-examples).

<h2 id="javers-repository">JaVers Repository</h2>
[`JaversRepository`]({{ site.javadoc_url }}index.html?org/javers/repository/api/JaversRepository.html)
is the central part of our data auditing engine.

It tracks every change made on your data (both values and relations) so you can easily identify when the change was made,
who made it and what was the value before and after.

**How to use it?**

* Configure and build a
  JaVers instance (see [configuration](/documentation/domain-configuration)).

* Integrate JaVers with your system by applying
  the [`javers.commit()`]({{ site.javadoc_url }}org/javers/core/Javers.html#commit-java.lang.String-java.lang.Object-)
  function in every place where
  important data (domain objects) are being created and modified by application users.

* You don’t need to commit every object. JaVers navigates through the object graph, starting from
  the object passed to
  `javers.commit()` and deeply compares the whole structure with the previous version stored in JaversRepository.
  Thanks to this approach, you can commit large structures, like trees, graphs and DDD aggregates with a single
  `commit()` call.

* If you are using Spring Data, annotate your Repositories with @JaversSpringDataAuditable
  and take advantage of the [auto-audit aspect](/documentation/spring-integration#auto-audit-aspect).

* Once your domain objects are being managed by JaVers, you can query
  JaversRepository (see [JQL examples](/documentation/jql-examples))
  for objects change history.

* JaVers provides two views on object change history: diffs and snapshots.
  Use [javers.findChanges(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findChanges-org.javers.repository.jql.JqlQuery-)
  and [javers.findSnapshots(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findSnapshots-org.javers.repository.jql.JqlQuery-)
  functions to browse the detailed history of a given class, object or property.

* Take a look at [repository examples](/documentation/repository-examples).

JaversRepository is designed to be easily implemented for any kind of database.
At the moment we provide **MongoDB** implementation and
**SQL** implementation for the folowing dialects: MySQL, PostgreSQL, H2,
Oracle and Microsoft SQL Server.<br/>
See [repository configuratoin](/documentation/repository-configuration).

If you are using another database, for example Cassandra, you are encouraged to implement
the JaversRepository interface and contribute it to JaVers project.

<h2 id="json-serialization">JSON serialization</h2>
JaVers has a well-designed and customizable JSON serialization and deserialization module, based on
[`GSON`](https://code.google.com/p/google-gson/) and Java reflection.
Your data are split into chunks (atomic changes) and persisted in a database as JSON
with minimal mapping configuration effort
(see [custom JSON serialization](/documentation/repository-configuration#custom-json-serialization)).
