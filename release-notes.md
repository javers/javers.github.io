---
layout: page
title: Release notes
category: Documentation
submenu: release-notes
---

### 5.2.4 
released on 2019-02-26

* [788](https://github.com/javers/javers/issues/788) 
  Added experimental support for [Amazon DocumentDB](https://aws.amazon.com/documentdb/), 
  a document database compatible with MongoDB.   
  If you are using our [MongoDB Starter](/documentation/spring-boot-integration/), enable 
  DocumentDB flavour in your `application.yml`:
  
```yml
javers:
  documentDbCompatibilityEnabled: true
``` 

### 5.2.2 
released on 2019-02-23

* [789](https://github.com/javers/javers/issues/789) Fixed "error calling Constructor for CustomType"
  when CustomPropertyComparator is registered for Value's parent class.

### 5.2.0 
released on 2019-02-16

* [751](https://github.com/javers/javers/issues/751) New aspect annotation `@JaversAuditableDelete`
  for triggering `commitShallowDelete()` with each method argument. 

* [784](https://github.com/javers/javers/pull/784) Fixed bug in handling `SortedSet`.

* [753](https://github.com/javers/javers/issues/753)
  Fixed `MANAGED_CLASS_MAPPING_ERROR` after refactoring Entity type to Value type.

* [769](https://github.com/javers/javers/issues/769) Fixed NPE in `CustomBigDecimalComparator`.

* [782](https://github.com/javers/javers/issues/782) Fixes NPE after upgrading Javers to 5.1.
  NPE was thrown when committing entities created prior to 5.1.
   
### 5.1.3 
released on 2019-01-25

* [777](https://github.com/javers/javers/pull/777) Fixed bug
  in persisting `commitDateInstant` on modern JVM's where `Instant` has microseconds precision.
  Removed dependency on `javax.annotation.PostConstruct` annotation, which is not available
  on OpenJDK. 

### 5.1.2
released on 2019-01-07

* [765](https://github.com/javers/javers/issues/765) Fixed bug in persisting 
  `commitDateInstant` in SQL database.
  
### 5.1.0
released on 2018-12-30

* [743](https://github.com/javers/javers/issues/743) `commitDateInstant` added to `CommitMetadata`:

```java
/**
 * Commit creation timestamp in UTC.
 * <br/><br/>
 *
 * Since 5.1, commitDateInstant is persisted in JaversRepository
 * to provide reliable chronological ordering, especially when {@link CommitIdGenerator#RANDOM}
 * is used.
 *
 * <br/><br/>
 *
 * Commits persisted by JaVers older then 5.1
 * have commitDateInstant guessed from commitDate and current {@link TimeZone}
 *
 * @since 5.1
 */
public Instant getCommitDateInstant() {
    return commitMetadata.getCommitDateInstant();
}
```

* [761](https://github.com/javers/javers/issues/761) Fixed `DateTimeParseException`
 when deserializing Snapshots of a refactored class.

* [762](https://github.com/javers/javers/pull/762) Fixed Snapshots sorting in MongoRepository when
 `CommitIdGenerator.RANDOM` is used.
 
### 5.0.3
released on 2018-12-23

* [45](https://github.com/polyjdbc/polyjdbc/pull/45) Fixed bug in SQL `SchemaInspector` in `polyjdbc`
 when JaVers’ tables are created in public schema.  

* Added more descriptive message in `NOT_INSTANCE_OF` exception.

### 5.0.1
released on 2018-12-05

* Fixes for `CustomPropertyComparator` combined with `LEVENSHTEIN_DISTANCE` and `AS_SET` algorithms.

### <font color="red">5.0.0</font>
released on 2018-12-01

* JaVers’ Spring integration modules are upgraded to be fully compatible with 
  **Spring 5.1** and **Spring Boot 2.1**.<br/>
  
  If you are using Spring 5.x,
  it’s recommended to use JaVers 5.x. Otherwise you can fall into dependencies version conflict.<br/> 
  
  Current versions of dependencies:

```
springVersion            = 5.1.2.RELEASE
springBootVersion        = 2.1.0.RELEASE
springDataCommonsVersion = 2.1.2.RELEASE
springDataMongoVersion   = 2.1.2.RELEASE
springDataJPAVersion     = 2.1.2.RELEASE
springSecurityVersion    = 5.1.1.RELEASE
mongoDbDriverVersion     = 3.8.2
hibernateVersion         = 5.3.7.Final   
```

  Since now, the last JaVers version compatible with **Spring 4** is 3.14.0.   

* [747](https://github.com/javers/javers/issues/747)
  Two **breaking changes** in `CustomPropertyComparator`. Now, it has to 
  implement `boolean equals(a, b)` method, which is used by JaVers 
  to calculate collection-to-collection diff.
  Return type of `compare(...)` method is changed to `Optional`.
  See updated [examples and doc](/documentation/diff-configuration/#custom-comparators). 
              
```java
public interface CustomPropertyComparator<T, C extends PropertyChange> {
    /**
     * This comparator is called by JaVers to calculate property-to-property diff.
     */
    Optional<C> compare(T left, T right, GlobalId affectedId, Property property);

    /**
     * This comparator is called by JaVers to calculate collection-to-collection diff.
     */
    boolean equals(T a, T b);
}

```  

* [746](https://github.com/javers/javers/issues/746) 
  Added default comparator for raw `Collections`. Previously, raw `Collections` were ignored by JaVers,
  now, they are converted to Lists and then compared as Lists. 
  
* [738](https://github.com/javers/javers/pull/738)
  Added `DBRefUnproxyObjectAccessHook` to support lazy `@DBRef` from Spring Data MongoDB.
  The hook is registered automatically in `javers-spring-boot-starter-mongo`.

### 3.14.0
released on 2018-11-10 

* All SQL queries are rewritten using the new, faster JaVers SQL framework.
  Poly JDBC is no longer used for queries (but is still used to schema management).
  Thanks to that, **performance of JaVers commits with SQL repo is significantly better**,
  especially when committing large object graphs.
     
* Experimental support for DB2 and DB2400 is discontinued.

### 3.12.4
released on 2018-10-27 

* [690](https://github.com/javers/javers/issues/690) Fixed &mdash; missing property in *.yml to set SQL database schema name. 


### 3.12.3
released on 2018-10-25 

* [688](https://github.com/javers/javers/issues/688) Fixed &mdash; missing property in *.yml to set CommitIdGenerator. 

### 3.12.1
released on 2018-10-19 

* [724](https://github.com/javers/javers/issues/724) Fixed issue when deserializing Diff from JSON. 

### 3.12.0
released on 2018-10-19 

* [593](https://github.com/javers/javers/issues/593) Asynchronous commit:

```
CompletableFuture<Commit> commitAsync(String author, Object currentVersion, Executor executor);
```

### 3.11.7
released on 2018-10-11

* [723](https://github.com/javers/javers/issues/723)
Added possibility to load Snapshots even if user's class is removed. 
Prevents JaversException TYPE_NAME_NOT_FOUND.

### 3.11.6
released on 2018-09-29

* [712](https://github.com/javers/javers/issues/712) Fixed issue with
auto-audit aspect for JPA CRUD repositories for entities with Id generated 
by Hibernate (`@GeneratedValue`).

### 3.11.5
released on 2018-09-19

* [717](https://github.com/javers/javers/pull/717) Added index on `global_id` SQL table to speed up
queries by Value Object ID.  

### 3.11.4
released on 2018-08-27

* [705](https://github.com/javers/javers/issues/705) Dependency update. FastClasspathScanner updated to the latest ClassGraph. 

### 3.11.3
released on 2018-08-22
* Fixed JaversException PROPERTY_NOT_FOUND
  reported [here](https://stackoverflow.com/questions/51634751/javersexception-property-not-found-property-in-derived-class-not-found-in-abstr).
  
* Fixed bugs in Maps and Multimaps serialization.   

### 3.11.2
released on 2018-08-14
* [697](https://github.com/javers/javers/issues/697) Fixed issue with Numbers.

### 3.11.1
released on 2018-08-09
* [692](https://github.com/javers/javers/issues/692) Guava issue is finally fixed.

### 3.11.0
released on 2018-08-04

* [511](https://github.com/javers/javers/pull/511)
 Added handling of property type changes in domain classes.
 Now JaVers is able to load a Snapshot from JaversRepository,
 even if property types are different in a current domain class. 
  
* [692](https://github.com/javers/javers/issues/692)
 Fixed bug in javers-core dependencies. Guava is a truly optional dependency.   

### 3.10.2
released on 2018-07-10

* [687](https://github.com/javers/javers/pull/687)
  Additional advices for Spring Data Jpa Aspect.

### 3.10.1
released on 2018-07-07

* [682](https://github.com/javers/javers/issues/682) 
  Fixed JaVers bootstrap error &mdash;
  COMPONENT_NOT_FOUND: JaVers bootstrap error - component of type 'org.javers.core.CommitIdGenerator'

### 3.10.0
released on 2018-06-22

* **Stream API for Shadow queries** &mdash; `javers.findShadowsAndStream()`.
  Using `Stream.skip()` and `Stream.limit()` is the only correct way for paging Shadows
  (see [658](https://github.com/javers/javers/issues/658)).
  See the example in [ShadowStreamExample.java](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ShadowStreamExample.java).
  
```
Stream<Shadow<Employee>> shadows = javers.findShadowsAndStream(
        QueryBuilder.byInstanceId("Frodo", Employee.class).build());

//then
Employee employeeV5 = shadows.filter(shadow -> shadow.getCommitId().getMajorId() == 5)
       .map(shadow -> shadow.get())
       .findFirst().orElse(null);
```
  

* [650](https://github.com/javers/javers/issues/650)
  `@DiffIgnore` and `@DiffInclude` annotations can mixed now in one class.
  When `@DiffInclude` is used in a class, JaVers ignores `@DiffIgnore` or `@Transient` annotations in that class. 

### 3.9.7
released on 2018-05-17

* [677](https://github.com/javers/javers/issues/677) Added support for `saveAll(Iterable)` from Spring Data 2.x
  
### 3.9.6
released on 2018-05-11

* [676](https://github.com/javers/javers/issues/676) Fixed NPE when comparing
  List of Value Objects containing nulls. 
  
### 3.9.5
released on 2018-05-09

* [669](https://github.com/javers/javers/issues/669) Fixed issue with Value Objects stored in Lists and compared
  using AS_SET algorithm.

### 3.9.4
released on 2018-05-01

* [666](https://github.com/javers/javers/issues/666) Fixed compatibility with Java9 modulepath. 

### 3.9.3
released on 2018-04-26

* [664](https://github.com/javers/javers/issues/664) Fixed commidDate persistence in MySql. 
Column type is changed from `timestamp` to `timestamp(3)` &mdash; milliseconds precision. 

### 3.9.2
released on 2018-04-22

* [660](https://github.com/javers/javers/issues/660) Fixed bug in Shadow query runner.

### 3.9.1
released on 2018-04-19

* [657](https://github.com/javers/javers/issues/657)
  Fixed implementaton of `RANDOM` [CommitIdGenerator]({{ site.javadoc_url }}org/javers/core/CommitIdGenerator.html#RANDOM).
  You can use it in distributed applications:   
  
```java
Javers javers = javers().withCommitIdGenerator(CommitIdGenerator.RANDOM)
                        .build();
```

### 3.9.0
released on 2018-04-11

* New API for processing Changes, convenient for formatting a change log. 
Now you can group changes by commits and by objects. 
See [groupByCommit()]({{ site.javadoc_url }}org/javers/core/Changes.html#groupByCommit--).
For example:

```java
Changes changes = javers.findChanges(QueryBuilder.byClass(Employee.class)
        .withNewObjectChanges().build());
     
changes.groupByCommit().forEach(byCommit -> {
  System.out.println("commit " + byCommit.getCommit().getId());
  byCommit.groupByObject().forEach(byObject -> {
    System.out.println("  changes on " + byObject.getGlobalId().value() + " : ");
    byObject.get().forEach(change -> {
      System.out.println("  - " + change);
    });
  });
});
```

* Fixed bug in `queryForChanges()`, which could cause NPE in some corner cases.
Especially, for complex graphs with multiple levels of nested Value Objects.   

### 3.8.5
released on 2018-03-27

* [648](https://github.com/javers/javers/issues/648) Mongo driver upgrade to 3.6.3

```
springVersion=4.3.14.RELEASE
springBootVersion=1.5.10.RELEASE
springDataCommonsVersion=1.13.10.RELEASE
springDataJPAVersion=1.11.10.RELEASE
guavaVersion=23.0
gsonVersion=2.8.2
fastClasspathScannerVersion=2.18.1
jodaVersion=2.9.7
mongoDbDriverVersion=3.6.3
hibernateVersion=5.0.12.Final
polyjdbcVersion=0.7.2
aspectjweaverVersion=1.8.13
```

* Added support for customizing date formats in the Diff pretty print.
See [JaVers Core configuration](/documentation/spring-boot-integration/#javers-configuration-properties).

### 3.8.4
released on 2018-03-04

* [638](https://github.com/javers/javers/issues/638) Fixed NPE in EdgeBuilder.

### 3.8.3
released on 2018-03-02

* [645](https://github.com/javers/javers/issues/645)
Added support for Entity as an Id of another Entity.

### 3.8.2
released on 2018-02-28

* [640](https://github.com/javers/javers/issues/640)
 Added scanning of gettres declared in interfaces. See [this Spec](https://github.com/javers/javers/blob/master/javers-core/src/test/groovy/org/javers/core/cases/Case640InterfaceGettersInheritance.groovy).
 

### 3.8.1
released on 2018-02-25

* [542](https://github.com/javers/javers/issues/542) 
Added possibility to disable SQL schema auto creation. <br/>
The flag `withSchemaManagementEnabled()`
is added to `SqlRepositoryBuilder`. The flag is also available in the
[Spring Boot starter](/documentation/spring-boot-integration/#javers-configuration-properties) for SQL.

### 3.8.0
released on 2018-02-06

* [616](https://github.com/javers/javers/issues/616) New annotation &mdash; `@DiffInclude` &mdash;
 for properties whitelisting. See [property level annotations](/documentation/domain-configuration/#property-level-annotations).

### 3.7.9
released on 2018-01-14

* [558](https://github.com/javers/javers/issues/558) Performance improvement in
Hibernate unproxy hook. Now, ShallowReferences can be created without 
initializing Hibernate proxies.

### 3.7.8
released on 2018-01-05

* [Marvin Diaz](https://github.com/marvindaviddiaz) added 
 [support](https://github.com/javers/javers/pull/624/commits) for DB2 and DB2400 (beta).

* Fixed comparing of complex ID values in `ValueChangeAppender`. 
  Now their `equals()` is not used. 

### 3.7.7
released on 2017-12-20

* [596](https://github.com/javers/javers/issues/596)
  Fixed NullPointerException when commit property value is null (by Sergey Rozhnov).
  
* [519](https://github.com/javers/javers/issues/519) Added index on Entity typeName in MongoDB.

### 3.7.6
released on 2017-12-09

* [614](https://github.com/javers/javers/issues/614) Custom `toString` function.
[Ismael Gomes Costa](https://github.com/ismaelgomescosta)
contributed the method for registering `toString` function for complex `ValueTypes` used as Entity Id.
See [registerValueWithCustomToString]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueWithCustomToString-java.lang.Class-java.util.function.Function-) javadoc. 

### 3.7.5
released on 2017-12-01

* **Shadow queries performance optimization**. Less DB queries executed for 
each **Deep+** query.

* Changes in Shadow Scopes. Now, JaVers always loads child ValueObjects owned by selected Entities.
So there is no need to call `QueryBuilder.withChildValueObjects()`.
See [ShadowScope]({{ site.javadoc_url }}index.html?org/javers/repository/jql/ShadowScope.html) javadoc

* Shadow queries execution statistics logger. Enable it: 

```
    <logger name="org.javers.JQL" level="DEBUG"/>
```      

and you will get detailed logs from query execution, for example: 

```text
DEBUG org.javers.JQL - SHALLOW query: 1 snapshots loaded (entities: 1, valueObjects: 0)
DEBUG org.javers.JQL - DEEP_PLUS query for '...SnapshotEntity/2' at commitId 3.0, 1 snapshot(s) loaded, gaps filled so far: 1
DEBUG org.javers.JQL - warning: object '...SnapshotEntity/3' is outside of the DEEP_PLUS+1 scope, references to this object will be nulled. Increase maxGapsToFill and fill all gaps in your object graph.
DEBUG org.javers.JQL - queryForShadows executed:
JqlQuery {
  IdFilter{ globalId: ...SnapshotEntity/1 }
  QueryParams{ aggregate: true, limit: 100 }
  ShadowScopeDefinition{ shadowScope: DEEP_PLUS, maxGapsToFill: 1 }
  Stats{
    executed in millis: 12
    DB queries: 2
    all snapshots: 2
    SHALLOW snapshots: 1
    DEEP_PLUS snapshots: 1
    gaps filled: 1
    gaps left!: 1
  }
}
```

Statistics are also available in `Stats` object that you can get from
an executed query:
 
```java
Stats stats = jqlQuery.stats();
```

### 3.7.0
released on 2017-11-24

* [605](https://github.com/javers/javers/issues/605) Compare Lists as Sets.
  New List comparing algorithm contributed by [drakin](https://github.com/drakin).
  See [List comparing algorithms](/documentation/diff-configuration/#list-algorithms)

* [601](https://github.com/javers/javers/issues/601)
  Fixed bug in the type mapping algorithm. In this case, an Entity with complex inheritance structure
  was mapped as Value.  

### 3.6.3
released on 2017-11-13

* Changes in Shadow Scopes. **Commit-deep+** is renamed to **Deep+**. 
  See [ShadowScope]({{ site.javadoc_url }}index.html?org/javers/repository/jql/ShadowScope.html) javadoc.
  Now, deep+ scope doesn't include commit-deep scope. They are independent scopes.

* [597](https://github.com/javers/javers/issues/597)
  Second fix for MySQL error: Specified key was too long; max key length is 767 bytes.
    
### 3.6.2
released on 2017-11-01

* New [snapshotType]({{ site.javadoc_url }}org/javers/repository/jql/QueryBuilder.html#withSnapshotType-org.javers.core.metamodel.object.SnapshotType-)
  filter in JQL. Allows selecting snapshots by type: `INITIAL`, `UPDATE`, `TERMINAL`.

* Improved exception handling in `byInstance` query.

### 3.6.1
released on 2017-10-29

* Fix for ValueObject loading in Shadow queries.
See [updated docs of Shadow scopes](/documentation/jql-examples/#shadow-scopes). 

### 3.6.0
released on 2017-10-05

* [431](https://github.com/javers/javers/issues/431)
 Auto-audit aspect also on [JpaRepository.saveAndFlush()](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/JpaRepository.html).
 
<span style="color:red">This task forced a major refactoring</span>.

`Javers-spring` module was split into two parts:
 
* `javers-spring` with general purpose auto-audit aspect and
  auto-audit aspect for Spring Data CrudRepository.
* `javers-spring-jpa` &mdash; a superset of `javers-spring` &mdash; with
   JPA & Hibernate integration, so:
   auto-audit aspect for Spring Data JpaRepository,
   HibernateUnproxyObjectAccessHook, JpaHibernateConnectionProvider,
   and JaversTransactionalDecorator.
   
If you are using <span style="color:red">JaVers with MongoDB</span>, you don't need to change anything.

If you are using <span style="color:red">JaVers with SQL</span> but without Spring Boot,
you need to change the `javers-spring` dependency to `javers-spring-jpa`.
If you are using Spring Boot with our starter (`javers-spring-boot-starter-sql`), 
you don't need to change anything. Our starters always provide the right configuration. 

### 3.5.2
released on 2017-10-05 <br/>

* [574](https://github.com/javers/javers/issues/574)
 Added missing support for `@PropertyName` in Shadows.

### 3.5.1
released on 2017-09-24 <br/>

* Dependencies versions update:

```
springVersion=4.3.11.RELEASE
springBootVersion=1.5.7.RELEASE
guavaVersion=23.0
gsonVersion=2.8.1
fastClasspathScannerVersion=2.4.7
jodaVersion=2.9.7
mongoDbDriverVersion=3.5.0
hibernateVersion=5.0.12.Final
polyjdbcVersion=0.7.1
aspectjweaverVersion=1.8.6
```

### 3.5.0
released on 2017-07-30 <br/>

* [568](https://github.com/javers/javers/issues/568)
 Added the new scope for Shadow queries &mdash; <b>commit-depth+</b>.
 In this scope, JaVers tries to restore an original object graph
 with (possibly) all object references resolved.
 See [Shadow Scopes](/documentation/jql-examples/#shadow-scopes).

### 3.3.5
released on 2017-07-14 <br/>
                       
* [565](https://github.com/javers/javers/issues/565)
 Fixed error when executing query byInstance with HibernateUnproxyObjectAccessHook. 

### 3.3.4
released on 2017-07-04 <br/>
                       
* [560](https://github.com/javers/javers/issues/560)
 Fixed NPE when getting empty list of Shadows.

### 3.3.3
released on 2017-06-29 <br/>
                       
* [548](https://github.com/javers/javers/issues/548)
 Added support for classes generated by Google [@AutoValue](https://github.com/google/auto/tree/master/value).

### 3.3.2
released on 2017-06-25 <br/>
                       
* [546](https://github.com/javers/javers/issues/546)
 Arrays on Value position are now compared using `Arrays.equals()`.

### 3.3.1
released on 2017-06-25 <br/>
                       
* [497](https://github.com/javers/javers/issues/497)
 Fix in PolyJDBC for MsSql, deprecated `TEXT` column type changed to `VARCHAR(MAX)` 

### 3.3.0
released on 2017-06-21 at Devoxx PL, Cracow <br/>

* Added possibility to register
 the [CustomValueComparator]({{ site.javadoc_url }}org/javers/core/diff/custom/CustomValueComparator.html)
 function for comparing ValueTypes
 (it works also for Values stored in Lists, Arrays and Maps).
 Solved issues: [492](https://github.com/javers/javers/issues/492),
                [531](https://github.com/javers/javers/issues/531).
 
 For example, BigDecimals are (by default) ValueTypes
 compared using `BigDecimal.equals()`.
 Now, you can compare them in the smarter way, ignoring trailing zeros:
 
```java 
 javersBuilder.registerValue(BigDecimal.class, (a,b) -> a.compareTo(b) == 0);
```

### 3.2.1
released on 2017-06-12 <br/>

* [32](https://github.com/polyjdbc/polyjdbc/pull/32)
  Fix in PolyJDBC for MySql INSERTS with autoincrement.

### <font color="red">3.2.0</font>
released on 2017-05-26 <br/>

* [133](https://github.com/javers/javers/issues/133) New JQL queries &mdash; **Shadows**. 
  See [Shadow query examples](/documentation/jql-examples#query-for-shadows). 

* [455](https://github.com/javers/javers/issues/455)
 Fixed error in schema creation on MySQL database with non UTF-8 encoding &mdash;
 MySQL error: Specified key was too long; max key length is 767 bytes 

### 3.1.1
released on 2017-05-07 <br/>

* [532](https://github.com/javers/javers/issues/532)
 Added the method to clear sequence allocation in PolyJDBC.
 See JaversSqlRepository<wbr/>evictSequenceAllocationCache().
 
* [539](https://github.com/javers/javers/issues/539)
 Added annotation priorities.
 Now, Javers' annotations have priority over JPA annotations. 

### 3.1.0
released on 2017-03-27 <br/>

* [403](https://github.com/javers/javers/issues/403)
 Added `@PropertyName` annotation.
 Now, property names can be customized which means easier domain classes refactoring.

* [27](https://github.com/polyjdbc/polyjdbc/issues/27)
 Fixed resource leak in PolyJDBC.

### 3.0.5
released on 2017-03-24 <br/>

* [524](https://github.com/javers/javers/pull/524)
 Fixed version conflict between Hibernate and Spring Boot. Hibernate version downgraded 
 to 5.0.11.Final

### 3.0.4
released on 2017-03-14 <br/>

* [505](https://github.com/javers/javers/issues/505)
 Empty commits (with zero snapshots) are no longer persisted.
 
### 3.0.3
released on 2017-03-05 <br/>

* [507](https://github.com/javers/javers/issues/507)
 BigInteger added to the list of well known Value types.

### 3.0.2
released on 2017-03-02 <br/>

* [501](https://github.com/javers/javers/issues/501)
 Fixed exception (Don't know how to extract Class from type)
 for complex class hierarchies with generic type variables.
 
* [499](https://github.com/javers/javers/issues/499) 
 Fixed problem with hash collision for some method names. 

### <font color="red">3.0.0 &mdash; Java 8 release</font>
released on 2017-02-01 <br/>

**We rewrote whole JaVers' code base from Java 7 to 8.**<br/>
  Now, JaVers is lighter, faster, and more friendly for Java 8 users.  
  
**Breaking changes**
  
* All javers-core classes like:
 `Change`, `Commit`, or `CdoSnapshot` now use 
 standard Java 8 types `java.util.Optional` and `java.time.LocalDateTime`.
 
* The old good Joda Time is no longer used in javers-core but still supported in users’ objects.

* JaVers’ `Optional` is removed.
  
* All `@Deprecated` methods in public API are removed.  
  
* **Since 3.0, JaVers is not runnable on Java 7 Runtime.**
  If you still use Java 7, stay with {{site.javers_java7_version}} version,
  which will be maintained for a while, but only for bug fixing.  

Misc 

* All JaVers’ dependencies are bumped to the latest versions:
  
```
gson :                   2.8.0
mongo-java-driver :      3.4.2
picocontainer :          2.15
fast-classpath-scanner : 2.0.13
spring :                 4.3.6.RELEASE
spring-boot :            1.4.4.RELEASE
hibernate :              5.2.7.Final
joda :                   2.9.7 (optional)
guava :                  21.0  (optional)

```  

* SQL Repository schema migration scripts for JaVers 1.x are removed.
  Upgrade from JaVers 1.x to 3.0 is still possible,
  but first run 2.9.x to perform overdue SQL Repository schema migration.

### 3.0.0-RC
released on 2017-01-28 <br/>

### 2.9.2 &mdash; the last version runnable on Java 7 Runtime
released on 2017-01-25 <br/>

* [494](https://github.com/javers/javers/issues/494)
 Fixed bug in MongoRepository introduced in 2.9.1 (IllegalArgumentException for Boolean JsonPrimitive).

### 2.9.1
released on 2017-01-17 <br/>

* [489](https://github.com/javers/javers/issues/489)
 MongoRepository performance optimization.

### 2.9.0
released on 2017-01-14 <br/>

* [#132](https://github.com/javers/javers/issues/132)
 Implemented support for Guava's Multiset and Multimap.

### 2.8.2
released on 2017-01-03 <br/>

* [#485](https://github.com/javers/javers/pull/485)
 Fixed MySQLSyntaxErrorException: Specified key was too long; max key length is 767 bytes
 when creating indexes on MySQL. 

### 2.8.1
released on 2016-12-13 <br/>

* [#475](https://github.com/javers/javers/issues/475)
 Fixed concurrency issue in SQL sequence generator resulting in
 SequenceLimitReachedException: [SEQUENCE_LIMIT_REACHED]

### 2.8.0
released on 2016-12-09 <br/>

* [#476](https://github.com/javers/javers/issues/476)
  Added support in `javers-spring` for multiple Spring Transaction Managers. <br/>
  Since now, `transactionManager` bean should be explicitly provided 
  when configuring `javers` bean:
  
```java
    @Bean
    public Javers javers(PlatformTransactionManager txManager) {
        JaversSqlRepository sqlRepository = SqlRepositoryBuilder
                .sqlRepository()
                .withConnectionProvider(jpaConnectionProvider())
                .withDialect(DialectName.H2)
                .build();

        return TransactionalJaversBuilder
                .javers()
                .withTxManager(txManager)
                .withObjectAccessHook(new HibernateUnproxyObjectAccessHook())
                .registerJaversRepository(sqlRepository)
                .build();
    }
```

  See full example of [Spring configuration](/documentation/spring-integration#spring-jpa-example).
  

* [#461](https://github.com/javers/javers/issues/461)
  Fix for `CANT_DELETE_OBJECT_NOT_FOUND` excepting throw from 
  `@JaversSpringDataAuditable` aspect when deleted object not exists in JaversRepository. 

### 2.7.2
released on 2016-11-29 <br/>

* [#467](https://github.com/javers/javers/issues/467)
  Fixed bug in GlobalId PK cache in SQl Repository.
  Now, when Spring Transaction Manager rolls back a transaction, 
  the cache is automatically evicted.

* [#462](https://github.com/javers/javers/issues/462)
  Fixed problem with commit property column size in SQL databases. Max length increased from 200 to 600
  characters.

### 2.7.1
released on 2016-11-17 <br/>

* [#457](https://github.com/javers/javers/issues/457)
  Fixed problem with Bean Mapping Style due to Type Erasure.  

### 2.7.0
released on 2016-11-10 <br/>

* [#452](https://github.com/javers/javers/pull/452)
 New `@IgnoreDeclaredProperties` annotation, 
 see [class annotations](/documentation/domain-configuration#class-level-annotations).
 
### 2.6.0
released on 2016-10-30 <br/>

* [#411](https://github.com/javers/javers/issues/411)
 New commitId generator for distributed applications.
 Now you can use cluster-friendly `CommitIdGenerator#RANDOM`,
 see [`withCommitIdGenerator()`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#withCommitIdGenerator-org.javers.core.CommitIdGenerator-)
 
* [#209](https://github.com/javers/javers/issues/209) 
 Added multi-class query &mdash; `QueryBuilder.byClass(Class... requiredClasses)`.
       
* [#435](https://github.com/javers/javers/issues/435)
 Added flags for deactivating auto-audit aspects
 in Spring Boot starters.
       
```
javers:
  auditableAspectEnabled: false
  springDataAuditableRepositoryAspectEnabled: false
```

### 2.5.0
released on 2016-10-26 <br/>

* [#412](https://github.com/javers/javers/issues/412)
  `@ShallowReference` annotation can now be used for properties.

* Empty snapshots for `@ShallowReference` Entities are no longer created.

* [#443](https://github.com/javers/javers/pull/443)
  Fix for Gson stackoverflow exception when using complex Value types (with circular references).

### 2.4.1
released on 2016-10-18 <br/>

* [#441](https://github.com/javers/javers/issues/441) UUID added to list of well known ValueTypes.

### 2.4.0
released on 2016-10-12 <br/>

* [#398](https://github.com/javers/javers/pull/398)
 [Ian Agius](https://github.com/ianagius) contributed a schema support for SQL databases.

### 2.3.0
released on 2016-09-21 <br/>

* [#263](https://github.com/javers/javers/issues/263) 
 `@TypeName` annotation scanner implemented.
  Now you can easily register your classes with the `@TypeName` annotation
  in order to use them in all kinds of JQL queries<br/>
  (without getting TYPE_NAME_NOT_FOUND exception). See
  `JaversBuilder.withPackagesToScan(String packagesToScan)`.

### 2.2.2
released on 2016-09-09 <br/>

* [#430](https://github.com/javers/javers/pull/430)
 Added `@ConditionalOnMissingBean` on javers bean.

### 2.2.1
released on 2016-09-06 <br/>

* [#417](https://github.com/javers/javers/issues/417)
  Fixed dependency management in `javers-spring`.
  Now `spring-data-commons` dependency is optional
  and should be on an application's classpath only when you are using the `@JaversSpringDataAuditable` annotation.
  <br/>
  The aspect class `JaversAuditableRepositoryAspect` was removed and split into two aspects:
  `JaversAuditableAspect` and `JaversSpringDataAuditableRepositoryAspect`.
  <br/>
  First one should be enabled when you are using `@JaversAuditable`.
  Second one should be enabled when you are using `@JaversSpringDataAuditable`.
  <br/>
  If you are using `javers-spring-boot-starter-*`,
  both aspects are enabled by default so you don’t have to change anything.
  <br/>
  See [auto-audit aspects documentaton](/documentation/spring-integration#auto-audit-aspect).

* [#425](https://github.com/javers/javers/pull/425)
  Fixed some bugs in ShallowReference type handling.

### 2.1.2
released on 2016-08-28 <br/>

* [#416](https://github.com/javers/javers/issues/416)
Added map key dot replacement in MongoRepository.

* [#415](https://github.com/javers/javers/pull/415)
Key in `TypeMapperState.mappedTypes` changed from `Type` to `Type.toString()`.

### 2.1.1
released on 2016-07-30 <br/>

* [#395](https://github.com/javers/javers/issues/395)
Spring Boot version bumped to 1.4.0-RELEASE, fixed MongoDB Driver version conflict
between JaVers and spring-data-mongodb.

### 2.1.0
released on 2016-07-28 <br/>

* [#220](https://github.com/javers/javers/pull/220) New aggregate filter in JQL.
Now child ValueObjects can be selected when querying for Entity changes.
See [childValueObjects filter example](/documentation/jql-examples#child-value-objects-filter).

* [#408](https://github.com/javers/javers/pull/408)
Added equals() and hashCode() in ContainerElementChange and EntryChange classes.

### 2.0.4
released on 2016-07-23 <br/>

* [#407](https://github.com/javers/javers/pull/407)
Fixed bug that causes PropertyChange.equals() to always return false.

* [#394](https://github.com/javers/javers/issues/394)
Error message enhancement.

### 2.0.3
released on 2016-06-29 <br/>

* [#396](https://github.com/javers/javers/issues/396)
Fixed javers-spring integration problem:
cannot access its superclass org.javers.spring.jpa.<wbr/>JaversTransactionalDecorator.

### 2.0.2
released on 2016-06-17 <br/>

* [#388](https://github.com/javers/javers/issues/388) Fixed ORA-00972 when creating the JaVers schema in Oracle 12c


### 2.0.1
released on 2016-06-15 <br/>

* [#384](https://github.com/javers/javers/issues/384) Value-based equals() and hashCode() implemented in concrete Change types
* [#380](https://github.com/javers/javers/issues/380) Fixed CLASS_EXTRACTION_ERROR for non-concrete array types (like T[])


### <font color="red">2.0.0</font>
released on 2016-06-09 <br/>

JaVers 2.0 comes with major improvements and new features in JQL.

**Unified semantics of changes and snapshot queries** <br/>
In JaVers 2.0, change queries work in the same way as snapshot queries
and change queries accept all filters.

For example, in JaVers 1.x, this change query:

```
javers.findChanges(QueryBuilder.byInstanceId(Person.class,1).withVersion(5).build());
```

returns empty list, which is not very useful.

In JaVers 2.0 this query returns changes introduced by the selected snapshot,
so changes between versions 4 and 5 of a given object.

JaVers implements change queries on the top of snapshot queries.
Change sets are recalculated as a difference between subsequent pairs of snapshots fetched from
a JaversRepository.
In 1.x, only explicitly selected snapshots are involved in the recalculation algorithm.
In 2.0, for each snapshot selected by a user query, JaVers implicitly fetches *previous* snapshot (if needed).
Thanks to that, change queries are far more useful and they work as you could expect.

**New features**<br/>

* New query for any domain object.
See [any domain object query example](/documentation/jql-examples#any-domain-object-query).

* [#334](https://github.com/javers/javers/issues/334)
New JQL `author()` filter.
See [author filter example](/documentation/jql-examples#author-filter).

* [#305](https://github.com/javers/javers/issues/305)
New JQL `commitProperty()` filter.
See [commit property filter example](/documentation/jql-examples#commit-property-filter).

* [#375](https://github.com/javers/javers/issues/375) Added support for commit properties in auto-audit aspect.
See [CommitPropertiesProvider](/documentation/spring-integration#commit-properties-provider-bean).

**SQL Schema migration**<br/>

JaVers 2.0 comes with the new database schema for SQL repository:

* table `jv_cdo_class` is no longer used
* new column `jv_global_id.type_name`
* new column `jv_snapshot.managed_name`
* new table `jv_commit_property`

JaVers automatically launches a data migration script when old schema is detected.
Data from `jv_cdo_class` are copied to new columns (`jv_global_id.type_name` and `jv_snapshot.managed_name`).
It should take a few seconds for medium size tables but for very large tables it could be time consuming.

**Breaking changes**<br/>
The only one breaking change is new semantics of changes query which is actually an improvement.

If you are using SQL repository, and your `jv_snapshot` table is large (millions of records),
run JaVers 2.0 on your test environment for the first time and check if data migrations is done correctly.

### 1.6.7
released on 2016-05-06 <br/>

* [#368](https://github.com/javers/javers/pull/368)
Improvements in Spring Boot starters. `SpringSecurityAuthorProvider` bean
is created by default when SpringSecurity is detected on classpath.

### 1.6.4
released on 2016-04-26 <br/>

* [#362](https://github.com/javers/javers/issues/362)
Default behaviour for non-parametrized Collections instead of throwing
JaversException: GENERIC_TYPE_NOT_PARAMETRIZED.

### 1.6.3
released on 2016-04-17 <br/>

* [#361](https://github.com/javers/javers/issues/361)
Fixed bug in schema migration for MsSql Server.

### 1.6.2
released on 2016-04-13 <br/>

* [#355](https://github.com/javers/javers/issues/355)
Fixed exception handling in JaversAuditableRepositoryAspect.

* [#216](https://github.com/javers/javers/issues/216)
JQL - added basic support for nested ValuObjects queries.

### 1.6.1
released on 2016-04-12 <br/>

* [#353](https://github.com/javers/javers/issues/353)
Fixed misleading error message for raw Collections fields.

* [#18](https://github.com/polyjdbc/polyjdbc/pull/18)
Fixed resource leak in PolyJDBC, resulting in ORA-01000: maximum open cursors exceeded (Oracle).

### 1.6.0
released on 2016-03-16 <br/>

* [#191](https://github.com/javers/javers/issues/191)
Added support for sets of ValueObjects, SET_OF_VO_DIFF_NOT_IMPLEMENTED exception should
not appear anymore.

### 1.5.1
released on 2016-03-04 <br/>

* [#344](https://github.com/javers/javers/issues/344)
Fixed bug in Spring Boot starter for SQL. Dialect autodetection now works properly.

### 1.5.0
released on 2016-02-28 <br/>

* New JaVers Spring Boot starter for SQL and Spring Data
  &mdash; `javers-spring-boot-starter-sql`.
  See [Spring Boot integration](/documentation/spring-boot-integration).

* Starting from this version we use [SemVer](http://semver.org/) scheme for JaVers version numbers.

### 1.4.12
released on 2016-02-25 <br/>

* [#341](https://github.com/javers/javers/issues/341)
Fixed bug TyeMapper &mdash; infinite loop for certain Type cycles in user classes.

### 1.4.11
released on 2016-02-12 <br/>

* [#333](https://github.com/javers/javers/issues/333)
GroovyObjects support. Now JaVers can be used in Groovy applications.
See [Groovy diff example](/documentation/diff-examples#groovy-diff-example).

* `@DiffIgnore` can be used on class level
(for example, GroovyObjects support is implemented by
ignoring all properties with `groovy.lang.MetaClass` type).
See [class annotations](/documentation/domain-configuration#class-level-annotations).

* [#211](https://github.com/javers/javers/issues/211)
New annotation `@ShallowReference` added.
It can be used as the less radical alternative to `@DiffIgnore`.
See [ignoring things](/documentation/domain-configuration#ignoring-things).

### 1.4.10
released on 2016-02-02 <br/>

* [#325](https://github.com/javers/javers/issues/325)
Fixed bug in persisting commitDate in SQL repository.

* [#249](https://github.com/javers/javers/issues/249)
Fixed bug in JSON deserialization of Id property with Type tokens.

* [#192](https://github.com/javers/javers/issues/192)
Added support for well-known Java util types: `UUID`, `File` and `Currency`.

* [#16](https://github.com/polyjdbc/polyjdbc/issues/16)
Fixed bug in PolyJDBC sequence generating algorithm.

### 1.4.7
released on 2016-01-29 <br/>

* [#322](https://github.com/javers/javers/issues/322)
New JQL `withVersion()` filter for snapshot queries.
See [Snapshot version filter example](/documentation/jql-examples#version-filter).


### 1.4.5
released on 2016-01-25 <br/>

* [#309](https://github.com/javers/javers/issues/309)
New JQL `withCommitId()` filter for snapshot queries.
See [CommitId filter example](/documentation/jql-examples#commit-id-filter).

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
See [Skip filter example](/documentation/jql-examples#skip-filter).

### 1.4.2
released on 2016-01-15 <br/>

* [#243](https://github.com/javers/javers/issues/243) New JQL filters by createDate `from()` and `to()`.
  See [CommitDate filter example](/documentation/jql-examples#commit-date-filter).

### 1.4.1
released on 2016-01-08 <br/>

* New JaVers module &mdash; `javers-spring-boot-starter-mongo`.
  See [Spring Boot integration](/documentation/spring-boot-integration).

### 1.4.0
released on 2015-12-18 <br/>

* Added @TypeName annotation and support for domain classes refactoring,
  see
  [Entity refactoring](/documentation/jql-examples#entity-refactoring) example.
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
  See [compare top-level collections](/documentation/diff-examples#compare-collections) example.

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
 java.lang.ClassCastException: com.example.MyObject cannot be cast to org.javers.core.metamodel.object.<wbr/>GlobalId

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
 Added JSON prettyPrint switch &mdash; `JaversBuilder.withPrettyPrint()`
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
  New query types: by class, by property and more, See [JQL examples](/documentation/jql-examples).
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