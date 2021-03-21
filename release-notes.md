---
layout: page
title: Release notes
category: Documentation
submenu: release-notes
---

### <font color="red">6.0.0-RC1</font>
released on 2021-03-21

**Javers 6.0 comes with the important improvements in the diff algorithm:**

We have redesigned the Javers' core algorithm &mdash; the object diff.
Now, it gives better, more meaningful, and consistent results in
both `Javers.compare()` and `Javers.findChanges()`.

The new approach improves the diff results for New and Removed Objects
thanks to the explicitly modeled and unified concepts of **Initial** and **Terminal** Changes.

Now, Javers generates additional set of **Initial Changes** for each
property of a New Object to capture its state.
Internally, Javers calculates Initial Changes by comparing a virtual, totally empty object
with a real New Object.

Symmetrically, additional set of **Terminal Changes** is generated
for each property of a Removed Object.

For example, consider the diff of two Entities:

```groovy
def diff = javers.compare(new Employee(id: "1", address: null),
                          new Employee(id: "1", address: new Address(street: "x", city:"Paris")))

println diff.prettyPrint()
```

**Javers 5.x** calculates this (which is not very useful):

```
Diff:
* new object: org.javers.core.Sample$Employee/1#address
* changes on org.javers.core.Sample$Employee/1 :
  - 'address' reference changed from '' to '...Sample$Employee/1#address'
```

**Javers 6.x** calculates the essentially better diff:
```
Diff:
* changes on org.javers.core.NewObjectChangesE2ETest$Employee/1 :
  - 'address.city' = 'Paris'
  - 'address.street' = 'x'
```

So, in Javers 6.0, Value Objects (like `Address`) are treated more like containers for nested properties
owned by Entities and less like objects with their own indentity and type.

Calculating Initial and Terminal Changes is enabled by default.
You can disable it using `JaversBuilder.withTerminalChanges()`
and `JaversBuilder.withInitialChanges()`,

or in `application.yml`, if you are using Javers Spring Boot:

 <pre>
 javers:
   initialChanges: false
   terminalChanges: false
 </pre>

