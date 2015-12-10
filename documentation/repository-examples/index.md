---
layout: docs
title: Repository examples
submenu: repository-examples
---

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```
gradlew javers-core:example -Dtest.single=BasicCommitExample
gradlew javers-core:example -Dtest.single=ChangeLogExample
gradlew javers-core:example -Dtest.single=JsonTypeAdapterExample
```

<h2 id="commit-changes">Commit changes</h2>

This example shows how to persist changes done on a domain object in `JaversRepository`.

Then we show how to fetch the history of this object from the repository.

**The case**<br/>
We have the an object of `Person` class, which represents a person called Robert.
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
Person is a typical Entity
(see [domain-model-mapping](/documentation/domain-configuration/#entity) for Entity definition).
JaVers uses [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html)
for identifying and querying Entities.
In this case, it’s expressed as `instanceId("bob", Person.class)`.

`Person.class:`

```java
package org.javers.core.examples.model;

import javax.persistence.Id;

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

`BasicCommitExample#shouldCommitToJaversRepository()`:

```java
package org.javers.core.examples;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Change;
import org.javers.core.diff.changetype.NewObject;
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Person;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.repository.jql.QueryBuilder;
import org.junit.Test;
import java.util.List;
import static org.fest.assertions.api.Assertions.assertThat;

public class BasicCommitExample {
    @Test
    public void shouldCommitToJaversRepository() {
        //given:

        // prepare JaVers instance. By default, JaVers uses InMemoryRepository,
        // it's useful for testing
        Javers javers = JaversBuilder.javers().build();

        // init your data
        Person robert = new Person("bob", "Robert Martin");
        // and persist initial commit
        javers.commit("user", robert);

        // do some changes
        robert.setName("Robert C.");
        // and persist another commit
        javers.commit("user", robert);

        // when:
        List<CdoSnapshot> snapshots = javers.findSnapshots(
            QueryBuilder.byInstanceId("bob", Person.class).build());

        // then:
        // there should be two Snapshots with Bob's state
        assertThat(snapshots).hasSize(2);
    }
}
```

<h2 id="read-snapshots-history">Read snapshots history</h2>

Having some commits saved in JaversRepository, we can fetch the list of Robert’s object
[Snapshots]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/CdoSnapshot.html)
and check how Robert looked like in the past:

```java
List<CdoSnapshot> snapshots = javers.findSnapshots(
    QueryBuilder.byInstanceId("bob", Person.class).build());
```

**What’s important** <br/>
In JaVers, a snapshot is the state of an object recorded during a `commit()` call.
Technically, it’s a map from a property name to property value.

Under the hood, JaVers reuses snapshots and creates a new one only when the given object is changed.
It allows you to save a significant amount of repository space.

JaVers reads snapshots in reversed chronological order.
So if you set the limit to 10, Javers returns a list of the 10 latest
snapshots.

`BasicCommitExample#shouldListStateHistory()`:

```java
... //
public class BasicCommitExample {
    ... //

    @Test
    public void shouldListStateHistory() {
        // given:
        // commit some changes
        Javers javers = JaversBuilder.javers().build();
        Person robert = new Person("bob", "Robert Martin");
        javers.commit("user", robert);

        robert.setName("Robert C.");
        javers.commit("user", robert);

        // when:
        // list state history - last 10 snapshots
        List<CdoSnapshot> snapshots = javers.findSnapshots(
            QueryBuilder.byInstanceId("bob", Person.class).limit(10).build());

        // then:
        // there should be two Snapshots with Bob’s state
        assertThat(snapshots).hasSize(2);
        CdoSnapshot newState = snapshots.get(0);
        CdoSnapshot oldState = snapshots.get(1);
        assertThat(oldState.getPropertyValue("name")).isEqualTo("Robert Martin");
        assertThat(newState.getPropertyValue("name")).isEqualTo("Robert C.");
    }
}
```

<h2 id="read-changes-history">Read changes history</h2>

Once we have some commits saved in `JaversRepository`, we can fetch the list of
[Changes]({{ site.javadoc_url }}index.html?org/javers/core/diff/Change.html)
done on a given object.

There are three top-level types of changes:

* [NewObject]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/NewObject.html)
  &mdash; appears when object is committed to JaversRepository for the first time,
* [ObjectRemoved]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ObjectRemoved.html)
  &mdash; when object is deleted,
* [PropertyChange]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/PropertyChange.html)
  &mdash; when object changed its state on some property.

Then, PropertyChange has the following subtypes:

* [ContainerChange]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/container/ContainerChange.html)
  &mdash; list of changed items in Set, List or Array
* [MapChange]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/map/MapChange.html)
  &mdash; list of changed Map entries,
* [ReferenceChange]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ReferenceChange.html)
  &mdash; changed Entity reference,
