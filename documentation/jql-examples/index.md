---
layout: page
title: JQL (JaVers Query Language) examples
category: Documentation
submenu: jql-examples
sidebar-url: docs-sidebar.html
---

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```
./gradlew javers-core:test --tests JqlExample
```

<h2 id="query-overview">Overview</h2>

JQL (JaVers Query Language) is a simple, fluent API
which allows you to query JaversRepository for changes of a given class, object or property.

It’s not such a powerful language like SQL because it’s the abstraction over native languages
used by concrete JaversRepository implementations (like SQL, MongoDB).

In the example below, we show all types of JQL queries.
We use [Groovy](http://groovy-lang.org/style-guide.html) and [Spock](https://code.google.com/p/spock/)
as these languages are far more readable for BDD-style tests than Java.

<h4 id="data-history-views">Data history views</h4>

Data history can be fetched from JaversRepository using `javers.find*()` methods in one of three views:
*Shadows*, *Changes*, and *Snapshots*. 

* **Shadow** is a historical version of a domain object restored from a snapshot.
* **Change** represents an atomic difference between two objects. 
* **Snapshot** is a historical state of a domain object captured as the `property:value` map.

<h4>List of Examples</h4>

There are three `find*()` methods:

* [findShadows()](#query-for-shadows) for the Shadows view,
* [findChanges()](#query-for-changes) for the Changes view,
* [findSnapshots()](#query-for-snapshots) for the Snapshots view.

There are four types of queries:

* query for [Entity](#instance-id-query) changes by Instance Id,
* query for [ValueObject](#by-value-object-query) changes,
* query by object’s [class](#by-class-query),
* query for [any object](#any-domain-object-query) changes.

Queries can have one or more optional [filters](#query-filters):

* [changed property](#property-filter),
* [limit](#limit-filter),
* [skip](#skip-filter),
* [author](#author-filter),
* [commitProperty](#commit-property-filter),
* [commitDate](#commit-date-filter),
* [commitId](#commit-id-filter),
* [snapshot version](#version-filter),
* [child ValueObjects](#child-value-objects-filter),
* [initial Changes](#initial-changes-filter).

JQL can adapt when you refactor your domain classes:

* refactoring [Entities](#entity-refactoring) with `@TypeName`,
* free refactoring of [ValueObjects](#value-object-refactoring).

<h2 id="find-methods">Find methods</h2>

All `find*()` methods understand JQL so you can use the same JqlQuery to get Changes, Shadows and Snapshots views.

<h3 id="query-for-shadows">Querying for Shadows</h3>

Shadows (see [`Shadow.java`]({{ site.github_core_main_url }}org/javers/shadow/Shadow.java)) offer the most natural view on data history.
Thanks to JaVers magic, you can see historical versions of your domain objects
*reconstructed* from Snapshots.

Since Shadows are instances of your domain classes,
you can use them easily in your application. 
Moreover, the JQL engine strives to rebuild original object graphs.
  
See how it works &mdash; [`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy#L147):

```groovy
def "should query for Shadows of an object"() {
  given:
      def javers = JaversBuilder.javers().build()
      def bob = new Employee(name: "bob",
                             salary: 1000,
                             primaryAddress: new Address("London"))
      javers.commit("author", bob)       // initial commit

      bob.salary = 1200                  // changes
      bob.primaryAddress.city = "Paris"  //
      javers.commit("author", bob)       // second commit

  when:
      List<Shadow<Employee>> shadows = javers.findShadows(
              QueryBuilder.byInstance(bob).build())

  then:
      assert shadows.size() == 2

      Employee bobNew = shadows[0].get()     // Employee shadows are instances
      Employee bobOld = shadows[1].get()     // of Employee.class

      bobNew.salary == 1200
      bobOld.salary == 1000
      bobNew.primaryAddress.city == "Paris"  // Employee shadows are linked
      bobOld.primaryAddress.city == "London" // to Address Shadows

      shadows[0].commitMetadata.id.majorId == 2
      shadows[1].commitMetadata.id.majorId == 1
}
```  
 
<br/>
<h4 id="shadow-scopes">Shadow Scopes</h4>

Shadow reconstruction comes with one limitation &mdash; the query scope.
Shadows inside the scope are loaded eagerly.
References to Shadows outside the scope are simply nulled.
There is no Hibernate-style lazy loading.

There are four scopes.
The wider the scope, the more object shadows are loaded to the resulting graph
(and the more database queries are executed).
Scopes are defined in the
[`ShadowScope`]({{ site.github_core_main_url }}org/javers/repository/jql/ShadowScope.java) enum. 

* **Shallow**
  &mdash;  the defult scope &mdash;
   Shadows are created only from snapshots selected directly in the main JQL query.

* **Child-value-object** &mdash;
  JaVers loads all child Value Objects owned by selected Entities.
  Since 3.7.5, this scope is implicitly enabled for all Shadow queries and can't be disabled.
     
* **Commit-deep** &mdash;
  Shadows are created from all snapshots saved in
  commits touched by the main query.
  
* **Deep+**
  &mdash; JaVers tries to restore full object graphs with
  (possibly) all objects loaded.

The following example shows how the scopes work &mdash; [`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy#L177):

```groovy
def "should query for Shadows with different scopes"(){
  given:
      def javers = JaversBuilder.javers().build()

      //    /-> John -> Steve
      // Bob
      //    \-> #address
      def steve = new Employee(name: 'steve')
      def john = new Employee(name: 'john', boss: steve)
      def bob  = new Employee(name: 'bob', boss: john, primaryAddress: new Address('London'))

      javers.commit('author', steve)  // commit 1.0 with snapshot of Steve
      javers.commit('author', bob)    // commit 2.0 with snapshots of Bob, Bob#address and John
      bob.salary = 1200               // the change
      javers.commit('author', bob)    // commit 3.0 with snapshot of Bob

  when: 'shallow scope query'
      def shadows = javers.findShadows(QueryBuilder.byInstance(bob).build())
      Employee bobShadow = shadows[0].get()  //get the latest version of Bob
 
  then:
      assert shadows.size() == 2             //we have 2 shadows of Bob
      assert bobShadow.name == 'bob'
      // referenced entities are outside the query scope so they are nulled
      assert bobShadow.boss == null
      // child Value Objects are always in scope
      assert bobShadow.primaryAddress.city == 'London'
 
  when: 'commit-deep scope query'
      shadows = javers.findShadows(QueryBuilder.byInstance(bob)
                      .withScopeCommitDeep().build())
      bobShadow = shadows[0].get()
  then:
      assert bobShadow.boss.name == 'john' // John is inside the query scope, so his
                                           // shadow is loaded and linked to Bob
      assert bobShadow.boss.boss == null   // Steve is still outside the scope
      assert bobShadow.primaryAddress.city == 'London'
 
  when: 'deep+2 scope query'
      shadows = javers.findShadows(QueryBuilder.byInstance(bob)
                      .withScopeDeepPlus(2).build())
      bobShadow = shadows[0].get()
 
  then: 'all objects are loaded'
      assert bobShadow.boss.name == 'john'
      assert bobShadow.boss.boss.name == 'steve' // Steve is loaded thanks to deep+2 scope
      assert bobShadow.primaryAddress.city == 'London'
}
```
 
If you want to be 100% sure that Shadow reconstruction
didn’t hide some details &mdash; use Snapshots or Changes view.

Read more about Shadow query <b>scopes, profiling, and runtime statistics</b> in 
the [`Javers.findShadows()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
javadoc.

<h3 id="query-for-changes">Querying for Changes</h3>

The Changes view (see [`Changes.java`]({{ site.github_core_main_url }}org/javers/core/Changes.java)) 
is the list of atomic differences between subsequent versions of a domain object.
Since JaVers stores only Snapshots of domain objects,
Changes are recalculated by the JQL engine as the diff between subsequent Snapshots loaded from the JaversRepository.
 
There are three main types of Changes:

* [`NewObject`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/NewObject.java)
  &mdash; when an object is committed to the JaversRepository for the first time,
* [`ObjectRemoved`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ObjectRemoved.java)
  &mdash; when an object is deleted from the JaversRepository,
* [`PropertyChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/PropertyChange.java)
  &mdash; most common &mdash; a changed property of an object (field or getter).

PropertyChange has the following subtypes:

* [`ContainerChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/container/ContainerChange.java)
  &mdash; list of changed items in Set, List or Array,
* [`MapChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/map/MapChange.java)
  &mdash; list of changed Map entries,
* [`ReferenceChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ReferenceChange.java)
  &mdash; changed Entity reference,
* [`ValueChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ValueChange.java)
  &mdash; changed Primitive or Value.

See how it works &mdash; [`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy#L120):

```groovy
def "should query for Changes made on any object"() {
    given:
    def javers = JaversBuilder.javers().build()
    def bob = new Employee(name: "bob",
            salary: 1000,
            primaryAddress: new Address("London"))
    javers.commit("author", bob)       // initial commit
    
    bob.salary = 1200                  // changes
    bob.primaryAddress.city = "Paris"  //
    
    javers.commit("author", bob)       // second commit
    
    when:
    Changes changes = javers.findChanges( QueryBuilder.anyDomainObject().build() )
    println changes.prettyPrint()
    
    then:
    def lastCommitChanges = changes.groupByCommit()[0].changes
    assert lastCommitChanges.size() == 2
    ValueChange salaryChange = lastCommitChanges.find{it.propertyName == "salary"}
    ValueChange cityChange = lastCommitChanges.find{it.propertyName == "city"}
    assert salaryChange.left ==  1000
    assert salaryChange.right == 1200
    assert cityChange.left ==  "London"
    assert cityChange.right == "Paris"
}
```

the query result:

```text
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:04:09 :
* changes on Employee/bob :
  - 'primaryAddress.city' changed: 'London' -> 'Paris'
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:04:09 :
* new object: Employee/bob
  - 'name' = 'bob'
  - 'primaryAddress.city' = 'London'
  - 'salary' = '1000'
```

<h3 id="query-for-snapshots">Querying for Snapshots</h3>

Snapshot (see [`CdoSnapshot.java`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/CdoSnapshot.java))
is the historical state of a domain object captured as the property-value map.

Snapshots are raw data stored in the JaversRepository.
When an object is committed,
JaVers makes a Snapshot of its state and persists it.
Under the hood, JaVers reuses Snapshots and creates a new one, only when a given object is changed
(i.e., is changed compared to the last persisted Snapshot).
It allows you to save a significant amount of repository space.

JaVers fetches snapshots in reversed chronological order.
So if you set the limit to 10, you will get a list of the 10 latest Snapshots.

[`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy#L226):

```groovy
def "should query for Snapshots of an object"(){
    given:
    def javers = JaversBuilder.javers().build()
    def bob = new Employee(name: "bob",
                           salary: 1000,
                           age: 29,
                           boss: new Employee("john"))
    javers.commit("author", bob)       // initial commit

    bob.salary = 1200                  // changes
    bob.age = 30                       //
    javers.commit("author", bob)       // second commit

    when:
    def snapshots = javers.findSnapshots( QueryBuilder.byInstance(bob).build() )

    then:
    assert snapshots.size() == 2

    assert snapshots[0].commitMetadata.id.majorId == 2
    assert snapshots[0].changed == ["salary", "age"]
    assert snapshots[0].getPropertyValue("salary") == 1200
    assert snapshots[0].getPropertyValue("age") == 30
    // references are dehydrated
    assert snapshots[0].getPropertyValue("boss").value() == "Employee/john"

    assert snapshots[1].commitMetadata.id.majorId == 1
    assert snapshots[1].getPropertyValue("salary") == 1000
    assert snapshots[1].getPropertyValue("age") == 29
    assert snapshots[1].getPropertyValue("boss").value() == "Employee/john"
}
```

<h2 id="query-types">Query types</h2>
JqlQueries are created by the following methods: 

* `QueryBuilder.byInstanceId()` &mdash; query for Entity instance changes,
* `QueryBuilder.byValueObjectId()` and `QueryBuilder.byValueObject()` &mdash; query for ValueObject changes,
* `QueryBuilder.byClass()` &mdash; query by objects' class,
* `QueryBuilder.anyDomainObject()` &mdash; query for any object changes.

All examples are in [`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy).

<h3 id="instance-id-query">Querying for Entity changes by Instance Id</h3> 

This query selects changes made on concrete [Entity](/documentation/domain-configuration/#entity) instance.
The query accepts two mandatory parameters:

* `Object localId` &mdash; expected Instance Id,
* `Class entityClass` &mdash; expected Entity class.

Here is the Groovy spec:

```groovy
def "should query for Entity changes by instance Id"() {
    given:
    def javers = JaversBuilder.javers().build()
    
    javers.commit("author", new Employee(name:"bob", age:30, salary:1000) )
    javers.commit("author", new Employee(name:"bob", age:31, salary:1200) )
    javers.commit("author", new Employee(name:"john",age:25) )
    
    when:
    Changes changes = javers.
            findChanges( QueryBuilder.byInstanceId("bob", Employee.class).build() )
    println changes.prettyPrint()
    
    then:
    assert changes.size() == 6
}
```

the query result:

```text
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'age' changed: '30' -> '31'
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:04:10 :
* new object: Employee/bob
  - 'age' = '30'
  - 'name' = 'bob'
  - 'salary' = '1000'
```

<h3 id="by-value-object-query">Querying for Value Object changes</h3>
This query selects changes made on a concrete [Value Object](/documentation/domain-configuration/#value-object)
(so a Value Object owned by a concrete Entity instance)
or changes made on all Value Objects owned by any instance of a given Entity.

When querying for Value Objects, you should keep in mind that Value Objects,
by definition, don’t have their own identifiers. We identify them using
the owning Entity Instance Id and the property name.
So in this case, the property name serves as a sort of path.

Let’s see how it works:

```groovy
def "should query for ValueObject changes by owning Entity instance and class"() {
    given:
    def javers = JaversBuilder.javers().build()
    
    javers.commit("author", new Employee(name:"bob",  postalAddress:  new Address(city:"Paris")))
    javers.commit("author", new Employee(name:"bob",  primaryAddress: new Address(city:"London")))
    javers.commit("author", new Employee(name:"bob",  primaryAddress: new Address(city:"Paris")))
    javers.commit("author", new Employee(name:"lucy", primaryAddress: new Address(city:"New York")))
    javers.commit("author", new Employee(name:"lucy", primaryAddress: new Address(city:"Washington")))
    
    when:
    println "query for ValueObject changes by owning Entity instance Id"
    Changes changes = javers
            .findChanges( QueryBuilder.byValueObjectId("bob",Employee.class,"primaryAddress").build())
    println changes.prettyPrint()
    
    then:
    assert changes.size() == 2
    
    when:
    println "query for ValueObject changes by owning Entity class"
    changes = javers
            .findChanges( QueryBuilder.byValueObject(Employee.class,"primaryAddress").build())
    println changes.prettyPrint()
    
    then:
    assert changes.size() == 4
}
```

the query result:

```text
query for ValueObject changes by owning Entity instance Id
Changes:
Commit 3.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'primaryAddress.city' changed: 'London' -> 'Paris'
Commit 2.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'primaryAddress.city' = 'London'

query for ValueObject changes by owning Entity class
Changes:
Commit 5.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/lucy :
  - 'primaryAddress.city' changed: 'New York' -> 'Washington'
Commit 4.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/lucy :
  - 'primaryAddress.city' = 'New York'
Commit 3.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'primaryAddress.city' changed: 'London' -> 'Paris'
Commit 2.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'primaryAddress.city' = 'London'
```

<h3 id="by-class-query">Querying for any object changes by class</h3>
The only mandatory parameter of this query is a class.
It selects objects regardless of theirs JaversType.

This query is useful for selecting Unbounded Value Objects (Value Objects without an owning Entity)
and also for Value Objects when we don’t care about the owning Entity and path.

In the example, we show how to query for changes made on
Value Objects owned by two different Entities.

```groovy
def "should query for Object changes by its class"() {
  given:
  def javers = JaversBuilder.javers().build()

  javers.commit("me", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "London")))
  javers.commit("me", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "Paris")))
  javers.commit("me", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "Rome")))
  javers.commit("me", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "Palma")))
  javers.commit("me", new SnapshotEntity(id:2, intProperty:2))

  when:
  Changes changes = javers.findChanges( QueryBuilder.byClass(DummyAddress.class).build() )

  then:
  println changes.prettyPrint()
  assert changes.size() == 4
}
```

the query result:

```text
Changes:
Commit 4.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on org.javers.core.model.SnapshotEntity/2 :
  - 'valueObjectRef.city' changed: 'Rome' -> 'Palma'
Commit 3.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on org.javers.core.model.SnapshotEntity/2 :
  - 'valueObjectRef.city' = 'Rome'
Commit 2.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on org.javers.core.model.DummyUserDetails/1 :
  - 'dummyAddress.city' changed: 'London' -> 'Paris'
Commit 1.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on org.javers.core.model.DummyUserDetails/1 :
  - 'dummyAddress.city' = 'London'
```

<h3 id="any-domain-object-query">Querying for any domain object changes</h3>
This query is a kind of a shotgun approach. It accepts no parameters.
It selects all objects regardless of theirs JaversType or class.

The query is useful for selecting any snapshots or changes that were created
by a given author or have some other common properties set during commit.

In the example, we show how to query for changes made on any domain object.

```groovy
def "should query for any domain object changes"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit("author", new Employee(name:"bob", age:30) )
    javers.commit("author", new Employee(name:"bob", age:31) )
    javers.commit("author", new DummyUserDetails(id:1, someValue:"old") )
    javers.commit("author", new DummyUserDetails(id:1, someValue:"new") )

    when:
    Changes changes = javers.findChanges( QueryBuilder.anyDomainObject().build() )

    then:
    println changes.prettyPrint()
    assert changes.size() == 8
}
```

the query result:

```text
Changes:
Commit 4.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on org.javers.core.model.DummyUserDetails/1 :
  - 'someValue' changed: 'old' -> 'new'
Commit 3.00 done by author at 16 Mar 2021, 22:04:10 :
* new object: org.javers.core.model.DummyUserDetails/1
  - 'id' = '1'
  - 'someValue' = 'old'
Commit 2.00 done by author at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'age' changed: '30' -> '31'
Commit 1.00 done by author at 16 Mar 2021, 22:04:10 :
* new object: Employee/bob
  - 'age' = '30'
  - 'name' = 'bob'
```

<h2 id="query-filters">Query filters</h2>
For each query you can add one or more optional filters:
[changed property](#property-filter),
[limit](#limit-filter),
[skip](#skip-filter),
[author](#author-filter),
[commitProperty](#commit-property-filter),
[commitDate](#commit-date-filter),
[commitId](#commit-id-filter),
[snapshot version](#version-filter),
[child ValueObjects](#child-value-objects-filter) and
[initial Changes](#initial-changes-filter).

All examples are in [`JqlExample.groovy`]({{ site.github_core_test_url }}org/javers/core/examples/JqlExample.groovy).

<h3 id="property-filter">Changed property filter</h3>
Optional parameter for all queries.
Use it to filter query results to changes made on a concrete property.

In the example, we show how to query for Employee’s salary changes,
while ignoring changes made on other properties.

```groovy
def "should query for changes (and snapshots) with property filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit("me", new Employee(name:"bob", age:30, salary:1000) )
    javers.commit("me", new Employee(name:"bob", age:31, salary:1100) )
    javers.commit("me", new Employee(name:"bob", age:31, salary:1200) )

    when:
    def query = QueryBuilder.byInstanceId("bob", Employee.class)
            .withChangedProperty("salary").build()
    Changes changes = javers.findChanges(query)

    then:
    println changes.prettyPrint()
    assert changes.size() == 3
    assert javers.findSnapshots(query).size() == 3
}
```

the query result:

```text
Changes:
Commit 3.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'salary' changed: '1100' -> '1200'
Commit 2.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'salary' changed: '1000' -> '1100'
Commit 1.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'salary' = '1000'
```

<h3 id="limit-filter">Limit filter</h3>
Use the limit parameter to set the maximum 
number of Snapshots or Shadows loaded from a JaversRepository.
Choose a reasonable limit to improve performance of your queries.
By default, the limit is set to 100. It's optional for all queries.

There are four JQL `find*()` methods, and the limit parameter affects all of them, 
but in a different way:

* `Javers.findSnapshots()` &mdash; the limit works intuitively. 
  It's the maximum size of the returned list.
  It's applied directly to the underlying database query.
  On SQL database, it limits the number of records loaded from the `jv_snapshots` table.
  On MongoDB, it limits the number of documents loaded from the `jv_snapshots` collection.
  
* `Javers.findChanges()` &mdash; the limit is applied to 
  the Snapshots query, which underlies the Changes query.
  The size of the returned list can be **greater** than limit, 
  because, typically a difference between any two Snapshots consists of many atomic Changes. 
  
* `Javers.findShadows()` &mdash; the limit is applied to Shadows,
  it limits the size of the returned list.
  The underlying Snapshots query uses its own limit &mdash; `QueryBuilder.snapshotQueryLimit()`.
  Since one Shadow might be reconstructed from many Snapshots,
  when `snapshotQueryLimit()` is hit, Javers repeats a given Shadow query
  to load a next *frame* of Shadows until required limit is reached.
  
* `Javers.findShadowsAndStream()` &mdash;
  the limit works like in `findShadows()`, it limits the size of the returned stream.
  The main difference is that the stream is lazy loaded and subsequent *frame* queries 
  are executed gradually, during the stream consumption.
  
In the following example we set the limit parameter to 2,
and we load Bob’s Snapshots and Changes. 
Only the last 2 Snapshots are loaded which means 4 Changes:

```groovy
def "Snapshots limit in findChanges and findShadows"() {
    given:
    def javers = JaversBuilder.javers().build()
    
    def bob = new Employee("Bob", 9_000, "ScrumMaster")
    bob.age = 20
    
    10.times {
      bob.salary += 1_000
      bob.age += 1
      javers.commit("author", bob)
    }
    
    def query = QueryBuilder.byInstanceId("Bob", Employee).limit(2).build()
    
    when: "findSnapshots - 2 latest snapshots are loaded and returned"
    List<CdoSnapshot> snapshots = javers.findSnapshots(query)
    snapshots.each {println(it)}
    
    then:
    snapshots.size() == 2
    
    when: "findChanges - two latest snapshots are loaded, 4 changes are returned"
    Changes changes = javers.findChanges(query)
    println changes.prettyPrint()
    
    then:
    changes.size() == 4
}
```

output:

```text
Snapshot{commit:10.00, id:Employee/Bob, version:10, state:{age:30, name:Bob, position:ScrumMaster, salary:19000, subordinates:[]}}
Snapshot{commit:9.00, id:Employee/Bob, version:9, state:{age:29, name:Bob, position:ScrumMaster, salary:18000, subordinates:[]}}

Changes:
Commit 10.00 done by author at 15 Mar 2021, 22:51:16 :
* changes on Employee/Bob :
  - 'age' changed: '29' -> '30'
  - 'salary' changed: '18000' -> '19000'
Commit 9.00 done by author at 15 Mar 2021, 22:51:16 :
* changes on Employee/Bob :
  - 'age' changed: '28' -> '29'
  - 'salary' changed: '17000' -> '18000'
```

Then, we can use the limit parameter to load the latest 2 Shadows of Bob.
In this case, each Bob’s Shadow is reconstructed from 3 Snapshots, because
Bob has 2 addresses which are Value Objects:

```groovy
def "Shadows limit in findShadows and findShadowsAndStream"() {
    given:
    def javers = JaversBuilder.javers().build()

    def bob = new Employee("Bob", 9_000, "ScrumMaster")
    bob.primaryAddress = new Address("London")
    bob.postalAddress = new Address("Paris")

    3.times {
        bob.salary += 1_000
        bob.primaryAddress.city = "London $it"
        bob.postalAddress.city = "Paris $it"
        javers.commit("author", bob)
    }

    def query = QueryBuilder.byInstanceId("Bob", Employee).limit(2).build()

    when : "findShadows() - 9 snapshots are loaded, 2 Shadows are returned"
    List<Employee> shadows = javers.findShadows(query)
    shadows.each {println(it)}

    then:
    shadows.size() == 2
    println("query stats: " + query)

    when : "findShadowsAndStream() - 9 snapshots are loaded, 2 Shadows are returned"
    Stream<Shadow<Employee>> shadowsStream = javers.findShadowsAndStream(query)

    then:
    shadowsStream.count() == 2
}
```

output:

```text
Shadow{it=Employee{ name: 'Bob', salary: '12000', primaryAddress: 'Address{ city: 'London 2' }' }, commitMetadata=CommitMetadata{ author: 'author', util: '11 Mar 2021, 16:36:58', id: '3.00' }}
Shadow{it=Employee{ name: 'Bob', salary: '11000', primaryAddress: 'Address{ city: 'London 1' }' }, commitMetadata=CommitMetadata{ author: 'author', util: '11 Mar 2021, 16:36:58', id: '2.00' }}

query stats: JqlQuery {
  IdFilterDefinition{ globalId: 'org.javers.core.examples.model.Employee/Bob' }
  QueryParams{ aggregate: 'true', limit: '2' }
  shadowScope: SHALLOW
  ShadowStreamStats{  
    executed in millis: '19'  
    DB queries: '1'  
    snapshots loaded: '9'  
    SHALLOW snapshots: '9'  
    Shadow stream frame queries: '1'  
  }
}
```

<h3 id="skip-filter">Skip filter</h3>
Use the skip parameter to define the offset of the first (most recent) Snapshot or Shadow 
that JaVers fetches from a repository.
The default skip is 0. It's optional for all queries.

You can use skip and limit parameters together to implement pagination.

In the following example we use skip to omit the most recent Snapshots and
Shadows of Bob:

```groovy
def "Skip parameter in findChanges, findSnapshots, and findShadows"() {
    given:
    def javers = JaversBuilder.javers().build()
    
    javers.commit( "me", new Employee(name:"bob", age:20, salary: 2000) )
    javers.commit( "me", new Employee(name:"bob", age:30, salary: 3000) )
    javers.commit( "me", new Employee(name:"bob", age:40, salary: 4000) )
    javers.commit( "me", new Employee(name:"bob", age:50, salary: 5000) )
    
    def query = QueryBuilder.byInstanceId("bob", Employee.class).skip(2).build()
    
    when: "findChanges()"
    Changes changes = javers.findChanges( query )
    
    then:
    println changes.prettyPrint()
    assert changes.size() == 6
    
    when: "findSnapshots()"
    List<CdoSnapshot> snapshots = javers.findSnapshots( query )
    
    then:
    snapshots.each {println it}
    assert snapshots.size() == 2
    assert snapshots[0].getPropertyValue("salary") == 3000
    
    when: "findShadows()"
    List<Shadow<Employee>> shadows = javers.findShadows( query )
    
    then:
    shadows.each {println it}
    assert shadows.size() == 2
    assert shadows[0].get().salary == 3000
}
```

output:

```text
Changes:
Commit 2.00 done by me at 16 Mar 2021, 22:04:10 :
* changes on Employee/bob :
  - 'age' changed: '20' -> '30'
  - 'salary' changed: '2000' -> '3000'
Commit 1.00 done by me at 16 Mar 2021, 22:04:10 :
* new object: Employee/bob
  - 'age' = '20'
  - 'name' = 'bob'
  - 'salary' = '2000'

Snapshot{commit:2.00, id:Employee/bob, version:2, state:{age:30, name:bob, salary:3000, subordinates:[]}}
Snapshot{commit:1.00, id:Employee/bob, version:1, state:{age:20, name:bob, salary:2000, subordinates:[]}}

Shadow{it=Employee{ name: 'bob', salary: '3000' }, commitMetadata=CommitMetadata{ author: 'me', util: '11 Mar 2021, 17:47:44', id: '2.00' }}
Shadow{it=Employee{ name: 'bob', salary: '2000' }, commitMetadata=CommitMetadata{ author: 'me', util: '11 Mar 2021, 17:47:44', id: '1.00' }}
```

<h3 id="author-filter">Author filter</h3>
Author filter is an optional parameter for all queries.
It allows you to find changes (or snapshots) persisted by a particular author.

In the example, objects are committed by turns by Jim and Pam.
Then we retrieve only the changes committed by Pam.

```groovy
def "should query for changes (and snapshots) with author filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "Jim", new Employee(name:"bob", age:29, salary: 900) )
    javers.commit( "Pam", new Employee(name:"bob", age:30, salary: 1000) )
    javers.commit( "Jim", new Employee(name:"bob", age:31, salary: 1100) )
    javers.commit( "Pam", new Employee(name:"bob", age:32, salary: 1200) )

    when:
    def query = QueryBuilder.byInstanceId("bob", Employee.class).byAuthor("Pam").build()
    Changes changes = javers.findChanges( query )

    then:
    println changes.prettyPrint()
    assert changes.size() == 4
    assert javers.findSnapshots(query).size() == 2
}
```

the query result:

```text
Changes:
Commit 4.0 done by Pam at 14 Apr 2018, 11:59:35 :
* changes on Employee/bob :
  - 'age' changed from '31' to '32'
  - 'salary' changed from '1100' to '1200'
Commit 2.0 done by Pam at 14 Apr 2018, 11:59:35 :
* changes on Employee/bob :
  - 'age' changed from '29' to '30'
  - 'salary' changed from '900' to '1000'

```

<h3 id="commit-property-filter">CommitProperty filter</h3>
Commit property filter is an optional parameter for all queries.
It allows you to find changes (or snapshots) persisted with a given commit property.
Single query can specify more than one commit property.
In this case, each given commit property must match with a persisted one.

In the example, objects are committed with two properties: `tenant` and `event`.
Then we retrieve only the changes concerning promotions within the ACME tenant.

```groovy
def "should query for changes (and snapshots) with commit property filters"() {
    given:
    def javers = JaversBuilder.javers().build()

    def bob = new Employee(name: "bob", position: "Assistant", salary: 900)
    javers.commit( "author", bob, ["tenant": "ACME", "event": "birthday"] )
    bob.position = "Specialist"
    bob.salary = 1600
    javers.commit( "author", bob, ["tenant": "ACME", "event": "promotion"] )

    def pam = new Employee(name: "pam", position: "Secretary", salary: 1300)
    javers.commit( "author", pam, ["tenant": "Dunder Mifflin", "event": "hire"] )
    bob.position = "Saleswoman"
    bob.salary = 1700
    javers.commit( "author", pam, ["tenant": "Dunder Mifflin", "event": "promotion"] )

    when:
    def query = QueryBuilder.anyDomainObject()
        .withCommitProperty("tenant", "ACME")
        .withCommitProperty("event", "promotion").build()
    Changes changes = javers.findChanges( query )

    then:
    println changes.prettyPrint()
    assert changes.size() == 2
    assert javers.findSnapshots(query).size() == 1
}
```

the query result:

```text
Changes:
Commit 2.0 done by author at 14 Apr 2018, 12:00:34 :
* changes on Employee/bob :
  - 'position' changed from 'Assistant' to 'Specialist'
  - 'salary' changed from '900' to '1600'
```

Note that when you are using JaVers’ [auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect)
with Spring Data `CrudRepositories` you can still provide commit properties by implementing
the [CommitPropertiesProvider](/documentation/spring-integration/#commit-properties-provider-bean) bean.
 

<h3 id="commit-date-filter">CommitDate filter</h3>
CommitDate filter is an optional parameter for all queries.
It allows time range filtering by `commitDate` (Snapshot creation timestamp).

This example requires a trick to simulate time flow.
We use `FakeDateProvider`, which is stubbed to provide concrete dates as `now()`.
Bob is committed six times in one-year intervals.
Then we query for changes made over a three-years period.

```groovy
def "should query for changes (and snapshots) with commitDate filter"(){
  given:
  def fakeDateProvider = new FakeDateProvider()
  def javers = JaversBuilder.javers().withDateTimeProvider(fakeDateProvider).build()

  (0..5).each{ i ->
      def now = ZonedDateTime.of(2015+i,01,1,0,0,0,0, ZoneId.of("UTC"))
      fakeDateProvider.set( now )
      def bob = new Employee(name:"bob", age:20+i)
      javers.commit("author", bob)
      println "comitting bob on $now"
  }

  when:
  def query = QueryBuilder.byInstanceId("bob", Employee.class)
          .from(new LocalDate(2016,01,1))
          .to  (new LocalDate(2018,01,1)).build()
  Changes changes = javers.findChanges( query )

  then:
  println changes.prettyPrint()
  assert changes.size() == 3
  assert javers.findSnapshots(query).size() == 3
}
```

the output:

```text
comitting bob on 2015-01-01
comitting bob on 2016-01-01
comitting bob on 2017-01-01
comitting bob on 2018-01-01
comitting bob on 2019-01-01
comitting bob on 2020-01-01
Changes:
Commit 4.0 done by author at 01 Jan 2018, 00:00:00 :
* changes on Employee/bob :
  - 'age' changed from '22' to '23'
Commit 3.0 done by author at 01 Jan 2017, 00:00:00 :
* changes on Employee/bob :
  - 'age' changed from '21' to '22'
Commit 2.0 done by author at 01 Jan 2016, 00:00:00 :
* changes on Employee/bob :
  - 'age' changed from '20' to '21'
```

<h3 id="commit-id-filter">CommitId filter</h3>
CommitId filter is an optional parameter for all queries.
It lets you to find changes (or snapshots) persisted within a particular commit.
The commit id can be supplied as a `CommitId` instance or `BigDecimal`.

In the example we commit three subsequent versions of two Employees
and then we retrieve the changes done in the third commit only.
Note that CommitId is global in the JaversRepository context
(as opposed to [version](#version-filter)).

```groovy
def "should query for changes (and snapshots) with commitId filter"(){
    given:
    def javers = JaversBuilder.javers().build()

    (1..3).each {
        javers.commit("author", new Employee(name:"john", age:20+it))
        javers.commit("author", new Employee(name:"bob",  age:20+it))
    }

    when:
    def query = QueryBuilder.byInstanceId("bob", Employee.class )
            .withCommitId( CommitId.valueOf(4) ).build()
    Changes changes = javers.findChanges(query)

    then:
    println changes.prettyPrint()
    assert changes.size() == 1
    assert changes[0].left == 21
    assert changes[0].right == 22
    assert javers.findSnapshots(query).size() == 1
}
```

the query result:

```text
Changes:
Commit 4.0 done by author at 14 Apr 2018, 12:04:54 :
* changes on Employee/bob :
  - 'age' changed from '21' to '22'
```

<h3 id="version-filter">Snapshot version filter</h3>
Version filter is similar to the [CommitId filter](#commit-id-filter),
it lets you to find changes (or snapshots) for a concrete object version.

The Snapshot version is local for each object stored in the JaversRepository
(as opposed to CommitId, which is the global identifier).
When an object is committed for the first time, it has version 1.
In the next commit it gets version 2 and so on.

In the example we commit five versions of two Employees: `john` and `bob`.
Then then we retrieve the fourth version of `bob`.

```groovy
def "should query for changes (and snapshots) with version filter"(){
    given:
    def javers = JaversBuilder.javers().build()

    (1..5).each {
        javers.commit("author", new Employee(name: "john",age: 20+it))
        javers.commit("author", new Employee(name: "bob", age: 20+it))
    }

    when:
    def query = QueryBuilder.byInstanceId("bob", Employee.class).withVersion(4).build()
    Changes changes = javers.findChanges( query )

    then:
    println changes.prettyPrint()
    assert changes.size() == 1
    assert changes[0].left == 23
    assert changes[0].right == 24
    assert javers.findSnapshots(query).size() == 1
}
```

the query result:

```text
Changes:
Commit 8.0 done by author at 14 Apr 2018, 12:06:01 :
* changes on Employee/bob :
  - 'age' changed from '23' to '24'
```

<h3 id="child-value-objects-filter">ChildValueObjects filter</h3>

When this filter is enabled, all child Value Objects owned by selected Entities
are included in a query scope.

`ChildValueObjects` filter can be used only for Entity queries:
`byInstanceId()` and `byClass()`.

In the example we are creating an employee (Entity)
with two addresses (child Value Objects).
Then we are changing employee’s age and one of his addresses.
Query with `childValueObjects` filter is run and both age and address changes are selected.
Since there are no other employees in our repository, `byInstanceId()` and `byClass()` queries return the same result.

Let’s see how it works:

```groovy
def "should query for changes made on Entity and its ValueObjects by InstanceId and Class"(){
  given:
  def javers = JaversBuilder.javers().build()

  def bob = new Employee(name:"bob", age:30, salary: 1000,
          primaryAddress: new Address(city:"Paris"),
          postalAddress: new Address(city:"Paris"))
  javers.commit("author", bob)

  bob.age = 31
  bob.primaryAddress.city = "London"
  javers.commit("author", bob)

  when: "query by instance Id"
  def query = QueryBuilder.byInstanceId("bob", Employee.class).withChildValueObjects().build()
  Changes changes = javers.findChanges( query )

  then:
  println changes.prettyPrint()
  assert changes.size() == 8

  when: "query by Entity class"
  query = QueryBuilder.byClass(Employee.class).withChildValueObjects().build()
  changes = javers.findChanges( query )

  then:
  assert changes.size() == 8
}
```

the query result:

```text
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:20:41 :
* changes on Employee/bob :
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:20:41 :
* new object: Employee/bob
  - 'age' = '30'
  - 'name' = 'bob'
  - 'salary' = '1000'
  
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:20:41 :
* changes on Employee/bob :
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:20:41 :
* new object: Employee/bob  
```

Results are similar when the child Value Objects filter is applied to a Snapshot query.
Snapshots of **changed** child Value Objects are returned together with the owning Entity snapshot.

<h3 id="initial-changes-filter">Initial Changes switch</h3>
This switch affects queries for Changes and also `javers.compare()`.
Since Javers 6.0, the Initial Changes switch
is controlled on the Javers instance level
by `JaversBuilder.withInitialValueChanges()` and it is **enabled by default**.

When the switch is enabled, Javers generates additional set of Initial Changes for each
property of a NewObject to capture its state.
Internally, Javers generates Initial Changes by comparing a virtual, totally empty object
with a real NewObject.

Let’s see how the Initial Changes switch works when on and off:

```groovy
def "should query for changes with/without InitialValueChanges"() {
  when:
  def javers = JaversBuilder.javers().build()

  javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
  javers.commit( "author", new Employee(name:"bob", age:30, salary: 1200) )

  Changes changes = javers
          .findChanges( QueryBuilder.byInstanceId("bob", Employee.class).build() )

  then:
  println "with InitialValueChanges:"
  println changes.prettyPrint()
  assert changes.size() == 5

  when:
  javers = JaversBuilder.javers()
          .withInitialValueChanges(false).build() // !

  javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
  javers.commit( "author", new Employee(name:"bob", age:30, salary: 1200) )

  changes = javers
          .findChanges( QueryBuilder.byInstanceId("bob", Employee.class).build() )

  then:
  println "without InitialValueChanges:"
  println changes.prettyPrint()
  assert changes.size() == 2
```

the query results:

```text
with InitialValueChanges:
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:22:34 :
* changes on Employee/bob :
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:22:34 :
* new object: Employee/bob
  - 'age' = '30'
  - 'name' = 'bob'
  - 'salary' = '1000'

without InitialValueChanges:
Changes:
Commit 2.00 done by author at 16 Mar 2021, 22:22:34 :
* changes on Employee/bob :
  - 'salary' changed: '1000' -> '1200'
Commit 1.00 done by author at 16 Mar 2021, 22:22:34 :
* new object: Employee/bob
```

<h2 id="entity-refactoring">Refactoring Entities with @TypeName</h2>

Mature persistence frameworks allow you to refactor your domain classes
without losing a connection between old (possibly removed)
and new Class versions. For example,
JPA allows you to specify `@Entity` name
and Spring Data uses `@TypeAlias` annotation.

JaVers has
[`@TypeName`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/TypeName.java)
annotation. Use it to give stable names for your Entities.
Type name is used as a Class identifier instead of a fully-qualified Class name.

**What’s important**<br/>
We encourage you to use explicit Type names for all Entities &mdash; it will make your
life easier in case of refactoring.

When an Entity has a Type name, you can rename it or move it to another package safely.
Without it, refactoring may break your queries.

**Simple example** <br/>
Let’s consider refactoring of the `Person` Entity.
After persisting some commits in JaversRepository, we decide to change the Class name.
Moreover, the renamed Class
has some properties added/removed. The second commit is persisted,
using the new Class definition: `PersonRefactored`.

Old class:

```groovy
@TypeName("Person")
class Person {
    @Id
    int id

    String name

    Address address
}
```

New class:

```groovy
@TypeName("Person")
class PersonRefactored {
    @Id
    int id

    String name

    String city
}
```

Since `@TypeName` annotation was engaged from the very beginning,
our JQL just works. See the following Spock test:

```groovy
def '''should allow Entity class name change
       when both old and new class use @TypeName annotation'''()
{
    given:
    def javers = JaversBuilder.javers().build()
    javers.commit('author', new Person(id:1, name:'Bob'))
    
    when: '''Refactoring happens here, Person.class is removed,
             new PersonRefactored.class appears'''
    javers.commit('author', new PersonRefactored(id:1, name:'Uncle Bob', city:'London'))
    
    def changes =
            javers.findChanges( QueryBuilder.byInstanceId(1, PersonRefactored.class).build() )
    println changes.prettyPrint()
    
    then: 'three ValueChanges and one NewObject change is expected'
    assert changes.size() == 4
    
    changes.each { assert it.affectedGlobalId.value() == 'Person/1' }
}
```

Output:

```txt
Changes:
Commit 2.00 done by author at 28 Feb 2021, 12:44:45 :
* changes on Person/1 :
  - 'city' value changed from '' to 'London'
  - 'name' value changed from 'Bob' to 'Uncle Bob'
Commit 1.00 done by author at 28 Feb 2021, 12:44:45 :
* new object: Person/1
* changes on Person/1 :
  - 'name' value changed from '' to 'Bob'
```

As you can see, both `Person(id:1)` and `PersonRefactored(id:1)`
objects share the same GlobalId &mdash; `'Person/1'`, so they match perfectly.

**I forgot about @TypeName...** <br/>
What if I forgot to use @TypeName, but my objects are already persisted
in a JaversRepository and I need to refactor now?

There are two possible solutions. The first is elegant but requires more work,
the second is quick but somewhat dirty.

* Add @TypeName with a target name to a new class and update (manually)
a database which underlies your JaversRepository.
* Add @TypeName to a new class and set typeName as a copy of an old class’ fully-qualified name.

Let’s see how the second approach works:


Old class:

```groovy
class PersonSimple {
    @Id
    int id

    String name
}
```

New class:

```groovy
@TypeName("org.javers.core.examples.PersonSimple")
class PersonRetrofitted {
    @Id
    int id

    String name
}
```

And the Spock test:

```groovy
def '''should allow Entity class name change
       when old class forgot to use @TypeName annotation'''()
{
  given:
  def javers = JaversBuilder.javers().build()
  javers.commit('author', new PersonSimple(id:1, name:'Bob'))

  when:
  javers.commit('author', new PersonRetrofitted(id:1, name:'Uncle Bob'))

  def changes =
          javers.findChanges( QueryBuilder.byInstanceId(1,PersonRetrofitted.class).build() )
  println changes.prettyPrint()

  then: 'two ValueChange and one NewObject change is expected'
  assert changes.size() == 3
  with(changes[0]){
    assert left == 'Bob'
    assert right == 'Uncle Bob'
    assert affectedGlobalId.value() == 'org.javers.core.examples.PersonSimple/1'
  }
}
```

Output:

```txt
Changes:
Commit 2.00 done by author at 28 Feb 2021, 12:51:48 :
* changes on org.javers.core.examples.PersonSimple/1 :
  - 'name' value changed from 'Bob' to 'Uncle Bob'
Commit 1.00 done by author at 28 Feb 2021, 12:51:48 :
* new object: org.javers.core.examples.PersonSimple/1
* changes on org.javers.core.examples.PersonSimple/1 :
  - 'name' value changed from '' to 'Bob'
```

In this case, both `PersonSimple(id:1)` and `PersonRetrofitted(id:1)` objects share the same GlobalId
— `'org.javers.core.examples.PersonSimple/1'`.
They match but, well, it’s not very nice to have deprecated names in new code.

<h2 id="value-object-refactoring">Free ValueObjects refactoring</h2>

In most cases you don’t have to use @TypeName for ValueObjects.
Most JQL queries will just work after refactoring.
However, we still recommend to adding @TypeName.
For example, querying by ValueObject class relies on it.

JaVers treats ValueObjects as property containers and doesn’t care much about their classes.
This approach is known as Duck Typing, and is widely adopted by dynamic languages like Groovy.

**Example** <br/>
Let’s consider the refactoring of Person’s address,
which happened to be a ValueObject.
We want to change its type from `EmailAddress` to `HomeAddress`,

For the sake of brevity, we use the abstract `Address` class
in the Person definition (owner Entity), so we don’t need to change it after the type of Address is altered.

```groovy
abstract class Address {
    boolean verified

    Address(boolean verified) {
        this.verified = verified
    }
}

class EmailAddress extends Address {
    String email

    EmailAddress(String email, boolean verified) {
        super(verified)
        this.email = email
    }
}

class HomeAddress extends Address {
    String city
    String street

    HomeAddress(String city, String street, boolean verified) {
        super(verified)
        this.city = city
        this.street = street
    }
}
```

The Person class is the same like in the [Refactoring Entities](#entity-refactoring) example.

The first version of Person is persisted with `EmailAddress` and then
another two versions are persisted with `HomeAddress` as the type:

```groovy
def 'should be very relaxed about ValueObject types'(){
  given:
  def javers = JaversBuilder.javers().build()
  javers.commit('author', new Person(id:1, address:new EmailAddress('me@example.com', false)))
  javers.commit('author', new Person(id:1, address:new HomeAddress ('London','Green 50', true)))
  javers.commit('author', new Person(id:1, address:new HomeAddress ('London','Green 55', true)))

  when:
  def changes =
          javers.findChanges( QueryBuilder.byValueObjectId(1, Person.class, 'address').build() )
  println changes.prettyPrint()

  then: 'six ValueChanges are expected'
  assert changes.size() == 6
  assert changes.collect{ it.propertyName } as Set ==
          ['street','verified','city','email'] as Set
}
```

Output:

```text
Changes:
Commit 3.00 done by author at 28 Feb 2021, 12:56:17 :
* changes on Person/1 :
  - 'address.street' value changed from 'Green 50' to 'Green 55'
Commit 2.00 done by author at 28 Feb 2021, 12:56:17 :
* changes on Person/1 :
  - 'address.city' value changed from '' to 'London'
  - 'address.email' value changed from 'me@example.com' to ''
  - 'address.street' value changed from '' to 'Green 50'
  - 'address.verified' value changed from 'false' to 'true'
Commit 1.00 done by author at 28 Feb 2021, 12:56:17 :
* changes on Person/1 :
  - 'address.email' value changed from '' to 'me@example.com'
```

As you can see, all three versions of the ValueObject address share the same GlobalId
— `'Person/1#address'`. Properties are matched by name, and their values are compared
without paying much attention to the actual Address class.