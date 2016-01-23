---
layout: docs
title: JQL (JaVers Query Language) examples 
submenu: jql-examples
---

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```
./gradlew javers-core:example -Dtest.single=JqlExample
./gradlew javers-core:example -Dtest.single=RefactoringExample
```

## Overview
JQL (JaVers Query Language) is a simple, fluent API
which allows you to query JaversRepository for changes of a given class, object or property.

It’s not such a powerful language like SQL because it’s a kind of abstraction over native languages
used by concrete JaversRepository implementations (like SQL, MongoDB).
 
**The case** <br/> 
In this example we show all types of JQL queries.
This time, we use [Groovy](http://groovy-lang.org/style-guide.html) and [Spock](https://code.google.com/p/spock/)
as these languages are far more readable for BDD-style tests than Java.

Groovy is a nice, dynamic language, runnable on JVM
and Spock is our tool of choice for TDD. We really like it so this is also a chance to
encourage you to switch from JUnit to Spock.

**What’s important** <br/> 
Data history can be fetched from JaversRepository in two views — changes and snapshots.

For changes use
[javers.findChanges(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findChanges-org.javers.repository.jql.JqlQuery-)
and for snapshots use 
[javers.findSnapshots(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findSnapshots-org.javers.repository.jql.JqlQuery-)

Both methods understand the same JQL API,
so you can use the same query object to get changes and snapshots views.

**Table of Contents** <br/>
There are three types of queries: 

* query for [Entity](#instance-id-query) changes by Instance Id,
* query for [ValueObject](#by-value-object-query) changes,
* query for any object changes [by class of object](#by-class-query).

Queries can have one or more optional [filters](#query-filters):

* [property](#property-filter),
* [limit](#limit-filter), 
* [skip](#skip-filter),
* [commitDate](#commit-date-filter),
* [commitId](#commit-id-filter),
* [newObject changes](#new-object-filter).

JQL can adapt when you refactor your domain classes:

* refactoring [Entities](#entity-refactoring) with `@TypeName`,
* free refactoring of [ValueObjects](#value-object-refactoring). 


Let’s see how to run simple query for changes.
 
<h2 id="instance-id-query">Querying for Entity changes by Instance Id</h2>
This query selects changes made on concrete [Entity](/documentation/domain-configuration/#entity) instance.
The query accepts two mandatory parameters:
 
* `Object localId` &mdash; expected Instance Id, 
* `Class entityClass` &mdash; expected Entity class.

Here is the Groovy snippet, to change it to Java just add semicolons and switch defs to types. 

```groovy
def "should query for Entity changes by instance Id"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit("author", new Employee(name:"bob", age:30, salary:1000) )
    javers.commit("author", new Employee(name:"bob", age:31, salary:1200) )
    javers.commit("author", new Employee(name:"john",age:25) )

    when:
    def changes = javers.findChanges( QueryBuilder.byInstanceId("bob", Employee.class).build() )

    then:
    printChanges(changes)
    assert changes.size() == 2
}
```    

query result:

```
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'1000', newVal:'1200'}
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'30', newVal:'31'}
```

<h2 id="by-value-object-query">Querying for ValueObject changes</h2>
This query selects changes made on a concrete [ValueObject](/documentation/domain-configuration/#value-object)
(so a ValueObject owned by a concrete Entity instance)
or changes made on all ValueObjects owned by any instance of a given Entity.

When querying for ValueObjects you should keep in mind that ValueObjects,
by definition, don’t have their own identifiers. We identify them by providing
the owning Entity Instance Id and a property name.
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

    when: "query for ValueObject changes by owning Entity instance Id"
    def changes = javers
        .findChanges( QueryBuilder.byValueObjectId("bob",Employee.class,"primaryAddress").build())

    then:
    printChanges(changes)
    assert changes.size() == 1

    when: "query for ValueObject changes by owning Entity class"
    changes = javers
        .findChanges( QueryBuilder.byValueObject(Employee.class,"primaryAddress").build())

    then:
    printChanges(changes)
    assert changes.size() == 2
}
```

result of `"query for ValueObject changes by owning Entity instance Id"`:

```
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob#primaryAddress', property:'city', oldVal:'London', newVal:'Paris'}
```

result of `query for ValueObject changes by owning Entity class`:

```
commit 5.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/lucy#primaryAddress', property:'city', oldVal:'New York', newVal:'Washington'}
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob#primaryAddress', property:'city', oldVal:'London', newVal:'Paris'}
```

<h2 id="by-class-query">Querying for any object changes by class of object</h2>
This query is a kind of shotgun approach. The only mandatory parameter is a class.
It selects objects regardless of theirs JaversType and
can be used for Entities, ValueObjects and UnboundedValueObjects. 

This query is useful for selecting UnboundedValueObjects (ValueObjects without an owning Entity)
and also for ValueObjects when we don’t care about the owning Entity and path.

In the example, we show how to query for changes made on 
ValueObjects owned by two different Entities.

```groovy
def "should query for Object changes by its class"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit("author", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "London")))
    javers.commit("author", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "Paris")))
    javers.commit("author", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "New York")))
    javers.commit("author", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "Washington")))

    when:
    def changes = javers.findChanges( QueryBuilder.byClass(DummyAddress.class).build() )

    then:
    printChanges(changes)
    assert changes.size() == 2
}
```

query result:

```
commit 4.0: ValueChange{globalId:'org.javers.core.model.SnapshotEntity/2#valueObjectRef', property:'city', oldVal:'New York', newVal:'Washington'}
commit 2.0: ValueChange{globalId:'org.javers.core.model.DummyUserDetails/1#dummyAddress', property:'city', oldVal:'London', newVal:'Paris'}
```

<h2 id="query-filters">Query filters</h2>
For each query you can add one or more optional filters:
[property](#property-filter),
[limit](#limit-filter), 
[skip](#skip-filter), 
[commitDate](#commit-date-filter) and  
[newObject changes](#new-object-filter) filter.

<h3 id="property-filter">Property filter</h3>
Optional parameter for all queries.
Use it to filter query results to changes made on a concrete property.

In the example, we show how to query for Employee’s salary changes,
while ignoring changes made on other properties.

```groovy
def "should query for Entity changes by instance Id with property filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:30, salary:1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary:1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary:1200) )

    when:
    def changes = javers.findChanges( QueryBuilder.byInstanceId("bob", Employee.class)
       .andProperty("salary").build() )

    then:
    printChanges(changes)
    assert changes.size() == 1
}
```

query result:

```
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'30', newVal:'31'}
```

<h3 id="limit-filter">Limit filter</h3>
Optional parameter for all queries, default limit is 100.
It simply limits the number of snapshots to be read from JaversRepository.
Always choose reasonable limits to improve performance of your queries and to save server heap size.
When querying for changes, limit `n` means: give me changes recorded for last `n` snapshots.

In the example we set limit to 3 so only Bob’s last 3 snapshots are being compared,
which means 4 changes (two changes between fourth and third commit and two changes between third and second commit). 

```groovy
def "should query for changes with limit filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:29) )
    javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary: 1100) )
    javers.commit( "author", new Employee(name:"bob", age:32, salary: 1200) )

    when:
    def changes = javers
        .findChanges( QueryBuilder.byInstanceId("bob", Employee.class).limit(3).build() )

    then:
    printChanges(changes)
    assert changes.size() == 4
}
```

query result:

```text
commit 4.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'1100', newVal:'1200'}
commit 4.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'31', newVal:'32'}
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'1000', newVal:'1100'}
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'30', newVal:'31'}
```

<h3 id="skip-filter">Skip filter</h3>
Optional parameter for all queries (default skip is 0).
When querying for snapshots, it defines the offset of the first result that JaVers should return.

When querying for changes, skip means exactly the same:
omit changes recorded in last snapshots and return the previous ones.
Skip and limit parameters can be useful for implementing pagination.

In the example we set skip to 1 so only Bob’s first 3 snapshots are being compared,
which means four changes
(two changes between third and second commit and two changes between second and first commit).

```groovy
def "should query for changes with skip filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:29, salary: 900) )
    javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary: 1100) )
    javers.commit( "author", new Employee(name:"bob", age:32, salary: 1200) )

    when:
    def changes = javers
        .findChanges( QueryBuilder.byInstanceId("bob", Employee.class).skip(1).build() )

    then:
    printChanges(changes)
    assert changes.size() == 4
}
```

query result:

```text
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'1000', newVal:'1100'}
commit 3.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'30', newVal:'31'}
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'900', newVal:'1000'}
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'29', newVal:'30'}
```

<h3 id="commit-date-filter">CommitDate filter</h3>
Optional parameter for all queries.
It allows time range filtering by `commitDate` (Snapshot creation timestamp).

This example requires some trick to simulate time flow.
We use `FakeDateProvider`, which is stubbed to provide concrete dates as `now()`.   
Bob is committed six times in one year intervals.
Then we query for changes done in three years period.

```groovy
def "should query for changes with commitDate filter"(){
  given:
  def fakeDateProvider = new FakeDateProvider()
  def javers = JaversBuilder.javers().withDateTimeProvider(fakeDateProvider).build()

  (0..5).each{ i ->
      def now = new LocalDate(2015+i,01,1)
      fakeDateProvider.set( now )
      def bob = new Employee(name:"bob", age:20+i)
      javers.commit("author", bob)
      println "comitting bob on $now"
  }

  when:
  def changes = javers
          .findChanges( QueryBuilder.byInstanceId("bob", Employee.class)
          .from(new LocalDate(2016,01,1))
          .to  (new LocalDate(2018,01,1)).build() )

  then:
  assert changes.size() == 2

  println "found changes:"
  changes.each {
      println "commitDate: "+ it.commitMetadata.get().commitDate+" "+it
  }
}
```

output:

```text
comitting bob on 2015-01-01
comitting bob on 2016-01-01
comitting bob on 2017-01-01
comitting bob on 2018-01-01
comitting bob on 2019-01-01
comitting bob on 2020-01-01
found changes:
commitDate: 2018-01-01T00:00:00.000 ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'22', newVal:'23'}
commitDate: 2017-01-01T00:00:00.000 ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'21', newVal:'22'}

