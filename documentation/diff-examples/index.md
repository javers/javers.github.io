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
We have two objects, `tommyOld` and `tommyNew`. These objects represent two *versions* of the same being (person called Tommy).
To find out what has changed, just call

    javers.compare(tommyOld, tommyNew)

**Configuration** <br/>
JaVers needs to know that Person class is an Entity.
It's enough to annotate `login` field with `@Id` annotation.

**What's important**<br/>
Notice, that both objects have the same Id value (<tt>'tommy'</tt>).
That's why they are matched and compared.
JaVers compares only objects with the same [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html).
In this case, it's <tt>'org.javers.core.examples.model.Person/tommy'</tt>.

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

    public String getLogin() { return login; }

    public String getName() { return name; }
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
        //there should be one change of type {@link ValueChange}
        ValueChange change = diff.getChangesByType(ValueChange.class).get(0);

        assertThat(diff.getChanges()).hasSize(1);
        assertThat(change.getProperty().getName()).isEqualTo("name");
        assertThat(change.getAffectedCdoId().value()).isEqualTo("org.javers.core.examples.model.Person/tommy");
        assertThat(change.getLeft()).isEqualTo("Tommy Smart");
        assertThat(change.getRight()).isEqualTo("Tommy C. Smart");

        System.out.println("diff: " + javers.toJson(diff));
    }
}

```    

Output of running this program is:

```json
diff: {
  "changes": [
    {
      "changeType": "ValueChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Person",
        "cdoId": "tommy"
      },
      "property": "name",
      "left": "Tommy Smart",
      "right": "Tommy C. Smart"
    }
  ]
}
```

<a name="compare-valueobjects"></a>
### Compare ValueObjects ###

This example shows how to find a diff between two objects of `Address` class.
Address is a typical `ValueObject`, it doesn't have its own identity. It's just a complex value holder.

(see [domain-model-mapping](/documentation/configuration/#domain-model-mapping) for ValueObject definition).

**The case**<br/>
We have two objects, `address1` and `address2`. These objects represent two different addresses.
To find out what's the difference, just call

    javers.compare(address1, address2)

**Configuration** <br/>
In this case, no configuration is required since JaVers is going to map
Address class as ValueObject by default.


**What's important**<br/>
When JaVers knows nothing about a class, treats it as a ValueObject.
As we said in the previous example, JaVers compares only objects with the same [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html).
What's the Address Id? Well, it's a tricky beast...

It's based on the path in the object graph. In this case, both objects are roots, so the path is simply <tt>'/'</tt>
and the GlobalId is <tt>'org.javers.core.examples.model.Address/'</tt>


<tt>Address.class :</tt>

```java
package org.javers.core.examples.model;

public class Address {
    private final String city;
    private final String street;

    public Address(String city, String street) {
        this.city = city;
        this.street = street;
    }

    public String getCity() { return city; }

    public String getStreet() { return street; }
}
```

<tt>BasicValueObjectDiffExample.class :</tt>

```java
package org.javers.core.examples;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Address;
import org.junit.Test;
import static org.fest.assertions.api.Assertions.assertThat;

public class BasicValueObjectDiffExample {

    @Test
    public void shouldCompareTwoObjects() {

        //given
        Javers javers = JaversBuilder.javers().build();

        Address address1 = new Address("New York","5th Avenue");
        Address address2 = new Address("New York","6th Avenue");

        //when
        Diff diff = javers.compare(address1, address2);

        //then
        //there should be one change of type {@link ValueChange}
        ValueChange change = diff.getChangesByType(ValueChange.class).get(0);

        assertThat(diff.getChanges()).hasSize(1);
        assertThat(change.getAffectedCdoId().value()).isEqualTo("org.javers.core.examples.model.Address/");
        assertThat(change.getProperty().getName()).isEqualTo("street");
        assertThat(change.getLeft()).isEqualTo("5th Avenue");
        assertThat(change.getRight()).isEqualTo("6th Avenue");

        System.out.println("diff: " + javers.toJson(diff));
    }
}
```    

Output of running this program is:

```json
diff: {
  "changes": [
    {
      "changeType": "ValueChange",
      "globalId": {
        "valueObject": "org.javers.core.examples.model.Address",
        "cdoId": "/"
      },
      "property": "street",
      "left": "5th Avenue",
      "right": "6th Avenue"
    }
  ]
}
```

<a name="employee-hierarchies"></a>
### Compare Employee hierarchies ###
