---
layout: docs
title: Documentation — JQL (JaVers Query Language) examples 
submenu: jql-examples
---

# JQL (JaVers Query Language) examples 

JQL (JaVers Query Language) is a simple, fluent API
which allows you to query JaversRepository for changes of a given class, object or property.

It’s not such a powerful language like SQL because it’s a kind of abstraction over native languages
used by concrete JaversRepository implementations (like SQL, MongoDB).
 
**The case** <br/> 
In this example we show all types of JQL queries.
This time, we use [Groovy](http://groovy-lang.org/style-guide.html) and [Spock](https://code.google.com/p/spock/)
as it’s far more readable for data-driven test than Java.

Groovy is a nice, dynamic language, runnable on JVM
and Spock is our tool of choice for TDD. We really like it so it would be a chance to
encourage you to switch from JUnit to Spock.

**What’s important** <br/> 
Data history can be fetched from JaversRepository in two views — changes and snapshots.

For changes use
[javers.findChanges(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findChanges-org.javers.repository.jql.JqlQuery-)
and for snapshots use 
[javers.findSnapshots(JqlQuery)]({{ site.javadoc_url }}org/javers/core/Javers.html#findSnapshots-org.javers.repository.jql.JqlQuery-)

Both methods understand the same JQL API,
so you can use the same query object to get changes and snapshots views.

**Big Picture** <br/>
There are three types of queries: 

* query for [Entity](#instance-id-query) changes by Instance Id,
* query for [ValueObject](#by-value-object-query) changes,
* query for any object changes [by its class](#by-class-query).

For each query you can add one or more optional filters:

* [property](#property-filter) filter,
* [limit](#limit-filter) filter, 
* [NewObject changes](#new-object-filter) filter.

Let’s see how to query for changes.
 
<h2 id="instance-id-query">Querying for Entity changes by instance Id</h2>
This query selects changes done on concrete [Entity](/documentation/domain-configuration/#entity) instance.
Query accepts two mandatory parameters:
 
* `Object localId` &mdash; expected instance Id, 
* `Class entityClass` &mdash; expected Entity class.

Here is the Groovy snippet, to change it to Java just add semicolons and switch defs to types. 

```groovy
def "should query for Entity changes by instance Id"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob", age:30, salary:1000) )
    javers.commit( "author", new Employee(name:"bob", age:31, salary:1200) )
    javers.commit( "author", new Employee(name:"john",age:25) )

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
This query select changes done on a concrete [ValueObject](/documentation/domain-configuration/#value-object)
(so a ValueObject owned by a concrete Entity instance)
or changes done on all ValueObjects owned by any instance of a given Entity.

When querying for ValueObjects you should keep in mind that ValueObjects,
by definition don’t have their own identifiers. We identify them by providing
owning Entity instance Id and a property name.
So in this case, the property name serves as a sort of path.

Let’s see how it works:

```groovy
def "should query for ValueObject changes by owning Entity instance and class"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new Employee(name:"bob",  postalAddress:  new Address(city:"Paris")))
    javers.commit( "author", new Employee(name:"bob",  primaryAddress: new Address(city:"London")))
    javers.commit( "author", new Employee(name:"bob",  primaryAddress: new Address(city:"Paris")))
    javers.commit( "author", new Employee(name:"lucy", primaryAddress: new Address(city:"New York")))

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

<h2 id="by-class-query">Querying for any object changes by its class</h2>
This query is a kind of shotgun approach. The only mandatory parameter is a class.
It selects objects regardless of its JaversType and
can be used for: Entities, ValueObjects and UnboundedValueObjects. 

This query is useful for selecting UnboundedValueObjects (ValueObjects without owning Entity)
and also for ValueObjects when we don’t care about owning Entity and path.

In the example, we show how to query for changes done on 
ValueObjects owned by two different Entities.

```groovy
def "should query for Object changes by its class"() {
    given:
    def javers = JaversBuilder.javers().build()

    javers.commit( "author", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "London")))
    javers.commit( "author", new DummyUserDetails(id:1, dummyAddress: new DummyAddress(city: "Paris")))
    javers.commit( "author", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "New York")))
    javers.commit( "author", new SnapshotEntity(id:2, valueObjectRef: new DummyAddress(city: "Washington")))

    when:
    def changes = javers.findChanges( QueryBuilder.byClass(DummyAddress.class).build())

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

<h2 id="property-filter">Property filter</h2>
When querying for changes, you can pass a property name to filter a query result
to changes done on a concrete property.

In the example, we show how to query for Employee’s salary changes,
while ignoring changes done on other properties.

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

<h2 id="limit-filter">Limit filter</h2>
Limit filter is the optional parameter for all queries, default value is 100.
It simply limits the number of snapshots to be read from JaversRepository.
Always choose reasonable limits to improve performance of your queries and to save server heap size.
When querying for changes, limit `n` means: give me changes recorded for last `n` snapshots.

In the example we set limit to 3 so only last 3 Bob’s snapshots are being compared,
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

<h2 id="new-object-filter">NewObject changes filter</h2>
This filter affects changes query only, by default is disabled.
When enabled, a query produces additional changes for initial snapshots.
Initial snapshot is taken when an object is committed to JaversRepository for the first time.

With this filter, you can query for an initial state of an object.
It’s represented as a NewObject change, followed by a list of property changes from null to something.

Let’s see how it works in the example below.

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
 