```

One can ask why change made on 2016-01-01 is not selected.
It’s not a bug, both `from()` and `to()` filters works inclusively
(like `between` in SQL).
Explanation is simple, JaversRepository stores only Snapshots.
Changes are calculated on the fly, as a diff between subsequent Snapshots
fetched from the repository.
We have three Snapshots committed between 2016-01-01 and 2018-01-01
so only two changes are returned.

<h3 id="commit-id-filter">CommitId filter</h3>
Optional filter which by default is disabled. It allows finding snapshots persisted
on a specific commit having a given id. The commit id can be supplied as an instance of
CommitId or BigDecimal. On the other hand using this filter when querying for changes
makes no sense because the result will always be empty.

In the example we commit three subsequent versions of Employee and then retrieve
snapshots from the second commit.

```groovy
def "should query for snapshots with commitId filter"(){
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:29, salary: 900) )
    def secondCommit =
        javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary: 1100) )

    when:
    def snapshots = javers
        .findSnapshots( QueryBuilder.byInstanceId("bob", Employee.class)
        .withCommitId(secondCommit.id).build() )

    then:
    assert snapshots.size() == 1

    println "found snapshots:"
    snapshots.each {
        println "commit ${it.commitMetadata.id}: ${it} (" +
            "age: ${it.getPropertyValue('age')}, " +
            "salary: ${it.getPropertyValue('salary')})"
    }
}
```

query result:

```text
found snapshots:
commit 2.0: org.javers.core.examples.model.Employee/bob (age: 30, salary: 1000)
```

<h3 id="new-object-filter">NewObject changes filter</h3>
This filter only affects queries for changes, by default it’s disabled.
When enabled, a query produces additional changes for initial snapshots.
An initial snapshot is taken when an object is committed to JaversRepository for the first time.

With this filter, you can query for the initial state of an object.
It’s represented as a NewObject change, followed by a list of property changes from null to something.

Let’s see how it works in the example:

```groovy
def "should query for changes with NewObject filter"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:30, salary: 1000) )
    javers.commit( "author", new Employee(name:"bob", age:30, salary: 1200) )

    when:
    def changes = javers
        .findChanges( QueryBuilder.byInstanceId("bob", Employee.class)
        .withNewObjectChanges(true).build() )

    then:
    printChanges(changes)
    assert changes.size() == 5
    assert changes[4] instanceof NewObject
}
```

query result:

```text
commit 2.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'1000', newVal:'1200'}
commit 1.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'name', oldVal:'', newVal:'bob'}
commit 1.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'salary', oldVal:'0', newVal:'1000'}
commit 1.0: ValueChange{globalId:'org.javers.core.examples.model.Employee/bob', property:'age', oldVal:'0', newVal:'30'}
commit 1.0: NewObject{globalId:'org.javers.core.examples.model.Employee/bob'}
```
 
<h2 id="entity-refactoring">Refactoring Entities with @TypeName</h2>
 
Mature persistence frameworks allow you to refactor your domain classes
without losing a connection between old (possibly removed)
and new Class versions. For example,
JPA allows you to specify `@Entity` name
and Spring Data uses `@TypeAlias` annotation.

JaVers has
[`@TypeName`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/annotation/TypeName.html)
annotation and uses its value as a Class identifier
instead of a fully-qualified Class name.

**What’s important**<br/>
We encourage you to use @TypeName annotation for all Entities &mdash; it will make your
life easier in case of refactoring.

When an Entity has @TypeName, you can rename it or move it to another package safely.
Without it, refactoring may break your queries.

**Simple example** <br/>
Let’s consider the refactoring of a `Person` Entity.
After persisting some commits in JaversRepository, we decide to change the class name.
Moreover, the renamed class
has some properties added/removed. The second commit is persisted,
using the new class definition: `PersonRefactored`. 

`Person.class`:

```java
package org.javers.core.examples;