* [ValueChange]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ValueChange.html)
  &mdash; changed Primitive or Value.


In our example, we changed Robert’s name. Se we expect one ValueChange
in changes history.

**What’s important** <br/>
The changes list is different to the snapshots list as it shows only changed properties.
It works similarly to the GIT blame function.

`BasicCommitExample#shouldListChangeHistory()`:

```java
... //
public class BasicCommitExample {
    ... //

    @Test
    public void shouldListChangeHistory() {
        // given:
        // commit some changes
        Javers javers = JaversBuilder.javers().build();
        Person robert = new Person("bob", "Robert Martin");
        javers.commit("user", robert);

        robert.setName("Robert C.");
        javers.commit("user", robert);

        // when:
        // list change history
        List<Change> changes = javers.findChanges(
            QueryBuilder.byInstanceId("bob", Person.class).build());

        // then:
        // there should be one ValueChange with Bob's firstName
        assertThat(changes).hasSize(1);
        ValueChange change = (ValueChange) changes.get(0);
        assertThat(change.getPropertyName()).isEqualTo("name");
        assertThat(change.getLeft()).isEqualTo("Robert Martin");
        assertThat(change.getRight()).isEqualTo("Robert C.");
    }
}
```

See [Examples — JQL](/documentation/jql-examples/) chapter for more query examples. 

<h2 id="change-log">Change log</h2>
In this example we show how to create a change log &mdash;
a nicely formatted list of changes done on a particular object.

Implementing a change log straightforwardly by iterating over a list of changes on your own
is doable but cumbersome. You’ll end up with a series of `if` and `instanceof` statements.

The smarter way is to use
[ChangeProcessor]({{ site.javadoc_url }}index.html?org/javers/core/changelog/ChangeProcessor.html)
&mdash; the general-purpose
method for processing a change list.

**The case** <br/>
We have an employee called Bob, who gets promoted and
gets two trainees assigned as subordinates.
Our goal is to print Bob’s detailed change log with dates,
commit authors, and change flow, like this:

```
commit 3.0, author: hr.manager, 2015-04-16 22:16:50
  changed object: org.javers.core.examples.model.Employee/Bob
    list changed on 'subordinates' property: [(0).added:'org.javers.core.examples.model.Employee/Trainee One', (1).added:'org.javers.core.examples.model.Employee/Trainee Two']
commit 2.0, author: hr.director, 2015-04-16 22:16:50
  changed object: org.javers.core.examples.model.Employee/Bob
    value changed on 'position' property: 'Scrum master' -> 'Team Lead'
    value changed on 'salary' property: '9000' -> '11000'
commit 1.0, author: hr.manager, 2015-04-16 22:16:50
  changed object: org.javers.core.examples.model.Employee/Bob
    value changed on 'name' property: 'null' -> 'Bob'
    value changed on 'position' property: 'null' -> 'Scrum master'
    value changed on 'salary' property: '0' -> '9000'
```

We use text format here for brevity but ChangeProcessor API
is suitable for creating a change log in any format.

To print this nice change log, just call

```java
List<Change> changes = javers.findChanges(
    QueryBuilder.byInstanceId("Bob", Employee.class).build());
String changeLog = javers.processChangeList(changes, new SimpleTextChangeLog());
```    

**What’s important** <br/>
You can think of ChangeProcessor as a `callback` based approach.
JaVers processes a list of changes and fires callbacks provided by you when particular events occur.

ChangeProcessor is an interface. You can implement it from scratch or use `AbstractTextChangeLog` &mdash;
the scaffolding class designed to be extended by a concrete change log renderer.

JaVers comes with one concrete change log implementation &mdash; `SimpleTextChangeLog`.
We use it in this example
but of course, you can provide a custom implementation to meet your change log requirements.

ChangeProcessor can also be used for processing changes calculated by ad-hoc diff,
but it shines when used for changes fetched from JaversRepository.

The full example is shown below.

<tt>ChangeLogExample.class :</tt>

```java
package org.javers.core.examples;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.changelog.SimpleTextChangeLog;
import org.javers.core.diff.Change;
import org.javers.core.examples.model.Employee;
import org.javers.repository.jql.QueryBuilder;
import org.junit.Test;
import java.util.List;

public class ChangeLogExample {

  @Test
  public void shoudPrintTextChangeLog() {
    // given:
    Javers javers = JaversBuilder.javers().build();
    Employee bob = new Employee("Bob", 9_000, "Scrum master" );
    javers.commit("hr.manager", bob);

    // do some changes and commit
    bob.setPosition("Team Lead");
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
}
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
[`BasicStringTypeAdapter`]({{ site.javadoc_url }}index.html?org/javers/core/json/BasicStringTypeAdapter.html) abstract class.

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