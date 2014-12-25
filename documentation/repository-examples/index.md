---
layout: docs
title: Documentation - Repository examples
submenu: repository-examples
---

# Repository examples

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```
gradlew javers-core:example -Dtest.single=BasicCommitExample
```

<h2 id="commit-changes">Commit changes</h2>

This example shows how to persist changes done on a domain object in `JaversRepository`.

Then we show how to fetch the history of this object from the repository.

**The case**<br/>
We have the object of `Person` class, which represents person called Robert.
Our goal is to track changes done on Robert object.
Whenever the object is changed we want to save its state in JaversRepository.
With JaVers, it can be done with single `commit()` call:

    javers.commit("user", robert);

**Configuration** <br/>
By default, JaVers uses in-memory repository, which is perfect for testing.
For production environment you will need to setup a real database repository
(see [repository-setup](/documentation/configuration#repository-setup)).

We need to tell JaVers that Person class is an Entity.
It's enough to annotate `login` field with `@Id` annotation.

**What's important** <br/>
Person is a typical Entity
(see [domain-model-mapping](/documentation/configuration/#domain-model-mapping) for Entity definition).
JaVers uses [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html)
for identifying and querying for Entities.
In this case, it's expressed as `InstanceIdDTO.instanceId("bob", Person.class)`.

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
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Person;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.core.metamodel.object.InstanceIdDTO;
import org.junit.Test;
import java.util.List;
import static org.fest.assertions.api.Assertions.assertThat;
import static org.javers.core.metamodel.object.InstanceIdDTO.instanceId;

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
        List<CdoSnapshot> snapshots =
            javers.getStateHistory(InstanceIdDTO.instanceId("bob", Person.class),10);

        // then:
        // there should be two Snapshots with Bob's state
        assertThat(snapshots).hasSize(2);
    }
    ... //
```

<h2 id="read-snapshots-history">Read snapshots history</h2>

Let's continue the previous example.
Having some commits saved in `JaversRepository` we can fetch the list of Robert's object snapshots
and check how Robert looked like in the past:

```java
List<CdoSnapshot> snapshots =
    javers.getStateHistory(InstanceIdDTO.instanceId("bob", Person.class),10);
```

**What's important** <br/>
In JaVers, snapshot is an object state recorded during `commit()` call.
Technically, it's a map from property name to property value.

Under the hood, JaVers reuses snapshots, and creates a new one only when given object is changed.
It allows you to save significant amount of repository space.

JaVers reads snapshots in the reversed chronological order.
So if you set the limit to 10, Javers returns the list of 10 latest
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
        // list state history - snapshots
        List<CdoSnapshot> snapshots =
            javers.getStateHistory(instanceId("bob", Person.class), 5);

        // then:
        // there should be two Snapshots with Bob's state
        assertThat(snapshots).hasSize(2);
        CdoSnapshot newState = snapshots.get(0);
        CdoSnapshot oldState = snapshots.get(1);
        assertThat(oldState.getPropertyValue("name")).isEqualTo("Robert Martin");
        assertThat(newState.getPropertyValue("name")).isEqualTo("Robert C.");
    }

    ... //
```

<h2 id="read-changes-history">Read changes history</h2>

Let's continue the previous example.

    //TODO

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
        List<Change> changes =
            javers.getChangeHistory(InstanceIdDTO.instanceId("bob", Person.class), 5);

        // then:
        // there should be one ValueChange with Bob's firstName
        assertThat(changes).hasSize(1);
        ValueChange change = (ValueChange) changes.get(0);
        assertThat(change.getProperty().getName()).isEqualTo("name");
        assertThat(change.getLeft()).isEqualTo("Robert Martin");
        assertThat(change.getRight()).isEqualTo("Robert C.");
    }

    ... //
```

<h2 id="json-type-adapter">JSON TypeAdapter for ObjectId</h2>

*JsonTypeAdapter* allows you to customize how JaVers
serialize your [Value types](/documentation/configuration#ValueType) to JSON.
That is especially important for complex Id types like
[<tt>org.bson.types.ObjectId</tt>](http://api.mongodb.org/java/2.0/org/bson/types/ObjectId.html) class,
often used as *Id-property* for objects persisted in MongoDB.

Consider following domain *Entity*:

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


Without custom *JsonTypeAdapter*, ObjectId is serialized using its 4 internal fields
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

In this example we show, how to turn this verbose JSON into something neat like this:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    <span class='s2'>"cdoId": "54789e5cfb2ca07e65130e7c"</span>
    },
</pre>

**The case**<br/>
Our goal is to improve JSON serialization of <tt>ObjectId</tt>
used as Id in domain *Entity* &mdash; <tt>MongoStoredEntity</tt>.

**Configuration** <br/>
First we need to implement the JSON *TypeAdapter*.
In this case, we recommend extending
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

Then, our *TypeAdapter* should be registered in *JaversBuilder*:

    JaversBuilder.javers().registerValueTypeAdapter(new ObjectIdTypeAdapter())

That's it! Runnable example is shown below.

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
        String json = javers.toJson(diff);
        Assertions.assertThat(json).contains(id.toString());

        System.out.println(json);
    }
}
```

Output of running this program is:

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