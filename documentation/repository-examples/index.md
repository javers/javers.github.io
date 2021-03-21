---
layout: page
title: Repository examples
category: Documentation
submenu: repository-examples
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
./gradlew javers-core:test --tests BasicCommitAndQueryExample
```

<h2 id="commit-changes">Commit and query</h2>

This example shows how to persist changes done on a domain object and 
then, how to fetch the history of this object from a JaversRepository.

**The case**<br/>
We have an object of `Person` class, which represents a person called Robert.
Our goal is to track changes done on the Robert object.
Whenever the object is changed we want to save its state in a JaversRepository.
With JaVers, it can be done with a single `commit()` call:

    javers.commit("user", robert);

**Configuration** <br/>
By default, JaVers uses an in-memory repository, which is perfect for testing.
For a production environment you will need to set up a real database repository
(see [repository-setup](/documentation/repository-configuration)).

We need to tell JaVers that Person class is an Entity.
It’s enough to annotate the login field with `@Id` annotation.

**What’s important** <br/>
Person is a typical [Entity](/documentation/domain-configuration/#entity)
(see [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping) for 
more details about the JaVers’ type system).
In Javers, Entity instances are identified by
[`InstanceId`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/InstanceId.java) 
&mdash; a pair of local Id and Entity type. 
In this case, it’s expressed as `instanceId("bob", Person.class)`.

[`Person.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Person.java):

```java
public class Person {
    @Id
    private String login;
    private String name;

    public Person(String login, String name) {
        this.login = login;
        this.name = name;
    }

    public String getLogin() { return login; }

    public String getName() { return name; }
}
```

The example test is written in Groovy. First, we commit the initial version of Robert, and
then we commit the second version.

