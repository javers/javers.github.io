---
layout: page
title: Features Overview
category: Documentation
submenu: features
sidebar-url: features-sidebar.html
---

JaVers is designed as a framework for **auditing changes** in your object-oriented data.

With JaVers you can easily commit changes performed on your object graph to a specialized repository
(called JaversRepository).
Then you can browse the detailed change history of a given object in two forms — diffs and snapshots.

The data auditing framework is built on top of the **object diff engine**,
which could be used as a standalone object diff tool for ad-hoc
comparison of two object graphs.

All JaVers functions are exposed via a single Facade, the
[Javers]({{ site.github_core_main_url }}org/javers/core/Javers.java) instance.
As you can see, JaVers API is concise and simple.

<h2 id="object-diff">Object diff</h2>
JaVers object diff is the easiest way to deeply compare two object graphs.

**How to use it?**

* Create a JaVers instance (see [getting started](/documentation/getting-started#create-javers-instance)) and
  use [`javers.compare()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  to compare two object graphs.

* As the result, you get list of atomic [`Changes`]({{ site.github_core_main_url }}org/javers/core/diff/Change.java).
  There are several types of Changes:
  [`ValueChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ValueChange.java),
  [`ReferenceChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ReferenceChange.java),
  [`ListChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/container/ListChange.java) and so on (see the inheritance hierarchy of
  [`Change`]({{ site.github_core_main_url }}org/javers/core/diff/Change.java)
  class to get the complete list).

* Take a look at [diff examples](/documentation/diff-examples).

<h2 id="javers-repository">JaVers Repository</h2>
[`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java)
is the central part of our data auditing engine.

It tracks every change made on your data (both values and relations) so you can easily identify when the change was made,
who made it and what was the value before and after.

**How to use it?**

* Configure and build a
  JaVers instance (see [configuration](/documentation/domain-configuration)).

* Integrate JaVers with your system by applying
  the [`javers.commit()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  function in every place where
  important data (domain objects) are being created and modified by application users.

* You don’t need to commit every object. JaVers navigates through the object graph, starting from
  the object passed to
  [`javers.commit()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  and deeply compares the whole structure with the previous version stored in JaversRepository.
  Thanks to this approach, you can commit large structures, like trees, graphs and DDD aggregates with a single
  `commit()` call.

* If you are using Spring Data, annotate your Repositories with
  [`@JaversSpringDataAuditable`]({{ site.github_spring_main_url }}org/javers/spring/annotation/JaversSpringDataAuditable.java)
  and take advantage of the [auto-audit aspect](/documentation/spring-integration#auto-audit-aspect).

* Once your domain objects are being managed by JaVers, you can query
  JaversRepository using powerful [JQL](/documentation/jql-examples) &mdash; JaVers Query Language.
  
* JaVers provides [three views](/documentation/jql-examples/#data-history-views) on objects history:
  [Changes](/documentation/jql-examples/#query-for-changes),
  [Shadows](/documentation/jql-examples/#query-for-shadows) and 
  [Snapshots](/documentation/jql-examples/#query-for-snapshots). 
  Use [`javers.find*()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  methods to browse detailed history of a given class, object or property.

* Take a look at [repository examples](/documentation/repository-examples).
  
[`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java) is designed to be easily implemented for any kind of database.
Javers provides Repository implementations for **MongoDB**, **SQL**, and **Redis**.
The SQL Repository supports the following dialects: 
H2, PostgreSQL, MySQL/MariaDB, Oracle, and Microsoft SQL Server.<br/>
See [repository configuration](/documentation/repository-configuration).

If you are using another database, for example Cassandra, you are encouraged to implement
the JaversRepository interface and contribute it to Javers project.

<h2 id="json-serialization">JSON serialization</h2>
JaVers has a well-designed and customizable JSON serialization and deserialization module, based on
[`GSON`](https://code.google.com/p/google-gson/) and Java reflection.
Your data are split into chunks (atomic changes) and persisted in a database as JSON
with minimal mapping configuration effort
(see [custom JSON serialization](/documentation/repository-configuration#custom-json-serialization)).