See the [Initial Changes example](/documentation/jql-examples/#initial-changes-filter).<br/>
See `JaversBuilder.withInitialChanges()` javadoc.

**Other features and improvements added in Javers 6.0**

* [822](https://github.com/javers/javers/issues/822)
  Fixed **problem with paging** in Shadow queries.
  <br/>
  Now, `QueryBuilder.skip()` and `QueryBuilder,limit()` works intuitively in `Javers.findShadows()`
  and `Javers.findShadowsAndStream()`.
  <br/>Both querying methods are unified and generate the same results
  (now, `findShadows()` is only the facade for `findShadowsAndStream()`).

See `QueryBuilder.limit()` javadoc.<br/>
See //TODO doc limit() LINK

* More pretty and concise `Changes.prettyPrint()`, see //TODO doc LINK

* The new `Changes.devPrint()` method for printing Changes in a technical style.

* New or removed Value Objects no longer generate
  `NewObject`, `ObjectRemoved`, nor `ReferenceChange`.
  These changes were considered rather useless.
  Instead, a state of a new or removed Value Object
  is captured by Initial and Terminal Changes.

* New or removed Entities always generate `NewObject`/`ObjectRemoved` changes (it can't be disabled).

* The `javers.newObjectSnapshot` flag is renamed to `javers.initialChanges` and it's enabled by default.

* The `javers.terminalChanges` flag is added, and it's enabled by default.

* In `Javers.findChanges()`, a `NewObject` change is always generated for each initial Snapshot,
  it can't be disabled by the `javers.initialChanges` flag.

* The `QueryBuilder.withNewObjectChanges()` method is deprecated and has no effect.

* [911](https://github.com/javers/javers/issues/911) Minor bug fixed, this WARNING
  is no longer shown: An illegal reflective access operation has occurred.

### 5.15.0
released on 2021-03-12

* [939](https://github.com/javers/javers/issues/939) Added possibility to register
  Custom JSON TypeAdapters in Spring Boot Starters.
  See [Registering JSON TypeAdapters](https://javers.org/documentation/spring-boot-integration/#registering-json-type-adapters).

### 5.14.0
released on 2020-11-14
* Dependencies alignment with Spring Boot 2.4.0:
  
```groovy
springVersion           =5.3.1
springBootVersion       =2.4.0
springDataCommonsVersion=2.4.1
springDataMongoVersion  =3.1.1
springSecurityVersion   =5.3.1.RELEASE
mongoDbDriverVersion    =4.1.1
hibernateVersion        =5.4.23.Final
guavaVersion            =28.2-jre
gsonVersion             =2.8.6
classgraphVersion       =4.8.78
jodaVersion             =2.10.5
polyjdbcVersion         =0.7.6
aspectjweaverVersion    =1.9.6
slf4jApiVersion         =1.7.30
jbossTransactionApiVersion=1.1.1.Final
spockVersion            =2.0-M3-groovy-3.0
groovyVersion           =3.0.6
embeddedMongo           =2.2.0
testcontainers          =1.15.0-rc2
```
* [1034](https://github.com/javers/javers/issues/1034) 
  Fixed compatibility issues (`ClassCastException` in `JpaHibernateConnectionProvider`)
  with the latest Hibernate.

### 5.13.2
released on 2020-10-26
* [1030](https://github.com/javers/javers/issues/1030) 
  Fixed class cast exception.
  
* [998](https://github.com/javers/javers/issues/998) 
  Better javadoc for `QueryBuilder.limit()`, 
  `Javers.findShadows()`, and `Javers.findShadowsAndStream()`.

### 5.13.0 Hacktoberfest 2020 Edition
released on 2020-10-16
* [1024](https://github.com/javers/javers/issues/1024) 
  Added support for Groovy 3.0.
  
* [919](https://github.com/javers/javers/issues/919)
  Added multi-value filter for querying by changed property: 
  `QueryBuilder.withChangedPropertyIn(String... propertyNames)`.

### 5.12.0
released on 2020-09-27
* [1019](https://github.com/javers/javers/issues/1019) 
  Added filters in JQL to select snapshots crteated before/after
  given UTC timestamp:
  `QueryBuilder.fromInstant()` and `QueryBuilder.toInstant()`. 

### 5.11.2
released on 2020-08-31
* [1014](https://github.com/javers/javers/issues/1014) Fixed
  issue with Shadows with `boolean` properties.

### 5.11.1
released on 2020-07-27
* [940](https://github.com/javers/javers/issues/940) 
  New method in `JaversBuilder` to registering a strategy 
  for dynamic marking classes as ignored.  
  For example, you can define a custom rule to ignore classes by package name:
  
```java
Javers javers = JaversBuilder.javers()
        .registerIgnoredClassesStrategy(c -> c.getName().startsWith("com.ignore.me"))
        .build();                       
```

### 5.10.5
released on 2020-07-16
* [941](https://github.com/javers/javers/issues/941)
  Added configuration for customizing Javers' table names in SQL repository.
  
`application.yaml`:
  
```yaml
javers:
  sqlGlobalIdTableName: custom_jv_global_id
  sqlCommitTableName: custom_jv_commit
  sqlSnapshotTableName: custom_jv_snapshot
  sqlCommitPropertyTableName: custom_jv_commit_property
```    
  
### 5.10.4
released on 2020-07-02
* Fixed bug  [958](https://github.com/javers/javers/issues/958) 
  when querying by `CommitId` with minor number (like 1.01) 
  on MongoDB. 

### 5.10.3
released on 2020-07-04
* Fixes for [996](https://github.com/javers/javers/issues/996) and
  [692](https://github.com/javers/javers/issues/692) &mdash; removed redundant Guava dependency.

### 5.10.2
released on 2020-07-04
* [991](https://github.com/javers/javers/pull/991)
Api vs Implementation &mdash; mastering dependencies. 

### 5.10.1
released on 2020-06-20
* [988](https://github.com/javers/javers/issues/988)
Fixed: MissingProperty cannot be cast to class java.util.Map

### <font color="red">5.10.0</font>
released on 2020-06-15

** <font color='red'>Important warning for Spring Boot MongoDB users!</font>**

This version of Javers has all dependencies aligned with Spring Boot MongoDB 2.3.0
which has upgraded to MongoDB Java Drivers 4.x.
Unfortunately, Mongo Drivers 4.x has a lot of problematic and braking changes,
especially renaming `com.mongodb.MongoClient` to `com.mongodb.client.MongoClient`
(see [mongodb.github.io/mongo-java-driver/4.0/upgrading](https://mongodb.github.io/mongo-java-driver/4.0/upgrading/))
.

If you have explicit dependency to `org.mongodb:mongo-java-driver:3.x` &mdash; remove it
and rely on Mongo 4.x drivers provided by a Spring Boot MongoDB starter.

If you are using old Spring Boot version 
(2.1 or older) &mdash; you need to upgrade to Spring Boot 2.3.0,
otherwise you will probably experience versions clash between your Spring Boot version,
and the Spring Boot version imported by the Javers starter.   

* [982](https://github.com/javers/javers/issues/982)
Fixed issue with `MongoClient` on on Spring Boot 2.3.0.

Dependencies aligned with Spring Boot 2.3.0:

```txt
springVersion           =5.2.6.RELEASE
springBootVersion       =2.3.0.RELEASE
springDataCommonsVersion=2.3.0.RELEASE
springDataMongoVersion  =3.0.0.RELEASE
springSecurityVersion   =5.3.1.RELEASE
mongoDbDriverVersion    =4.0.3
hibernateVersion        =5.4.12.Final
guavaVersion            =28.2-jre
gsonVersion             =2.8.6
classgraphVersion       =4.8.78
jodaVersion             =2.10.5
polyjdbcVersion         =0.7.6
aspectjweaverVersion    =1.9.5
slf4jApiVersion         =1.7.28
jbossTransactionApiVersion=1.1.1.Final
```

### 5.9.4
released on 2020-06-15

** <font color='red'>Important for Spring Boot MongoDB users</font>**

This is the last version of Javers compatible with 
Spring Boot MongoDB 2.1.x and 2.2.x    

* [981](https://github.com/javers/javers/issues/981)
Added `@Arder(0)` annotation to all Javers' aspects.
This change allows users to execute their own aspects before
or after Javers' aspects (by choosing positive ot negative order numbers).
  
### 5.9.1
released on 2020-05-26
* [973](https://github.com/javers/javers/issues/973)
Fixed strange bug in Gradle build: `index 9730 out of bounds for length 8192`
caused probably by `classgraph 4.8.66`.

### 5.9.0
released on 2020-05-03
* [962](https://github.com/javers/javers/issues/962)
Changes in dedicated Mongo database configuration in 
[JaVers Spring Boot starter for MongoDB](/documentation/spring-boot-integration/#starter-repository-configuration).
Additional client's properties (like SSL or timeouts)
should now be provided using the new `MongoClientSettings` API
(instead of deprecated `MongoClientOptions` API). For example:

```java
@Bean("javersMongoClientSettings")
public MongoClientSettings clientSettings() {
    return MongoClientSettings.builder()
            .applyToSslSettings(builder -> builder.enabled(true))
            .applyToSocketSettings(
                builder -> builder.connectTimeout(500, TimeUnit.MILLISECONDS))
            .build();
}
```

### 5.8.13
released on 2020-04-07
* [948](https://github.com/javers/javers/issues/948)
  Better support for properties with unknown types (with type tokens), like:
  
```java
class Pair<L, R> {
        L left;
        R right;
}
```  

* All JaVers’ dependencies are bumped to the latest versions:

```text
springVersion           =5.2.5.RELEASE
springBootVersion       =2.2.6.RELEASE
springDataCommonsVersion=2.2.6.RELEASE
springDataMongoVersion  =2.2.6.RELEASE
springDataJPAVersion    =2.2.6.RELEASE
springSecurityVersion   =5.3.1.RELEASE
mongoDbDriverVersion    =3.11.2
hibernateVersion        =5.4.12.Final
guavaVersion            =28.2-jre
gsonVersion             =2.8.6
classgraphVersion       =4.8.66
jodaVersion             =2.10.5
polyjdbcVersion         =0.7.6
aspectjweaverVersion    =1.9.5
slf4jApiVersion         =1.7.28
jbossTransactionApiVersion=1.1.1.Final
```

### 5.8.12
released on 2020-03-31
* [951](https://github.com/javers/javers/issues/951)
  Dependencies management fix in `javers-core`. Guava and joda-time
  are now correctly marked as optional in `pom.xml`.

### 5.8.11
released on 2020-03-08
* [915](https://github.com/javers/javers/pull/915)
  Added **experimental** asynchronous audit aspect for non Spring Data repositories.
  The aspect asynchronously commits all arguments passed to methods annotated with
  `@JaversAuditableAsync` annotation
  by calling `Javers.commitAsync(String, Object, Executor)`.
  
Usage:   
  
```java
@Repository
class DummyAuditedAsyncRepository {

    @JaversAuditableAsync
    void save(DummyObject obj){
      //... omitted
    }
}
```

Spring config:

```java
/**
 * Enables asynchronous auto-audit aspect for ordinary repositories.<br/>
 *
 * Use {@link JaversAuditableAsync}
 * to mark repository methods that you want to audit.
 */
@Bean
public JaversAuditableAspectAsync javersAuditableAspectAsync() {
    return new JaversAuditableAspectAsync(javers(), authorProvider(), commitPropertiesProvider(), javersAsyncAuditExecutor());
}

@Bean
public ExecutorService javersAsyncAuditExecutor() {
    ThreadFactory threadFactory = new ThreadFactoryBuilder()
            .setNameFormat("JaversAuditableAsync-%d")
            .build();
    return Executors.newFixedThreadPool(2, threadFactory);
}
```   

See the [full test case](https://github.com/javers/javers/blob/master/javers-spring/src/test/groovy/org/javers/spring/auditable/integration/JaversAuditableAspectAsyncIntegrationTest.groovy).
  
### 5.8.10
released on 2020-02-26
* [938](https://github.com/javers/javers/pull/938)
  Fixed bug in custom TypeAdapters priorities.
  
### 5.8.9
released on 2020-02-07
* [935](https://github.com/javers/javers/issues/935)
  Fixed `ClassCastException`: MissingProperty cannot be cast to java.lang.Double<br/>
  when using `CustomValueComparator`.
  
### 5.8.8
released on 2020-01-18
* [933](https://github.com/javers/javers/pull/933)
  Extend Spring props to allow setting size or disabling the 
  latest snapshots cache for MongoDB.
  
```
javers:
  snapshotsCacheSize: 100
```  
  
### 5.8.7
released on 2019-12-13
* [921](https://github.com/javers/javers/issues/921)
Added support for deleting by Id with the `@JaversAuditableDelete` aspect:

```java
@JaversAuditableDelete(entity = DummyEntity)
void deleteById(String id) {    
    ...
}
```

### 5.8.6
released on 2019-12-06
* [925](https://github.com/javers/javers/issues/925)
  Fixed bug which caused `CustomValueComparator` not being invoked for `ZonedDateTime`.

### 5.8.5
released on 2019-11-10

* [910](https://github.com/javers/javers/issues/910)
  Fixed `ConcurrentModificationException` in MongoDB `MapKeyDotReplacer`.

### 5.8.4
released on 2019-11-04

* [897](https://github.com/javers/javers/issues/897)
 Added warning when `@TypeName` is used on a class without declaring its package name
 in `packagesToScan`. Improved javadocs for `TypeName` and `JaversBuilder.withPackagesToScan()`. 
 
```
07:12:58.253 [main] WARN  o.j.core.metamodel.type.UnknownType - Missing class definition with @TypeName 'Agreement', 
cant't properly deserialize its Snapshots from JaversRepository.
To fix this issue provide the fully-qualified package name of the class named 'Agreement' in the packagesToScan property.
``` 

### 5.8.3
released on 2019-11-02

* [878](https://github.com/javers/javers/issues/878)
 Added property to disabling Global Id cache in SQL repository
 when using JaVers Spring Boot starter:
 
```
javers:
  sqlGlobalIdCacheDisabled: true
```

* [709](https://github.com/javers/javers/issues/708)
 Added property to provide custom implementation of the `ObjectAccessHook`
 when using JaVers Spring Boot starter:
 
```
javers:
  objectAccessHook: com.example.MyObjectAccessHook
```

* [886](https://github.com/javers/javers/issues/886) Fixed bug causing
`JsonSyntaxException`: Expected BEGIN_OBJECT but was STRING.
The exception was thrown on attempt to read Shadows with a ShallowReference with EmbeddedId
(a ShallowReference with an Id-property type mapped to Value Object). 

### 5.8.2
released on 2019-10-23

* [894](https://github.com/javers/javers/issues/894) Better Shadows sorting.
 Using `SYNCHRONIZED_SEQUENCE` CommitId generator for distributed apps can cause duplicated `CommitId`.
 In this fix, Shadows sorting is unified to be
 based on `CommitDateInstant` for both CommitId generators.

* Removed throwing `CANT_SAVE_ALREADY_PERSISTED_COMMIT` in SQL repository. It was thrown
  only in some scenarios when `SYNCHRONIZED_SEQUENCE` generator was used, not ensuring
  the full protections against duplicated CommitId. <br/>
  After this fix, duplicated CommitIds when using `SYNCHRONIZED_SEQUENCE` generator
  are considered as not harmful (although not elegant).
  To ensure unique CommitIds for distributed apps 
  we recommend switching to `RANDOM` generator (when your app runs more than one Javers instance).

### 5.8.1
released on 2019-10-21

**Custom comparators reinvented**

Now, a **`CustomValueComparator`** has to implement the `toString(T value)` method,
which is used instead of `Object.hashCode()` when Values are compared in hashing contexts.
Thanks to that, Values with Custom comparators can be correctly compared anywhere, also when
they are Set items, Map keys or fields in Value Objects inside Sets. 
      
```java
public interface CustomValueComparator<T> {
     boolean equals(T a, T b);
     
     String toString(T value);
}
``` 

Existing method for registering Custom Value comparators
**<font color='red'>is deprecated</font>** and left only
for backward compatibility. Please switch to the new method. 

```java
/**
 * <b>Deprecated</b>, use {@link #registerValue(Class, CustomValueComparator)}.
 *
 * <br/><br/>
 *
 * Since this comparator is not aligned with {@link Object#hashCode()},
 * it calculates incorrect results when a given Value is used in hashing context
 * (when comparing Sets with Values or Maps with Values as keys).
 *
 * @see CustomValueComparator
 */
@Deprecated
public <T> JaversBuilder registerValue(Class<T> valueClass, BiFunction<T, T, Boolean> equalsFunction) {
    Validate.argumentsAreNotNull(valueClass, equalsFunction);

    return registerValue(valueClass, new CustomValueComparator<T>() {
        @Override
        public boolean equals(T a, T b) {
            return equalsFunction.apply(a,b);
        }

        @Override
        public String toString(@Nonnull T value) {
            return value.toString();
        }
    });
}
```     

The same applies to **`CustomPropertyComparator`**, it also have to implement
`toString(T value)` because it extends `CustomValueComparator`.
 
This is the **<font color='red'>breaking change</font>**,
if you are using a `CustomPropertyComparator` you have add `toString(T value)` implementation.

```java
public interface CustomPropertyComparator<T, C extends PropertyChange>
    extends CustomValueComparator<T> 
{
    Optional<C> compare(T left, T right, PropertyChangeMetadata metadata, Property property);
} 
```

Since this version, we stop recommending `CustomPropertyComparators` and Custom Types.
This warning is added to docs: 


    Custom Types are not easy to manage, use it as a last resort,<br/>
    only for corner cases like comparing custom Collection types.</b>
    
    In most cases, it's better to customize the Javers' diff algorithm using
    much more simpler `CustomValueComparator`.

See updated documentation of [Custom comparators](/documentation/diff-configuration/#custom-property-comparators).

### 5.7.7
released on 2019-10-03
* [888](https://github.com/javers/javers/issues/888) Fixed bug 
  (introduced in 5.2.5) when comparing `SortedSet` and `SortedMap`.

### 5.7.6
released on 2019-09-28
* [887](https://github.com/javers/javers/issues/887) Fixed bug (introduced in 
  5.7.2) which was causing `SQL_EXCEPTION` ORA-00917: missing comma while inserting to jv_snapshot
  on Oracle.

### 5.7.5
released on 2019-09-25
* Dependencies bumped to the latest versions:
    
  ```
  springVersion           =5.1.9.RELEASE
  springBootVersion       =2.1.8.RELEASE
  springDataCommonsVersion=2.1.10.RELEASE
  springDataMongoVersion  =2.1.10.RELEASE
  springDataJPAVersion    =2.1.10.RELEASE
  springSecurityVersion   =5.1.6.RELEASE
  mongoDbDriverVersion    =3.8.2
  hibernateVersion        =5.3.11.Final
  guavaVersion            =28.1-jre
  gsonVersion             =2.8.5
  classgraphVersion       =4.8.47
  jodaVersion             =2.9.7
  polyjdbcVersion         =0.7.6
  aspectjweaverVersion    =1.9.4
  slf4jApiVersion         =1.7.28
  jbossTransactionApiVersion=1.1.1.Final
  ``` 

### 5.7.4
released on 2019-09-19
* [832](https://github.com/javers/javers/issues/832) 
  Added possibility to use `CustomPropertyComparator` together with `ListCompareAlgorithm`.`AS_SET`.
  A custom `equals()` methods is used to compare two Lists without paying attention
  to ordering and duplicates. <b>Warning!</b> The list comparing algorithm would be slow in this case
  for large lists because it has n<sup>2</sup> complexity.

### 5.7.2
released on 2019-09-11

* [877](https://github.com/javers/javers/issues/877) 
  Fixed issue with the `jv_snapshot` table primary key sequence for clustered applications.
  The *sequence allocation trick* for the `jv_snapshot` table is discontinued.
  To maintain backward compatibility, since this version,
  numbers genereted by the `jv_snapshot` primary key sequence are multiplied by 100.

### 5.7.0
released on 2019-09-03

* [870](https://github.com/javers/javers/issues/870) 
  Added possibility to provide object-specific properties via
  [`CommitPropertiesProvider`]({{ site.github_spring_main_url }}/org/javers/spring/auditable/CommitPropertiesProvider.java).
  No-arg `provide()` is deprecated. These three methods are added:
  
  ```java 
    public interface CommitPropertiesProvider {
    
        default Map<String, String> provideForCommittedObject(Object domainObject) {
            return Collections.emptyMap();
        }
        
        default Map<String, String> provideForDeletedObject(Object domainObject) {
            return provideForCommittedObject(domainObject);
        }
        
        default Map<String, String> provideForDeleteById(Class<?> domainObjectClass, Object domainObjectId) {
            return Collections.emptyMap();
        }
      
        ...
  ``` 
  
### 5.6.3
released on 2019-08-02

* [864](https://github.com/javers/javers/issues/864) 
  All Spring dependencies are updated. This update is forced by security vulnerability issues in `spring-security` 
  and `spring-data-jpa`.

* [860](https://github.com/javers/javers/issues/860) 
  Fixed `SNAPSHOT_STATE_VIOLATION` exception when a getter was inherited both from a superclass and an interface.

* [774](https://github.com/javers/javers/issues/774) 
  Added more descriptive message for `SNAPSHOT_STATE_VIOLATION` exception.
  
### 5.6.2
released on 2019-07-06

* [826](https://github.com/javers/javers/issues/826) 
  Fixed bug in SQL JaversRepository when DB schema name was configured.
  The bug was causing: `Error on PostgreSQL: relation "jv_commit" already exists`.

### 5.6.1
released on 2019-07-01

* [855](https://github.com/javers/javers/issues/855) 
  Fixed bug in `RANDOM` `CommitIdGenerator`.
  
### 5.6.0
released on 2019-06-13

* [694](https://github.com/javers/javers/issues/694) 
  Added possibility in JaVers MongoDB starter
  to configure a dedicated Mongo database, which is used by Javers.
  See [JaversRepository configuration](/documentation/spring-boot-integration/#starter-repository-configuration).
  
* [775](https://github.com/javers/javers/issues/775)
  Fixed issue: Spring Boot stops when SQL Schema Manager can't establish the connection.
  
* [851](https://github.com/javers/javers/issues/851)
  Fixed exception: java.lang.ClassCastException: class org.javers.core.metamodel.property.MissingProperty cannot be cast to class java.util.List.

### 5.5.2
released on 2019-05-23

* [842](https://github.com/javers/javers/issues/842) 
  Fixed bug in query with CommitId on Oracle.

### 5.5.1
released on 2019-05-18

* [839](https://github.com/javers/javers/pull/839)  Fixed NPE in `OptionalType.items()`.

### 5.5.0
released on 2019-05-18

* <span style="color:red"><b>Breaking changes</b></span> in [CustomPropertyComparator](/documentation/diff-configuration/#custom-comparators)
  and constructors of all `PropertyChange` subclasses. `CustomPropertyComparator` interface is changed from:
  
  ```java 
  public interface CustomPropertyComparator<T, C extends PropertyChange> {
  
      Optional<C> compare(T left, T right, GlobalId affectedId, Property property);
            
      ...
  }
  ```
    
  to: 
  
  ```java 
  public interface CustomPropertyComparator<T, C extends PropertyChange> {
    
      Optional<C> compare(T left, T right, PropertyChangeMetadata metadata, Property property);
      
      ...
  }
  ```
  
  `PropertyChange` objects that are produced by comparators now accept `PropertyChangeMetadata` in constructors,
  for example:
  
  ```java
  public class CustomBigDecimalComparator implements CustomPropertyComparator<BigDecimal, ValueChange> {
  ...

  @Override
  public Optional<ValueChange> compare(BigDecimal left, BigDecimal right, PropertyChangeMetadata metadata, Property property)
  {
      if (equals(left, right)){
          return Optional.empty();
      }
 
      return Optional.of(new ValueChange(metadata, left, right));
  }

  ...
  }
  ```
  
* [830](https://github.com/javers/javers/pull/830) & [834](https://github.com/javers/javers/pull/834)
  Important new feature in [PropertyChange](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/changetype/PropertyChange.java).
  It gained the new enum, which allows to distinguish between ordinary `null` values
  and the case when a property is added/removed after refactoring:
  
   ```java
  /**
    * When two objects being compared have different classes,
    * they can have different sets of properties.
    * <br/>
    * When both objects have the same class, all changes have PROPERTY_VALUE_CHANGED type.
    */
   public enum PropertyChangeType {
   
       /**
        * When a property of the right object is absent in the left object.
        */
       PROPERTY_ADDED,
   
       /**
        * When a property of the left object is absent in the right object.
        */
       PROPERTY_REMOVED,
   
       /**
        * Regular value change &mdash; when a property is present in both objects.
        */
       PROPERTY_VALUE_CHANGED
   }
   
   ```  

  The new enum can be checked using these four new methods in `PropertyChange`:
  ```java
  public abstract class PropertyChange extends Change {
      ...
      
      public PropertyChangeType getChangeType() {
          return changeType;
      }
  
      public boolean isPropertyAdded() {
          return changeType == PropertyChangeType.PROPERTY_ADDED;
      }
  
      public boolean isPropertyRemoved() {
          return changeType == PropertyChangeType.PROPERTY_REMOVED;
      }
  
      public boolean isPropertyValueChanged() {
          return changeType == PropertyChangeType.PROPERTY_VALUE_CHANGED;
      }
  }
  ```

* [837](https://github.com/javers/javers/pull/837)
 Fixed bug in SQL `JaversRepository` for Oracle and MS SQL databases.

### 5.4.0
released on 2019-05-11

* [625](https://github.com/javers/javers/issues/625)
 Composite-Id is now available in JaVers. Multiple properties can be mapped with `@Id`,
 and the `localId` is constructed as a Map.
 
```groovy
    class Person {
        @Id String name
        @Id String surname
        @Id LocalDate dob
        int data
    }

    def "should support Composite Id assembled from Values"(){
        given:
        def first  = new Person(name: "mad", surname: "kaz", dob: LocalDate.of(2019,01,01), data: 1)
        def second = new Person(name: "mad", surname: "kaz", dob: LocalDate.of(2019,01,01), data: 2)

        when:
        javers.commit("author", first)
        javers.commit("author", second)
        def snapshot = javers.getLatestSnapshot(
                [
                    name: "mad",
                    surname: "kaz",
                    dob: LocalDate.of(2019,01,01)
                ],
                Person).get()

        then:
        snapshot.globalId.value().endsWith("Person/2019,1,1,mad,kaz")
        snapshot.globalId.cdoId == "2019,1,1,mad,kaz"
        snapshot.getPropertyValue("name") == "mad"
        snapshot.getPropertyValue("surname") == "kaz"
        snapshot.getPropertyValue("dob") == LocalDate.of(2019,01,01)
        snapshot.getPropertyValue("data") == 2
        snapshot.changed == ["data"]
    }
```
 
### 5.3.6
released on 2019-04-10

* [820](https://github.com/javers/javers/issues/820)
 Fixed NPE in Levenshtein distance diff algorithm.
 
### 5.3.5
released on 2019-04-08

* [821](https://github.com/javers/javers/issues/821)
 Added basic support for mapping Entity Id-property as ValueObject.
 
### 5.3.4
released on 2019-03-29

* [815](https://github.com/javers/javers/issues/815)
 Fixed `UnsupportedOperationException` thrown by `Sets.xor()` function.

### 5.3.3
released on 2019-03-26

* [798](https://github.com/javers/javers/issues/798)
 Fixed error when inferring Javers type of an Id-property as Value.
 
### 5.3.2
released on 2019-03-20

* [810](https://github.com/javers/javers/issues/810)
 Fixed issue when comparing Sets with nested Value Objects with `@DiffIgnore`.

* [806](https://github.com/javers/javers/issues/806)
 Fixed bug in schema management on MS SQL Server.
 
### 5.3.1
released on 2019-03-16

* [799](https://github.com/javers/javers/issues/799)
 Fixed NPE when passing nulls to `javers.compare()`.

### 5.3.0 
released on 2019-03-16

* [528](https://github.com/javers/javers/issues/528)
 Added support for `@ShallowReference` on Collections and Maps.

### 5.2.6 
released on 2019-03-12

* [801](https://github.com/javers/javers/issues/801),
  [796](https://github.com/javers/javers/issues/796)
  Fixed issues when querying for `anyDomainObject` on Oracle and MS SQL. 
  
### 5.2.5 
released on 2019-03-10

* [795](https://github.com/javers/javers/issues/795)
  Fixed issue when comparing Sets with nested Value Objects.

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
  Fixed implementaton of `RANDOM` [`CommitIdGenerator`]({{ site.github_core_main_url }}org/javers/core/CommitIdGenerator.java).
  You can use it in distributed applications:   
  
```java
Javers javers = javers().withCommitIdGenerator(CommitIdGenerator.RANDOM)
                        .build();
```

### 3.9.0
released on 2018-04-11

* New API for processing Changes, convenient for formatting a change log. 
Now you can group changes by commits and by objects. 
See [`Changes.groupByCommit()`]({{ site.github_core_main_url }}org/javers/core/Changes.java).
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
See javadoc for [`JaversBuilder.registerValueWithCustomToString()`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java). 

### 3.7.5
released on 2017-12-01

* **Shadow queries performance optimization**. Less DB queries executed for 
each **Deep+** query.

* Changes in Shadow Scopes. Now, JaVers always loads child ValueObjects owned by selected Entities.
So there is no need to call `QueryBuilder.withChildValueObjects()`.
See javadoc for [`ShadowScope`]({{ site.github_core_main_url }}org/javers/repository/jql/ShadowScope.java). 

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
  See javadoc for [`ShadowScope`]({{ site.github_core_main_url }}org/javers/repository/jql/ShadowScope.java).
  Now, deep+ scope doesn't include commit-deep scope. They are independent scopes.

* [597](https://github.com/javers/javers/issues/597)
  Second fix for MySQL error: Specified key was too long; max key length is 767 bytes.
    
### 3.6.2
released on 2017-11-01

* New `SnapshotType` filter in JQL.
  Allows selecting snapshots by type: `INITIAL`, `UPDATE`, `TERMINAL`. See
  `QueryBuilder.withSnapshotType()`.

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
 a [`CustomValueComparator`]({{ site.github_core_main_url }}org/javers/core/diff/custom/CustomValueComparator.java)
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
 see [`JaversBuilder.withCommitIdGenerator()`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java)
 
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
  New properties in [`ReferenceChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ReferenceChange.java): 
  `getLeftObject()` and `getRightObject()`.

* [#294](https://github.com/javers/javers/pull/294)
  Added version number to Snapshot metadata:
  [`CdoSnapshot.getVersion()`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/CdoSnapshot.java).

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