import org.javers.core.metamodel.annotation.Id;
import org.javers.core.metamodel.annotation.TypeName;

@TypeName("Person")
class Person {
    @Id
    private int id;

    private String name;

    private Address address;
}
```

`PersonRefactored.class`:
 
```java
package org.javers.core.examples;

import org.javers.core.metamodel.annotation.Id;
import org.javers.core.metamodel.annotation.TypeName;

@TypeName("Person")
class PersonRefactored {
    @Id
    private int id;

    private String name;

    private String city;
}
```

As `@TypeName` annotation was engaged from the very beginning,
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
        javers.findChanges( QueryBuilder.byInstanceId(1,PersonRefactored.class).build() )

    then: 'one ValueChange is expected'
    assert changes.size() == 1
    with(changes[0]){
        assert left == 'Bob'
        assert right == 'Uncle Bob'
        assert affectedGlobalId.value() == 'Person/1'
    }
    println changes[0]
}
```
 
As you can see, both `Person(id:1)` and `PersonRefactored(id:1)`
objects share the same GlobalId &mdash; `'Person/1'`, so they match perfectly.

**I forgot about @TypeName example** <br/> 
What if I forgot to use @TypeName, but my objects are already persisted
in JaversRepository
and I need to refactor now?

There are two possible solutions. The first is elegant but requires more work,
the second is quick but somewhat dirty.

