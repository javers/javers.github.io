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
then, how to fetch the history of this object from the JaversRepository.

**The case**<br/>
We have an object of `Person` class, which represents a person called Robert.
Our goal is to track changes done on the Robert object.
Whenever the object is changed we want to save its state in JaversRepository.
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
more details about JaVers’ type system).
[`GlobalId`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/GlobalId.java)
for identifying and querying Entities.
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

The example test is in Groovy. First, we commit the initial version of Robert and
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

    then: "there should be two Changes on Bob"
    assert changes.size() == 2
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
Snapshot{commit:2.0, id:...Person/bob, version:2, (login:bob, name:Robert C., position:Developer)}
Snapshot{commit:1.0, id:...Person/bob, version:1, (login:bob, name:Robert Martin)}

Changes query:
Changes:
Commit 2.0 done by user at 13 Apr 2018, 22:11:56 :
* changes on org.javers.core.examples.model.Person/bob :
  - 'name' changed from 'Robert Martin' to 'Robert C.'
  - 'position' changed from '' to 'Developer'
  
```

This is just a simple example to show how Javers’ queries work.
The full JaVers’ Query Language specification is in the [Examples — JQL](/documentation/jql-examples/) chapter. 

<h2 id="change-log">Changelog</h2>
In this example, we show how to create a changelog &mdash;
a formatted and sorted list of Changes.

In JaVers, there are a few ways of processing Changes.

**The simplest way** is to iterate over the list returned by `findChanges()`,
which is sorted in reverse chronological order (the `Changes` class extends `List<Change>`).

[`ChangeLogExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ChangeLogExample.java#L15):

```java
List<Change> changes = javers.findChanges(QueryBuilder.byClass(Employee.class)
                             .withNewObjectChanges().build());

System.out.println("Printing the flat list of Changes :");
changes.forEach(change -> System.out.println("- " + change));
```

the output:

```text
Printing the flat list of Changes :
- ValueChange{ 'salary' changed from '10000' to '11000' }
- ListChange{ 'subordinates' collection changes :
  0. 'Employee/Sam' added }
- ValueChange{ 'name' changed from '' to 'Sam' }
- ValueChange{ 'salary' changed from '0' to '2000' }
- ReferenceChange{ 'boss' changed from '' to 'Employee/Frodo' }
- NewObject{ new object: Employee/Sam }
- ValueChange{ 'name' changed from '' to 'Frodo' }
- ValueChange{ 'salary' changed from '0' to '10000' }
- NewObject{ new object: Employee/Frodo }
```

The flat list is not very readable.<br/>
**It’s better to group** Changes by commits and then by objects:

```java
Changes changes = javers.findChanges(QueryBuilder.byClass(Employee.class)
                        .withNewObjectChanges().build());

System.out.println("Printing Changes with grouping by commits and by objects :");
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

the output:

```text
Printing Changes with grouping by commits and by objects :
commit 2.0
  changes on Employee/Frodo : 
  - ValueChange{ 'salary' changed from '10000' to '11000' }
  - ListChange{ 'subordinates' collection changes :
  0. 'Employee/Sam' added }
  changes on Employee/Sam : 
  - ValueChange{ 'name' changed from '' to 'Sam' }
  - ValueChange{ 'salary' changed from '0' to '2000' }
  - ReferenceChange{ 'boss' changed from '' to 'Employee/Frodo' }
  - NewObject{ new object: Employee/Sam }
commit 1.0
  changes on Employee/Frodo : 
  - ValueChange{ 'name' changed from '' to 'Frodo' }
  - ValueChange{ 'salary' changed from '0' to '10000' }
  - NewObject{ new object: Employee/Frodo }
``` 
    
In fact, this kind of grouping is what **`prettyPrint()`** does.

```java
System.out.println("Changes prettyPrint :");
System.out.println(changes.prettyPrint());
```

the output:

```text
Changes prettyPrint :
Changes:
Commit 2.0 done by author at 15 Apr 2018, 22:50:15 :
* changes on Employee/Frodo :
  - 'salary' changed from '10000' to '11000'
  - 'subordinates' collection changes :
    0. 'Employee/Sam' added
* new object: Employee/Sam
* changes on Employee/Sam :
  - 'boss' changed from '' to 'Employee/Frodo'
  - 'name' changed from '' to 'Sam'
  - 'salary' changed from '0' to '2000'
Commit 1.0 done by author at 15 Apr 2018, 22:50:15 :
* new object: Employee/Frodo
* changes on Employee/Frodo :
  - 'name' changed from '' to 'Frodo'
  - 'salary' changed from '0' to '10000'