[`BasicCommitAndQueryExample.groovy`](https://github.com/javers/javers/blob/master/javers-core/src/test/groovy/org/javers/core/examples/BasicCommitAndQueryExample.groovy#L15):

```groovy
def "should commit and query from JaversRepository"() {
    given:
    // prepare JaVers instance. By default, JaVers uses InMemoryRepository,
    // it's useful for testing
    Javers javers = JaversBuilder.javers().build()

    Person robert = new Person("bob", "Robert Martin")
    javers.commit("user", robert)           // persist initial commit

    robert.setName("Robert C.")             // do some changes
    robert.setPosition(Position.Developer)
    javers.commit("user", robert)           // and persist another commit

    ...
```

Having some commits saved in the JaversRepository,
you can fetch Robert’s object history in one of the three views:
*Shadows*, *Snapshots*, and *Changes*:
 
```groovy
    JqlQuery query = QueryBuilder.byInstanceId("bob", Person.class).build()

    when:
    println "Shadows query:"

    List<Shadow<Person>> shadows = javers.findShadows(query)

    shadows.forEach{ println it.get()}

    then: "there should be two Bob's Shadows"
    assert shadows.size == 2

    when:
    println "Snapshots query:"

    List<CdoSnapshot> snapshots = javers.findSnapshots(query)

    snapshots.forEach{ println it}

    then: "there should be two Bob's Shadows"
    assert snapshots.size == 2

    when:
    println "Changes query:"

    Changes changes = javers.findChanges(query)
    // or the old approach:
    // List<Change> changes = javers.findChanges(query)

    println changes.prettyPrint()

    then: "there should be five Changes on Bob"
    assert changes.size() == 5 
}
```

Output:

```
22:11:56.572 [main] INFO  org.javers.core.Javers - Commit(id:1.0, snapshots:1, author:user, changes - NewObject:1), done in 74 millis (diff:74, persist:0)
22:11:56.594 [main] INFO  org.javers.core.Javers - Commit(id:2.0, snapshots:1, author:user, changes - ValueChange:2), done in 5 millis (diff:5, persist:0)

Shadows query:
Person{login='bob', name='Robert C.', position=Developer}
Person{login='bob', name='Robert Martin', position=null}

Snapshots query:
Snapshot{commit:2.00, id:...Person/bob, version:2, state:{login:bob, name:Robert C., position:Developer}}
Snapshot{commit:1.00, id:...Person/bob, version:1, state:{login:bob, name:Robert Martin}}

Changes query:
Changes:
Commit 2.00 done by user at 14 Mar 2021, 19:59:46 :
* changes on org.javers.core.examples.model.Person/bob :
  - 'name' changed: 'Robert Martin' -> 'Robert C.'
  - 'position' = 'Developer'
Commit 1.00 done by user at 14 Mar 2021, 19:59:46 :
* new object: org.javers.core.examples.model.Person/bob
  - 'login' = 'bob'
  - 'name' = 'Robert Martin'  
```

This is just a simple example to show how Javers’ queries work.
Find the full JaVers’ Query Language specification 
in [Examples — JQL](/documentation/jql-examples/). 

<h2 id="change-log">Changelog</h2>

For a good start, you can use `Changes.prettyPrint()`,
which is a nicely formatted, user-friendly changelog:

```java
Changes changes = javers.findChanges(QueryBuilder.byClass(Employee.class).build());

System.out.println("Changes prettyPrint :");
System.out.println(changes.prettyPrint());
```

the output:

```text
Changes prettyPrint :
Changes:
Commit 2.00 done by author at 21 Mar 2021, 19:34:49 :
* changes on Employee/Frodo :
  - 'salary' changed: '10000' -> '11000'
  - 'subordinates' collection changes :
     0. 'Employee/Sam' added
* new object: Employee/Sam
  - 'boss' = 'Employee/Frodo'
  - 'name' = 'Sam'
  - 'salary' = '2000'
Commit 1.00 done by author at 21 Mar 2021, 19:34:49 :
* new object: Employee/Frodo
  - 'name' = 'Frodo'
  - 'salary' = '10000'
```    

See full source code of this example: [`ChangeLogExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ChangeLogExample.java).


**You can configure** the date formatters &mdash;
see `prettyPrintDateFormats` in [JaVers configuration](/documentation/spring-boot-integration/#javers-configuration-properties).

If you want to create your own changelog &mdash; choose one of the
three ways of processing Changes. 
In this example, we show all of them.


### The simplest way
The simplest way is no surprise.
Just iterate over the list returned by `findChanges()`,
which is sorted in reverse chronological order.
The `Changes` class implements the `List<Change>` interface:

```java
Changes changes = javers.findChanges(QueryBuilder.byClass(Employee.class).build());

System.out.println("Printing the flat list of Changes :");
changes.forEach(change -> System.out.println("- " + change));
```

the output:

```text
Printing the flat list of Changes :
- ValueChange{ property: 'salary', left:'10000',  right:'11000' }
- ListChange{ property: 'subordinates', elementChanges:1 }
- NewObject{ new object: Employee/Sam }
- InitialValueChange{ property: 'name', left:'',  right:'Sam' }
- InitialValueChange{ property: 'salary', left:'',  right:'2000' }
- ReferenceChange{ property: 'boss', left:'',  right:'Employee/Frodo' }
- NewObject{ new object: Employee/Frodo }
- InitialValueChange{ property: 'name', left:'',  right:'Frodo' }
- InitialValueChange{ property: 'salary', left:'',  right:'10000' }
```

Simple, but, the flat list is not very readable.

### Grouping by commits and objects 

To make our changelog more readable **it’s better to group** Changes
by commits and then by objects.
It's super-easy with `Changes.groupByCommit()`:

```java
Changes changes = javers.findChanges(QueryBuilder.byClass(Employee.class).build());

System.out.println("Printing Changes grouped by commits and by objects :");
changes.groupByCommit().forEach(byCommit -> {
    System.out.println("commit " + byCommit.getCommit().getId());
    byCommit.groupByObject().forEach(byObject -> {
        System.out.println("* changes on " + byObject.getGlobalId().value() + " : ");
        byObject.get().forEach(change -> System.out.println("  - " + change));
    });
});
```

the output:

```text
Printing Changes grouped by commits and by objects :
commit 2.00
* changes on Employee/Frodo : 
  - ValueChange{ property: 'salary', left:'10000',  right:'11000' }
  - ListChange{ property: 'subordinates', elementChanges:1 }
* changes on Employee/Sam : 
  - NewObject{ new object: Employee/Sam }
  - InitialValueChange{ property: 'name', left:'',  right:'Sam' }
  - InitialValueChange{ property: 'salary', left:'',  right:'2000' }
  - ReferenceChange{ property: 'boss', left:'',  right:'Employee/Frodo' }
commit 1.00
* changes on Employee/Frodo : 
  - NewObject{ new object: Employee/Frodo }
  - InitialValueChange{ property: 'name', left:'',  right:'Frodo' }
  - InitialValueChange{ property: 'salary', left:'',  right:'10000' }
``` 
    
In fact, this is exactly what `Changes.devPrint()` does.
 
### ChangeProcessor    
[`ChangeProcessor`]({{ site.github_core_main_url }}org/javers/core/changelog/ChangeProcessor.java) 
is the general-purpose method for processing a Change list.
It’s the callback-based approach.
JaVers processes Changes one-by-one
and fires callbacks provided by you when a particular event occur.

`ChangeProcessor` is the interface. You can implement it from scratch or use `AbstractTextChangeLog` &mdash;
the scaffolding class designed to be extended by a concrete changelog renderer.

JaVers comes with one concrete ChangeProcessor implementation &mdash; `SimpleTextChangeLog`.
We use it in this example, but of course, you can provide a custom implementation.

[`ChangeLogExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ChangeLogExample.java#L52)

```java
public void shouldPrintTextChangeLog() {
    // given:
    Javers javers = JaversBuilder.javers().build();
    Employee bob = new Employee("Bob", 9_000, "ScrumMaster");
    javers.commit("hr.manager", bob);

    // do some changes and commit
    bob.setPosition("Developer");
    bob.setSalary(11_000);
    javers.commit("hr.director", bob);

    bob.addSubordinates(new Employee("Trainee One"), new Employee("Trainee Two"));
    javers.commit("hr.manager", bob);

    // when:
    List<Change> changes = javers.findChanges(
    QueryBuilder.byInstanceId("Bob", Employee.class).build());
    String changeLog = javers.processChangeList(changes, new SimpleTextChangeLog());

    // then:
    System.out.println(changeLog);
}
```

the output:

```text
commit 3.00, author: hr.manager, 15 Mar 2021, 20:44:10
  changed object: Employee/Bob
    list changed on 'subordinates' property: [0. 'Employee/Trainee One' added, 1. 'Employee/Trainee Two' added]
commit 2.00, author: hr.director, 15 Mar 2021, 20:44:10
  changed object: Employee/Bob
    value changed on 'position' property: 'ScrumMaster' -> 'Developer'
    value changed on 'salary' property: '9000' -> '11000'
commit 1.00, author: hr.manager, 15 Mar 2021, 20:44:10
    new object: Employee/Bob
    value changed on 'name' property: '' -> 'Bob'
    value changed on 'position' property: '' -> 'ScrumMaster'
    value changed on 'salary' property: '' -> '9000'
```

