---
layout: docs
title:  Diff Examples
submenu: diff-examples
---

All examples are runnable.
Checkout our github repository:

```
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```
./gradlew javers-core:example -Dtest.single=BasicEntityDiffExample
./gradlew javers-core:example -Dtest.single=BasicValueObjectDiffExample
...
```

<h2 id="compare-entities">Compare two Entity objects</h2>

Let’s start from something simple. This example shows how to find a diff between two objects of `Person` class.
Since every person has his own identity, Person class is an Entity
(see [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping) for Entity definition).

**The case**<br/>
We have two objects, `tommyOld` and `tommyNew`.
These objects represent two versions of the same being (a person called Tommy).
To find out what’s changed, just call

    javers.compare(tommyOld, tommyNew)

**Configuration** <br/>
JaVers needs to know that Person class is an Entity.
It’s enough to annotate `login` field with `@Id` annotation.

**What’s important**<br/>
Notice that both objects have the same Id value (`'tommy'`).
That’s why they are matched and compared.
JaVers compares only objects with the same [`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html).
In this case, it’s `'org.javers.core.examples.model.Person/tommy'`.

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

`BasicEntityDiffExample.class`:

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
    assertThat(change.getPropertyName()).isEqualTo("name");
    assertThat(change.getAffectedGlobalId()
        .value()).isEqualTo("org.javers.core.examples.model.Person/tommy");
    assertThat(change.getLeft()).isEqualTo("Tommy Smart");
    assertThat(change.getRight()).isEqualTo("Tommy C. Smart");

    System.out.println(diff);
  }
}
```

The output of running this program is:

```
Diff:
1. ValueChange{globalId:'org.javers.core.examples.model.Person/tommy',
               property:'name', oldVal:'Tommy Smart', newVal:'Tommy C. Smart'}

```

<h2 id="compare-valueobjects">Compare ValueObjects</h2>

This example shows how to find a diff between two objects of `Address` class.
Address is a typical ValueObject; it doesn’t have its own identity. It’s just a complex value holder
(see [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping) for ValueObject definition).

**The case**<br/>
We have two objects, `address1` and `address2`. These objects represent two different addresses.
To find out what the difference is, just call

    javers.compare(address1, address2)

**Configuration** <br/>
In this case, no configuration is required since JaVers is going to map
Address class as ValueObject by default.

**What’s important**<br/>
When JaVers knows nothing about a class, it treats it as ValueObject.
As we said in the previous example, JaVers compares only objects with the same
[`GlobalId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/GlobalId.html).
What’s the Address Id? Well, it’s a tricky beast...

It’s based on the path in the object graph. In this case, both objects are roots, so the path is simply `'/'`
and the GlobalId is `'org.javers.core.examples.model.Address/'`.


`Address.class:`

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

`BasicValueObjectDiffExample.class:`

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
    assertThat(change.getAffectedGlobalId().value())
              .isEqualTo("org.javers.core.examples.model.Address/");
    assertThat(change.getPropertyName()).isEqualTo("street");
    assertThat(change.getLeft()).isEqualTo("5th Avenue");
    assertThat(change.getRight()).isEqualTo("6th Avenue");

    System.out.println(diff);
  }
}
```    

The output of running this program is:

```
Diff:
1. ValueChange{globalId:'org.javers.core.examples.model.Address/',
               property:'street', oldVal:'5th Avenue', newVal:'6th Avenue'}
