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

Run examples as unit tests:

```
gradlew javers-core:example -Dtest.single=BasicEntityDiffExample
gradlew javers-core:example -Dtest.single=BasicValueObjectDiffExample
gradlew javers-core:example -Dtest.single=EmployeeHierarchiesDiffExample
```

<a name="compare-entities"></a>
### Compare two Entity objects ###

Lets start from something simple, this example shows how to find a diff between two objects of <tt>Person</tt> class.
Since every Person has his own identity, it's the `Entity`
(see [domain-model-mapping](/documentation/configuration/#domain-model-mapping) for Entity definition).

**The case**<br/>
We have two objects, <tt>tommyOld</tt> and <tt>tommyNew</tt>.
These objects represent two *versions* of the same being (person called Tommy).
To find out what has changed, just call

    javers.compare(tommyOld, tommyNew)

**Configuration** <br/>
JaVers needs to know that <tt>Person</tt> class is an Entity.
It's enough to annotate <tt>login</tt> field with `@Id` annotation.

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

<tt>[BasicEntityDiffExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/BasicEntityDiffExample.java)</tt>:

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

This example shows how to find a diff between two objects of <tt>Address</tt> class.
Address is a typical `ValueObject`, it doesn't have its own identity. It's just a complex value holder.

(see [domain-model-mapping](/documentation/configuration/#domain-model-mapping) for ValueObject definition).

**The case**<br/>
We have two objects, <tt>address1</tt> and <tt>address2</tt>. These objects represent two different addresses.
To find out what's the difference, just call

    javers.compare(address1, address2)

**Configuration** <br/>
In this case, no configuration is required since JaVers is going to map
Address class as `ValueObject` by default.

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

<tt>[BasicValueObjectDiffExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/BasicValueObjectDiffExample.java)</tt>:

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

<a name="compare-graphs"></a>
### Compare graphs ###

JaVers can compare arbitrary complex structures of objects.
In this example, we show how easily you can compare employee hierarchies.

For the simplicity of this example, data model is reduced to one class,
<tt>Employee</tt>, see below.

Conceptually, employees hierarchy is a tree.
Technically, we have graph with cycles here (since relation between boss and employees is bidirectional).

**The case**<br/>
We are comparing two versions (historical states) of some employees hierarchy.
We have two <tt>Employee</tt> objects, <tt>oldBoss</tt> and <tt>newBoss</tt>. These guys are roots and handles to
our hierarchies.

We could consider following types of changes:

- employee hired, [`NewObject`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/NewObject.html)
- employee fired, [`ObjectRemoved`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ObjectRemoved.html)
- salary change, [`ValueChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ValueChange.html)
- boss change, [`ReferenceChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ReferenceChange.html)
- change on subordinates list, [`ListChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/container/ListChange.html).

We show code examples for 3 cases, employee hired, salary and boss change
(other cases are done similarly).
See the tests in <tt>EmployeeHierarchiesDiffExample.class</tt> below.

**Configuration** <br/>
JaVers needs to know that <tt>Employee</tt> class is an Entity.
It's enough to annotate <tt>name</tt> field with `@Id` annotation.

**What's important**<br/>
JaVers makes no assumptions about your data structures
and treats them just like a graphs with cycles (the same like JVM do).
There are no limitation about number of nodes in the graph.

<tt>[Employee.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Employee.java)</tt>:

```java
package org.javers.core.examples.model;

import javax.persistence.Id;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Employee {

    @Id
    private final String name;

    private final int salary;

    private Employee boss;

    private final List<Employee> subordinates = new ArrayList<>();

    public Employee(String name) {
        this(name, 10000);
    }

    public Employee(String name, int salary) {
        checkNotNull(name);
        this.name = name;
        this.salary = salary;
    }

    public Employee addSubordinate(Employee employee) {
        checkNotNull(employee);
        employee.boss = this;
        subordinates.add(employee);
        return this;
    }

    // ...
}
```

<tt>[EmployeeHierarchiesDiffExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/EmployeeHierarchiesDiffExample.java)</tt>:

```java
package org.javers.core.examples;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.NewObject;
import org.javers.core.diff.changetype.ObjectRemoved;
import org.javers.core.diff.changetype.ReferenceChange;
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Employee;
import org.junit.Test;
import static org.fest.assertions.api.Assertions.assertThat;

/**
 * @author bartosz walacik
 */
public class EmployeeHierarchiesDiffExample {

    /** {@link ValueChange} example */
    @Test
    public void shouldDetectSalaryChange(){
        //given
        Javers javers = JaversBuilder.javers().build();

        Employee oldBoss = new Employee("Big Boss")
            .addSubordinates(
                    new Employee("Noisy Manager"),
                    new Employee("Great Developer", 10000));

        Employee newBoss = new Employee("Big Boss")
            .addSubordinates(
                    new Employee("Noisy Manager"),
                    new Employee("Great Developer", 20000));

        //when
        Diff diff = javers.compare(oldBoss, newBoss);

        //then
        ValueChange change =  diff.getChangesByType(ValueChange.class).get(0);

        assertThat(change.getAffectedLocalId()).isEqualTo("Great Developer");
        assertThat(change.getProperty().getName()).isEqualTo("salary");
        assertThat(change.getLeft()).isEqualTo(10000);
        assertThat(change.getRight()).isEqualTo(20000);

        System.out.println("diff: " + javers.toJson(diff));
    }

    /** {@link NewObject} example */
    @Test
    public void shouldDetectHired() {
        //given
        Javers javers = JaversBuilder.javers().build();

        Employee oldBoss = new Employee("Big Boss")
                .addSubordinates(
                        new Employee("Great Developer"));

        Employee newBoss = new Employee("Big Boss")
                .addSubordinates(
                        new Employee("Great Developer"),
                        new Employee("Hired One"),
                        new Employee("Hired Second"));

        //when
        Diff diff = javers.compare(oldBoss, newBoss);

        //then
        assertThat(diff.getObjectsByChangeType(NewObject.class))
                .hasSize(2)
                .containsOnly(new Employee("Hired One"),
                              new Employee("Hired Second"));

        System.out.println("diff: " + javers.toJson(diff));
    }

    /** {@link ReferenceChange} example */
    @Test
    public void shouldDetectBossChange() {
        //given
        Javers javers = JaversBuilder.javers().build();

        Employee oldBoss = new Employee("Big Boss")
                .addSubordinates(
                        new Employee("Manager One")
                                .addSubordinate(new Employee("Great Developer")),
                        new Employee("Manager Second"));

        Employee newBoss = new Employee("Big Boss")
                .addSubordinates(
                        new Employee("Manager One"),
                        new Employee("Manager Second")
                                .addSubordinate(new Employee("Great Developer")));

        //when
        Diff diff = javers.compare(oldBoss, newBoss);

        //then
        ReferenceChange change = diff.getChangesByType(ReferenceChange.class).get(0);

        assertThat(change.getAffectedLocalId()).isEqualTo("Great Developer");
        assertThat(change.getLeft().getCdoId()).isEqualTo("Manager One");
        assertThat(change.getRight().getCdoId()).isEqualTo("Manager Second");

        System.out.println("diff: " + javers.toJson(diff));
    }

    /** {@link NewObject} example, large structure */
    @Test
    public void shouldDetectFiredForLargeDepthStructure() {
        //given
        Javers javers = JaversBuilder.javers().build();

        Employee oldBoss = new Employee("Big Boss");
        Employee boss = oldBoss;
        for (int i=0; i<1000; i++){
            boss.addSubordinate(new Employee("Emp no."+i));
            boss = boss.getSubordinates().get(0);
        }

        Employee newBoss = new Employee("Big Boss");

        //when
        Diff diff = javers.compare(oldBoss, newBoss);

        //then
        assertThat(diff.getChangesByType(ObjectRemoved.class)).hasSize(1000);
    }
}
```

Output of running this program is:

- <tt>shouldDetectSalaryChange</tt>():

```json
diff: {
  "changes": [
    {
      "changeType": "ValueChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Great Developer"
      },
      "property": "salary",
      "left": 10000,
      "right": 20000
    }
  ]
}
```

- <tt>shouldDetectHired</tt>():

```json
diff: {
  "changes": [
    {
      "changeType": "NewObject",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Hired Second"
      }
    },
    {
      "changeType": "NewObject",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Hired One"
      }
    },
    {
      "changeType": "ListChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Big Boss"
      },
      "property": "subordinates",
      "elementChanges": [
        {
          "elementChangeType": "ValueAdded",
          "index": 1,
          "value": {
            "entity": "org.javers.core.examples.model.Employee",
            "cdoId": "Hired One"
          }
        },
        {
          "elementChangeType": "ValueAdded",
          "index": 2,
          "value": {
            "entity": "org.javers.core.examples.model.Employee",
            "cdoId": "Hired Second"
          }
        }
      ]
    }
  ]
}
```


- <tt>shouldDetectBossChange</tt>():

```json
diff: {
  "changes": [
    {
      "changeType": "ListChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Manager Second"
      },
      "property": "subordinates",
      "elementChanges": [
        {
          "elementChangeType": "ValueAdded",
          "index": 0,
          "value": {
            "entity": "org.javers.core.examples.model.Employee",
            "cdoId": "Great Developer"
          }
        }
      ]
    },
    {
      "changeType": "ReferenceChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Great Developer"
      },
      "property": "boss",
      "left": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Manager One"
      },
      "right": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Manager Second"
      }
    },
    {
      "changeType": "ListChange",
      "globalId": {
        "entity": "org.javers.core.examples.model.Employee",
        "cdoId": "Manager One"
      },
      "property": "subordinates",
      "elementChanges": [
        {
          "elementChangeType": "ValueRemoved",
          "index": 0,
          "value": {
            "entity": "org.javers.core.examples.model.Employee",
            "cdoId": "Great Developer"
          }
        }
      ]
    }
  ]
}
```