* Add @TypeName with a target name to a new class and update (manually)
a database which underlies your JaversRepository.
* Add @TypeName to a new class and set typeName as a copy of an old class’ fully-qualified name.

Let’s see how the second approach works:


Old class:

```java
package org.javers.core.examples;

import org.javers.core.metamodel.annotation.Id;

class PersonSimple {
    @Id
    private int id;

    private String name;
}

```

New class:

```java
package org.javers.core.examples;

import org.javers.core.metamodel.annotation.Id;
import org.javers.core.metamodel.annotation.TypeName;

@TypeName("org.javers.core.examples.PersonSimple")
class PersonRetrofitted {
    @Id
    private int id;

    private String name;
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

  then: 'one ValueChange is expected'
  assert changes.size() == 1
  with(changes[0]){
      assert left == 'Bob'
      assert right == 'Uncle Bob'
      assert affectedGlobalId.value() == 'org.javers.core.examples.PersonSimple/1'
  }
  println changes[0]
}
```

In this case, `PersonSimple(id:1)` and `PersonRetrofitted(id:1)` objects share the same GlobalId
— `'org.javers.core.examples.PersonSimple/1'`.
They match but, well, it’s not very nice to have deprecated names in new code.
 
<h2 id="value-object-refactoring">Free ValueObjects refactoring</h2>

In most cases you don’t have to use @TypeName for ValueObjects.
Most JQL queries will just work after refactoring.
However, we still recommend to adding @TypeName.
For example, querying by ValueObject class relies on it.   
  
JaVers treats ValueObjects as property containers and doesn’t care much about their classes.
This approach is known us Duck Typing, and is widely adopted by dynamic languages like Groovy.

**Example** <br/>
Let’s consider the refactoring of Person’s address,
which happened to be a ValueObject.
We want to change its type from `EmailAddress` to `HomeAddress`, 

For the sake of brevity, we use the abstract `Address` class 
in the Person definition (owner Entity), so we don’t need to change it after the type of Address is altered.

Abstract `Address.class`:

```java
package org.javers.core.examples;

abstract class Address {
    private boolean verified;

    Address(boolean verified) {
        this.verified = verified;
    }
}
```

`EmailAddress.class`

```java
package org.javers.core.examples;

class EmailAddress extends Address {
    private String email;

    EmailAddress(String email, boolean verified) {
        super(verified);
        this.email = email;
    }
```

`HomeAddress.class`

```java
package org.javers.core.examples;

class HomeAddress extends Address {
    private String city;
    private String street;

    HomeAddress(String city, String street, boolean verified) {
        super(verified);
        this.city = city;
        this.street = street;
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
  javers.commit('author', new Person(1,new EmailAddress('me@example.com', false)))
  javers.commit('author', new Person(1,new HomeAddress ('London','Green 50', true)))
  javers.commit('author', new Person(1,new HomeAddress ('London','Green 55', true)))

  when:
  def changes =
      javers.findChanges( QueryBuilder.byValueObjectId(1, Person.class, 'address').build() )

  then: 'three ValueChanges are expected'
  assert changes.size() == 3
  assert changes.collect{ it.propertyName }.containsAll( ['street','verified','email'] )
  
  changes.each { println it }
}
```

Test output:

```text
ValueChange{globalId:'Person/1#address', property:'street', oldVal:'Green 50', newVal:'Green 55'}
ValueChange{globalId:'Person/1#address', property:'email', oldVal:'me@example.com', newVal:''}
ValueChange{globalId:'Person/1#address', property:'verified', oldVal:'false', newVal:'true'}
```

As you can see, all three versions of the ValueObject address share the same GlobalId
— `'Person/1#address'`. Properties are matched by name, and their values are compared,
without paying much attention to the actual Address class.