```    
    
**You can configure** the date formats &mdash; 
see `prettyPrintDateFormats` in [JaVers configuration](/documentation/spring-boot-integration/#javers-configuration-properties).    
      
### ChangeProcessor    
[`ChangeProcessor`]({{ site.github_core_main_url }}org/javers/core/changelog/ChangeProcessor.java) 
is the general-purpose method for processing a Change list.
It’s the callback-based approach.
JaVers processes a list of Changes and fires callbacks provided by you when particular events occur.

ChangeProcessor is an interface. You can implement it from scratch or use `AbstractTextChangeLog` &mdash;
the scaffolding class designed to be extended by a concrete changelog renderer.

JaVers comes with one concrete ChangeProcessor implementation &mdash; `SimpleTextChangeLog`.
We use it in this example, but of course, you can provide a custom implementation.
    

[`ChangeLogExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ChangeLogExample.java#L53)

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
commit 3.0, author: hr.manager, 16 Apr 2018, 00:04:21
  changed object: Employee/Bob
    list changed on 'subordinates' property: [0. 'Employee/Trainee One' added, 1. 'Employee/Trainee Two' added]
commit 2.0, author: hr.director, 16 Apr 2018, 00:04:21
  changed object: Employee/Bob
    value changed on 'position' property: 'ScrumMaster' -> 'Developer'
    value changed on 'salary' property: '9000' -> '11000'
```

<h2 id="json-type-adapter">JSON TypeAdapter</h2>

`JsonTypeAdapter` allows you to customize how JaVers
serializes your [Value types](/documentation/domain-configuration#ValueType) to JSON.
This is especially important for complex Id types like
the [`org.bson.types.ObjectId`](http://api.mongodb.org/java/2.0/org/bson/types/ObjectId.html) class,
often used as Id-property for objects persisted in MongoDB.

Consider the following domain Entity:

```java
package org.javers.core.cases.morphia;

import org.bson.types.ObjectId;
... // omitted

@Entity
public class MongoStoredEntity {
    @Id
    private ObjectId _id;

    private String name;
    ... // omitted
}
```


Without custom JsonTypeAdapter, ObjectId is serialized using its 4 internal fields
as follows:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    <span class='s2'>"cdoId": {
      "_time": 1417358422,
      "_machine": 1904935013,
      "_inc": 1615625682,
      "_new": true
    }</span>
  }
</pre>

In this example we show how to turn this verbose JSON into something neat like this:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    <span class='s2'>"cdoId": "54789e5cfb2ca07e65130e7c"</span>
    },
</pre>

**The case**<br/>
Our goal is to improve JSON serialization of ObjectId
used as Id in domain Entity &mdash; `MongoStoredEntity`.

**Configuration** <br/>
First we need to implement the `JsonTypeAdapter` interface.
In this case, we recommend extending the
[`BasicStringTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/BasicStringTypeAdapter.java) 
abstract class.

<tt>ObjectIdTypeAdapter.class :</tt>

```java
package org.javers.core.examples.adapter;

import org.bson.types.ObjectId;
import org.javers.core.json.BasicStringTypeAdapter;

public class ObjectIdTypeAdapter extends BasicStringTypeAdapter {

    @Override
    public String serialize(Object sourceValue) {
        return sourceValue.toString();
    }

    @Override
    public Object deserialize(String serializedValue) {
        return new ObjectId(serializedValue);
    }

    @Override
    public Class getValueType() {
        return ObjectId.class;
    }
}
```

Then, our TypeAdapter should be registered in `JaversBuilder`:

    JaversBuilder.javers().registerValueTypeAdapter(new ObjectIdTypeAdapter())

That’s it! The runnable example is shown below.

<tt>[JsonTypeAdapterExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/JsonTypeAdapterExample.java)</tt>:

```java
package org.javers.core.examples;

import org.bson.types.ObjectId;
import org.fest.assertions.api.Assertions;
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.cases.morphia.MongoStoredEntity;
import org.javers.core.diff.Diff;
import org.javers.core.examples.adapter.ObjectIdTypeAdapter;
import org.junit.Test;

public class JsonTypeAdapterExample {

    @Test
    public void shouldSerializeValueToJsonWithTypeAdapter() {
        //given
        Javers javers = JaversBuilder.javers()
                .registerValueTypeAdapter(new ObjectIdTypeAdapter())
                .build();

        //when
        ObjectId id = ObjectId.get();
        MongoStoredEntity entity1 = new MongoStoredEntity(id, "alg1", "1.0", "name");
        MongoStoredEntity entity2 = new MongoStoredEntity(id, "alg1", "1.0", "another");
        Diff diff = javers.compare(entity1, entity2);

        //then
        String json = javers.getJsonConverter().toJson(diff);
        Assertions.assertThat(json).contains(id.toString());

        System.out.println(json);
    }
}
```

The output of running this program is:

<pre>
{
  "changes": [
    {
      "changeType": "ValueChange",
      "globalId": {
        "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
        <span class='s2'>"cdoId": "54876f694b9d4135b0b179ec"</span>
      },
      "property": "_name",
      "left": "name",
      "right": "another"
    }
  ]
}
</pre>