```

<h2 id="compare-graphs">Compare graphs</h2>

JaVers can compare arbitrary complex structures of objects.
In this example, we show how easily you can compare employee hierarchies.

For the simplicity of this example, the data model is reduced to one class,
`Employee` (see below).

Conceptually, an employee hierarchy is a tree.
Technically, we have a graph with cycles here (since the relationship between boss and employees is bidirectional).

**The case**<br/>
We are comparing two versions (historical states) of an employee hierarchy.
We have two Employee objects, `oldBoss` and `newBoss`. These guys are roots and handles to
our hierarchies.

We could consider the following types of changes:

- employee hired — [`NewObject`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/NewObject.html)
- employee fired — [`ObjectRemoved`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ObjectRemoved.html)
- salary change — [`ValueChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ValueChange.html)
- boss change — [`ReferenceChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/ReferenceChange.html)
- change on subordinates list — [`ListChange`]({{ site.javadoc_url }}index.html?org/javers/core/diff/changetype/container/ListChange.html).

We show code examples for three cases: employee hired, salary change and boss change
(other cases are done similarly).
See the tests in `EmployeeHierarchiesDiffExample.class` below.

**Configuration** <br/>
JaVers needs to know that Employee class is an Entity.
It’s enough to annotate the `name` field with `@Id` annotation.

**What’s important**<br/>
JaVers makes no assumptions about your data structures
and treats them just like graphs with cycles (the same as JVM does).
There are no limitations on the number of nodes in the graph.

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
import org.javers.core.diff.changetype.*;
import org.javers.core.examples.model.Employee;
import org.junit.Test;
import static org.fest.assertions.api.Assertions.assertThat;

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
    assertThat(change.getPropertyName()).isEqualTo("salary");
    assertThat(change.getLeft()).isEqualTo(10000);
    assertThat(change.getRight()).isEqualTo(20000);

    System.out.println(diff);
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

    System.out.println(diff);
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
    assertThat(change.getLeft().value()).endsWith("Manager One");
    assertThat(change.getRight().value()).endsWith("Manager Second");

    System.out.println(diff);
  }

  /** {@link NewObject} example, large structure */
  @Test
  public void shouldDetectFiredInLargeDepthStructure() {
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

The output of running this program is:

```
//.. shouldDetectSalaryChange()

1. ValueChange{
   globalId:'org.javers.core.examples.model.Employee/Great Developer',
   property:'salary', oldVal:'10000', newVal:'20000'}


//.. shouldDetectHired()

1. NewObject {
   globalId:'org.javers.core.examples.model.Employee/Hired Second'}
2. NewObject {
   globalId:'org.javers.core.examples.model.Employee/Hired One'}
3. ListChange{
   globalId:'org.javers.core.examples.model.Employee/Big Boss',
   property:'subordinates',
   containerChanges:[(1).added:'org.javers.core.examples.model.Employee/Hired One',
                     (2).added:'org.javers.core.examples.model.Employee/Hired Second']}


//.. shouldDetectBossChange()

Diff:
1. ReferenceChange{
   globalId:'org.javers.core.examples.model.Employee/Great Developer',
   property:'boss',
   oldRef:'org.javers.core.examples.model.Employee/Manager One',
   newRef:'org.javers.core.examples.model.Employee/Manager Second'}
2. ListChange{
   globalId:'org.javers.core.examples.model.Employee/Manager Second',
   property:'subordinates',
   containerChanges:[(0).added:'org.javers.core.examples.model.Employee/Great Developer']}
3. ListChange{
   globalId:'org.javers.core.examples.model.Employee/Manager One',
   property:'subordinates',
   containerChanges:[(0).removed:'org.javers.core.examples.model.Employee/Great Developer']}
```

<h2 id="compare-collections">Compare top-level collections</h2>

JaVers can compare arbitrary complex structures of objects,
including collections passed as top-level handles.

If you want to compare top-level collections with simple items like Primitives or Values
(see [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping),
you can use the standard `javers.compare(Object, Object)` method.
Collection items will be compared using `equals()`, resulting in a flat list of Changes.

But when you need to compare top-level collections with complex items,
like Entities or ValueObjects, use `javers.compareCollections(Collection, Collection, Class)`.
This method builds object graphs and compares them deeply,
using `itemClass` as a hint about the items type.

**The case**<br/>
When collections are properties of a domain object, for example:

```java
public class Boss {
    @Id private String name;

    private final List<Person> subordinates = new ArrayList<>();
}
```

JaVers uses Reflection and captures `Person` as the item type in the `subordinates` collection.

But when collections are passed as top-level references, for example:

```java
Diff diff = javers.compare(oldList, newList);
```

due to type erasure, there is no way to statically determine the type of items stored in collections.

Luckily, `compareCollections()` comes to the rescue
and gives you exactly the same diff result for top-level collections as if they were object properties.

<tt>[ComparingTopLevelCollectionExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ComparingTopLevelCollectionExample.java)</tt>

```java
package org.javers.core.examples;

import org.javers.common.collections.Lists;
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.ValueChange;
import org.javers.core.examples.model.Person;
import org.junit.Test;
import java.util.List;
import static org.fest.assertions.api.Assertions.assertThat;

/**
 * @author bartosz.walacik
 */
public class ComparingTopLevelCollectionExample {

  @Test
  public void shouldDeeplyCompareTwoTopLevelCollections() {
    //given
    Javers javers = JaversBuilder.javers().build();

    List<Person> oldList = Lists.asList( new Person("tommy", "Tommy Smart") );
    List<Person> newList = Lists.asList( new Person("tommy", "Tommy C. Smart") );

    //when
    Diff diff = javers.compareCollections(oldList, newList, Person.class);

    //then
    //there should be one change of type {@link ValueChange}
    ValueChange change = diff.getChangesByType(ValueChange.class).get(0);

    assertThat(diff.getChanges()).hasSize(1);
    assertThat(change.getPropertyName()).isEqualTo("name");
    assertThat(change.getLeft()).isEqualTo("Tommy Smart");
    assertThat(change.getRight()).isEqualTo("Tommy C. Smart");

    System.out.println(diff);
  }
}
```

<h2 id="groovy-diff-example">Groovy diff example</h2>

In JaVers we love [Groovy](http://www.groovy-lang.org/) language.
From the very beginning of JaVers project we use [Spock framework](http://docs.spockframework.org)
for writing tests.
Recently, Groovy gains momentum as the full-blown application language.
One of Groovy’s killer features is excellent interoperability with Java.
Looking from the other side, modern Java frameworks should be Groovy friendly. 

As you know, all Java classes extends `Object` class.
All Groovy classes extends [GroovyObject](http://docs.groovy-lang.org/latest/html/api/groovy/lang/GroovyObject.html),
that’s how Groovy implements it’s metaprogramming features. 

Good news, JaVers is fully compatible with Groovy!
Simply, you can compare and commit Groovy objects
in the same way as plain Java objects.
Let’s see how it works.


<tt>[GroovyDiffExample.groovy](http://github.com/javers/javers/blob/master/javers-core/src/test/groovy/org/javers/core/examples/GroovyDiffExample.groovy)</tt>

```groovy
package org.javers.core.examples

import groovy.transform.TupleConstructor
import org.javers.core.JaversBuilder
import org.javers.core.metamodel.annotation.Id
import spock.lang.Specification

class GroovyDiffExample extends Specification {

    @TupleConstructor
    class Person {
        @Id login
        String lastName
    }

    def "should calculate diff for GroovyObjects"(){
      given:
      def javers = JaversBuilder.javers().build()

      when:
      def diff = javers.compare(
          new Person('bob','Uncle'),
          new Person('bob','Martin')
      )

      then:
      diff.changes.size() == 1
      diff.changes[0].left == 'Uncle'
      diff.changes[0].right == 'Martin'
    }
}
```

No special JaVers configuration is required for Groovy.
In the example we use `FIELD` (default) mapping style.
Since Groovy generates getters and setters on the fly, you
can also use `BEAN` mapping style without adding boilerplate code to domain classes.
