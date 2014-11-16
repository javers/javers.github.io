---
layout: docs
title: Documentation - Examples
---

# Examples #

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run selected example as unit test:

```
gradlew javers-core:example -Dtest.single=BasicEntityDiffExample
```

<a name="compare-entities"></a>
### Compare two Entity objects ###

Lets start from something simple, this example shows how to find a diff between two objects of `Person` class.
Since every Person has his own identity, it's the `Entity`
(see [domain-model-mapping](/documentation/configuration/#domain-model-mapping) for Entity definition).

**The case**<br/>
We have objects, `tommyOld` and `tommyNew`. These objects represent two *versions* of the same being (person called Tommy).
To find out what has changed, just call

    javers.compare(tommyOld, tommyNew)

**Configuration** <br/>
In this case, no configuration is required.
JaVers finds `@Id` annotation in the proper place and treats Person class as the Entity.

**What's important**<br/>
Notice, that both objects have the same Id value (<tt>"tommy"</tt>).
That's why they are matched and compared.
JaVers compares only objects with the same Id
(for Entities we call it [<tt>InstanceId</tt>]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/InstanceId.html)).


<tt>Person.class :</tt>

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

    public String getLogin() {
        return login;
    }

    public String getName() {
        return name;
    }
}
```

<tt>BasicEntityDiffExample.class :</tt>

```java
package org.javers.core.examples;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Person;
import org.junit.Test;
import static org.fest.assertions.api.Assertions.assertThat;

public class BasicEntityDiffExample {
    @Test
    public void shouldCompareTwoEntityObjects() {
        //given
        Javers javers = JaversBuilder.javers().build();

        Person tommyOld = new Person("tommy", "Tommy Smart");
        Person tommyNew = new Person("tommy", "Tommy C. Smart");

        //when
        Diff diff = javers.compare(tommyOld, tommyNew);

        //then
        ValueChange change = (ValueChange)  diff.getChanges().get(0);

        assertThat(diff.getChanges()).hasSize(1);
        assertThat(change.getProperty().getName()).isEqualTo("name");
        assertThat(change.getLeft()).isEqualTo("Tommy Smart");
        assertThat(change.getRight()).isEqualTo("Tommy C. Smart");

        System.out.println("changes count:       " + diff.getChanges().size());
        System.out.println("entity id:           " + change.getAffectedCdoId().getCdoId());
        System.out.println("changed property:    " + change.getProperty().getName());
        System.out.println("value before change: " + change.getLeft());
        System.out.println("value after change : " + change.getRight());
    }
}
```    

Output of running this program is:

    changes count:       1
    entity id:           tommy
    changed property:    name
    value before change: Tommy Smart
    value after change : Tommy C. Smart

<a name="compare-valueobjects"></a>
### Compare Value Objects ###

If you don't put an @Id annotation in the class definition Javers recognize an object as Value Object. Javers treat Id as other fields and 
returns ```ValueObject``` changes:


```java
     public static void main(String[] args) {
        Javers javers = JaversBuilder
                            .javers()
                            .build();

        User johny = new User(25, "Johny");
        User tommy = new User(26, "Charlie");

        Diff diff = javers.compare(johny, tommy);
        List<Change> changes = diff.getChanges();
        ValueChange change1 = (ValueChange) changes.get(0);
        ValueChange change2 = (ValueChange) changes.get(1);

        System.out.println("Changes size: " + changes.size());
        System.out.println("Changed property: " + change1.getProperty());
        System.out.println("Value before change: " + change1.getLeft());
        System.out.println("Value after change: " + change1.getRight());
        System.out.println("Changed property: " + change2.getProperty());
        System.out.println("Value before change: " + change2.getLeft());
        System.out.println("Value after change: " + change2.getRight());
    }
```    

Output:

        Changes size: 2
        Changed property: User.id
        Value before change: 25
        Value after change: 26
        Changed property: User.name
        Value before change: Johny
        Value after change: Charlie