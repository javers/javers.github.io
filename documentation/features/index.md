---
layout: docs
title: Features Overview
submenu: features
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

* Create a JaVers instance (see [getting started](/documentation/getting-started/#create-javers-instance)) and  
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
  and take advantage of the [auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect).

* Once your domain objects are being managed by JaVers, you can query 
  JaversRepository (see [JQL examples](/documentation/jql-examples/)) 
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
See [repository configuratoin](/documentation/repository-configuration/).

If you are using another database, for example Cassandra, you are encouraged to implement
the JaversRepository interface and contribute it to JaVers project.

<h2 id="json-serialization">JSON serialization</h2>
JaVers has a well-designed and customizable JSON serialization and deserialization module, based on
[`GSON`](https://code.google.com/p/google-gson/) and Java reflection. 
Your data are split into chunks (atomic changes) and persisted in a database as JSON
with minimal mapping configuration effort
(see [custom JSON serialization](/documentation/repository-configuration#custom-json-serialization)).


<h2 id="release-notes">Release notes</h2>

### 1.4.7
released on 2016-01-29 <br/>

* [#322](https://github.com/javers/javers/issues/322)
New JQL `withVersion()` filter for snapshot queries.
See [Snapshot version filter example](/documentation/jql-examples/#version-filter).


### 1.4.5
released on 2016-01-25 <br/>

* [#309](https://github.com/javers/javers/issues/309)
New JQL `withCommitId()` filter for snapshot queries.
See [CommitId filter example](/documentation/jql-examples/#commit-id-filter).

### 1.4.4
released on 2016-01-20 <br/>

* [#286](https://github.com/javers/javers/issues/286)
  New properties in `ReferenceChange`: 
  [`getLeftObject()`]({{ site.javadoc_url }}org/javers/core/diff/changetype/ReferenceChange.html#getLeftObject--)
  and 
  [`getRightObject()`]({{ site.javadoc_url }}org/javers/core/diff/changetype/ReferenceChange.html#getRightObject--).

* [#294](https://github.com/javers/javers/pull/294)
  Added version number to Snapshot metadata:
  [`CdoSnapshot.getVersion()`]({{ site.javadoc_url }}org/javers/core/metamodel/object/CdoSnapshot.html#getVersion--).
  
  <font color="red">Warning!</font>
  All snapshots persisted in JaversRepository before release  1.4.4 have version 0.
  If it isn't OK for you, run DB update manually.
  
  For SQL database:
  
  ```sql
  UPDATE jv_snapshot s SET version = (
  SELECT COUNT(*) + 1 FROM jv_snapshot s2
  WHERE s.global_id_fk = s2.global_id_fk and s2.snapshot_pk < s.snapshot_pk)
  ```

### 1.4.3
released on 2016-01-18 <br/>

* [#179](https://github.com/javers/javers/issues/179)
New JQL `skip()` filter, useful for pagination.
See [Skip filter example](/documentation/jql-examples/#skip-filter).

### 1.4.2
released on 2016-01-15 <br/>

* [#243](https://github.com/javers/javers/issues/243) New JQL filters by createDate `from()` and `to()`. 
  See [CommitDate filter example](/documentation/jql-examples/#commit-date-filter).

### 1.4.1
released on 2016-01-08 <br/>

* New JaVers module &mdash; `javers-spring-boot-starter-mongo`.
  See [Spring Boot integration](/documentation/spring-boot-integration/).

### 1.4.0
released on 2015-12-18 <br/>

* Added @TypeName annotation and support for domain classes refactoring, 
  see 
  [Entity refactoring](/documentation/jql-examples/#entity-refactoring) example.
  Fixed issues:
  [#178](https://github.com/javers/javers/issues/178),
  [#232](https://github.com/javers/javers/issues/232).
* [#192](https://github.com/javers/javers/issues/192)
  Fixed bug in persisting large numbers in MongoDB.  
* [#188](https://github.com/javers/javers/pull/188) Diff is now `Serializable`.  

**Breaking changes:**

* Most of `@Deprecated` API removed.
* Slight API changes in few places.
* `GlobalId` is now decoupled from `ManagedType`,
  reference from globalId to concrete managedType is replaced with `typeName` String field.
* `PropertyChange` is now decoupled from `Property`,
  reference from propertyChange to concrete property is replaced with `propertyName` String field.
* Visibility of `ManagedClass` is reduced to `package private`. 

### 1.3.22
released on 2015-11-27 <br/>

* [#250](https://github.com/javers/javers/pull/250)
  Added missing mapping for `CharSequence`.

### 1.3.21
released on 2015-11-13 <br/>

* [#247](https://github.com/javers/javers/pull/247)
  Fixed bug while querying for a ValueObject stored as a Map value.

### 1.3.20
released on 2015-11-08 <br/>

* [#177](https://github.com/javers/javers/pull/177)
  Added long-awaited `javers.compareCollections()` feature.
  See [compare top-level collections](/documentation/diff-examples/#compare-collections) example.

* [#240](https://github.com/javers/javers/pull/240)
  Fixed NPE in `LevenshteinListChangeAppender`.

### 1.3.18
released on 2015-11-04 <br/>

* [#244](https://github.com/javers/javers/pull/244)
 Added support for upper-bounded wildcard types, like `List<? extends Something>`.
 Contributed by [dbevacqua](https://github.com/dbevacqua).

### 1.3.17
released on 2015-10-17 <br/>

* [#224](https://github.com/javers/javers/issues/224)
 Fixed bug in `org.javers.common.collections.Optional.equals()`
 which caused strange ClassCastException.

### 1.3.16
released on 2015-10-14 <br/>

* [#221](https://github.com/javers/javers/issues/221)
 Fixed `JaversException.CANT_SAVE_ALREADY_PERSISTED_COMMIT` thrown when concurrent writes
 happened to hit JaversSqlRepository.

### 1.3.15
released on 2015-10-13 <br/>

* Fixed Java 7 compatibility problem introduced in the previous version.

### 1.3.14
released on 2015-10-13 <br/>

* [#218](https://github.com/javers/javers/issues/218)
 Fixed concurrency issue in TypeMapper which caused ClassCastExceptions, i.e.:
 java.lang.ClassCastException: com.example.MyObject cannot be cast to org.javers.core.metamodel.object.GlobalId

### 1.3.13
released on 2015-10-09 <br/>

* [#207](https://github.com/javers/javers/issues/207)
 Fixed bug in serialization ValueObject arrays.
 Fixed bug in comparing deserialized primitive arrays.

### 1.3.12
released on 2015-10-03 <br/>

* [#208](https://github.com/javers/javers/issues/208)
 Added support for legacy date types: `java.util.Date`, `java.sql.Date`, `java.sql.Timestamp` and `java.sql.Time`.
 Added milliseconds to JSON datetime format.
 All local datetimes are now serialized using ISO format `yyyy-MM-dd'T'HH:mm:ss.SSS`.   

### 1.3.11
released on 2015-10-01 <br/>

* [#213](https://github.com/javers/javers/issues/213)
 Fixed bug in calculating changed properties list in `CdoSnapshot.getChanged()`
 for nullified values.

### 1.3.10
released on 2015-09-30 <br/>

* [#206](https://github.com/javers/javers/issues/206)
 Fixed NPE when reading ValueObject changes from SQL repository.
 It was caused by error in serializing ValueObjectId to JSON.

### 1.3.9
released on 2015-09-24 <br/>

* [#205](https://github.com/javers/javers/issues/205)
 Fixed `AFFECTED_CDO_IS_NOT_AVAILABLE JaVers runtime error` when serializing `Changes` to JSON using Jackson.

### 1.3.8
released on 2015-09-21 <br/>

* [#126](https://github.com/javers/javers/issues/126)
 Added support for Java 8 `java.util.Optional` and types from Java 8 Date and Time API
 (like `java.time.LocalDateTime`).
 JaVers can still run on JDK 7.  
* [#197](https://github.com/javers/javers/issues/197)
 Added JSON prettyPrint switch &mdash; `JaversBuilder.withPrettyPrint(boolean prettyPrint)`
* [#199](https://github.com/javers/javers/issues/199)
Added support for comparing top-level Arrays, i.e.:
`javers.compare(new int[]{1}, new int[]{1,2})`.
Contributed by [Derek Miller](https://github.com/dmmiller612).

### 1.3.5
released on 2015-09-15 <br/>

* [#195](https://github.com/javers/javers/issues/195)
 Added support for JPA @EmbeddedId annotation.

### 1.3.4
released on 2015-08-24 <br/>

* [#190](https://github.com/javers/javers/issues/190) 
 Fixed bug in ManagedClassFactory, Id property can be registered even if it has @Transient annotation.

### 1.3.3
released on 2015-08-12 <br/>

* Javers-hibernate module merged to javers-spring.
* [#186](https://github.com/javers/javers/issues/186) 
  Fixed another concurrency issue in CommitSequenceGenerator.

### 1.3.2
released on 2015-08-09 <br/>

* [#186](https://github.com/javers/javers/issues/186) fixed concurrency issue in CommitSequenceGenerator

### 1.3.1
released on 2015-08-03 <br/>

* [#182](https://github.com/javers/javers/issues/182) fixed ConcurrentModificationException in TypeMapper

### 1.3.0
released on 2015-07-17 <br/>

* [#100](https://github.com/javers/javers/issues/100) MS SQL support in JaversSQLRepository
* Oracle support in JaversSQLRepository

### 1.2.11
released on 2015-06-30<br/>

* Added `On Access Hook`
* [#172](https://github.com/javers/javers/issues/91) Hibernate support enabled using `On Access Hook` feature

### 1.2.10
released on 2015-06-12<br/>

* [#172](https://github.com/javers/javers/issues/172) Fixed bug when registering more than one CustomPropertyComparator 
* [#167](https://github.com/javers/javers/issues/167) Fixed bug in Levenshtein algorithm (comparing lists of Entities)

### 1.2.9
released on 2015-06-10<br/>

* Pretty-print feature: `javers.getTypeMapping(Clazz.class).prettyPrint()` describes given user's class in the context of JaVers domain model mapping. 

### 1.2.8
released on 2015-05-31<br/>

* [#142](https://github.com/javers/javers/issues/142)
  Fixed bug when mapping Entity hierarchies with custom idProperty. 

### 1.2.7
released on 2015-05-29<br/>

* Fixed problem with build 1.2.6, which wasn't built from the master branch

### 1.2.6
released on 2015-05-26<br/>

* [#157](https://github.com/javers/javers/issues/157)
  Fixed JsonIOExcpetion when trying to deserialize property with nested generic type.
  Contributed  by [Dieler](https://github.com/Dieler).

### 1.2.5
released on 2015-05-24<br/>

* [#146](https://github.com/javers/javers/issues/146)
  [#156](https://github.com/javers/javers/issues/156)
  MongoDB Java Driver updated to 3.0. Thanks to that, JaVers is compatible with MongoDB versions: 2.4, 2.6 and 3.0.

### 1.2.1
released on 2015-05-18<br/>

* [#127](https://github.com/javers/javers/issues/127) 
  Implemented tolerant comparing strategy for ValueObjects when one has more properties than another.
  For example, now you can compare `Bicycle` with `Mountenbike extends Bicycle`.
 
### 1.2.0 JQL
released on 2015-04-20<br/>

* [#36](https://github.com/javers/javers/issues/36) Javers Query Language.
  New fluent API for querying JaversRepository.
  New query types: by class, by property and more, See [JQL examples](/documentation/jql-examples/).
* [#98](https://github.com/javers/javers/issues/98) Track changes in collection. Tracking VO changes while looking at master Entity.
* [#118](https://github.com/javers/javers/issues/118) API to get change history for a given property.
* [#128](https://github.com/javers/javers/issues/128) Changes of a set of entities.
* [#129](https://github.com/javers/javers/issues/129) Lists: newObject and ValueChange?

### 1.1.1
released on 2015-03-17<br/>

* [#97](https://github.com/javers/javers/issues/97) Levenshtein distance algorithm for smart list compare.
  Contributed by [Kornel Kiełczewski](https://github.com/Kornel).

### 1.1.0
released on 2015-03-13<br/>

* [#67](https://github.com/javers/javers/issues/67) JaversSQLRepository with support for MySQL, PostgreSQL and H2.
* [#89](https://github.com/javers/javers/issues/89) Spring JPA Transaction Manager integration for Hibernate.

### 1.0.7
released on 2015-02-25

* [#47](https://github.com/javers/javers/issues/47)
  Spring integration. Added `@JaversAuditable` aspect for auto-committing
  changed done in Repositories. <br/>
  [gessnerfl](https://github.com/gessnerfl) contributed `@JaversSpringDataAuditable`,
  which gives a support for Spring Data Repositories.

### 1.0.6
released on 2015-02-10

* [#94](https://github.com/javers/javers/issues/94)
  Specifying ignored properties without annotations.
  <br/>Reported by [Chuck May](https://github.com/ctmay4).

### 1.0.5
released on 2015-02-01

* [#76](https://github.com/javers/javers/issues/76)
  AddedSupport for nested generic types like `List<List<String>>` or `List<ThreadLocal<String>>`.
  Reported by [Chuck May](https://github.com/ctmay4)
* Fixed NPE in MongoRepository.

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
  <br/>Reported by [Bryan Hunt](https://github.com/binarytemple).

* [#71](https://github.com/javers/javers/issues/71)
  Tracking a top-level object deletion.
  <br/>Reported by [Chuck May](https://github.com/ctmay4).

### 1.0.2
released on 2015-01-08

* [#78](https://github.com/javers/javers/issues/78)
  NullPointerException at ReflectionUtil.getAllFields() when using interface as a variable type.

### 1.0.1
released on 2015-01-03

* [#73](https://github.com/javers/javers/issues/73) Listing newObject event on change history.
  <br/>Reported by [Chuck May](https://github.com/ctmay4).


### 1.0.0
released on 2014-12-25

* Production-ready release with stable API.