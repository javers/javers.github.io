---
layout: page
category: Documentation
title: Diff Examples
submenu: diff-examples
sidebar-url: docs-sidebar.html
---

All examples are runnable.
Checkout our github repository:

```text
git clone https://github.com/javers/javers.git
cd javers
```

Run examples as unit tests:

```text
./gradlew javers-core:test --tests BasicEntityDiffExample
```

<h2 id="compare-entities">Compare two Entity objects</h2>

Let’s start with something simple. This example shows how to find a diff between two objects of 
the `Employee` class. Every employee has his own identity, so the `Employee` class is mapped as Entity.
Our employee has some basic properties, collections, and references.
Just the usual stuff.

**The case**<br/>
We have two objects, `frodoOld` and `frodoNew`.
These objects represent two versions of the same being (a person called Frodo).
To find out what’s changed, just call:

```java
    javers.compare(frodoOld, frodoNew)
```    

**Configuration** <br/>
JaVers needs to know that the `Employee` class is an
[Entity](/documentation/domain-configuration/#entity)
and the `Address` class is a
[Value Object](/documentation/domain-configuration/#value-object).
It’s enough to annotate the `name` field with the `@Id` annotation to map `Employee` as Entity.
`Address` is mapped as Value Object by default.
See [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping) for 
more details about JaVers’ type system.

**What’s important**<br/>
Notice that both objects have the same Id value &mdash; `'Frodo'`.
That’s why they are matched and compared.
JaVers matches only objects with the same
[`GlobalId`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/GlobalId.java).
In this case, the GlobalId value is: `'Employee/Frodo'`.
Without the `@TypeName` annotation, it would be `'org.javers.core.examples.model.Employee/frodo'`.
<a name="Employee_java"/>

[`Employee.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Employee.java):

```java
@TypeName("Employee")
public class Employee {

    @Id
    private String name;

    private Position position;

    private int salary;

    private int age;

    private Employee boss;

    private List<Employee> subordinates = new ArrayList<>();

    private Address primaryAddress;

    private Set<String> skills;

    ... // omitted
}
```

[`Address.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Address.java):

```java
public class Address {
    private String city;

    private String street;

    ... // omitted
}
```    

[`BasicEntityDiffExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/BasicEntityDiffExample.java):

```java
@Test
public void shouldCompareTwoEntities() {
  //given
  Javers javers = JaversBuilder.javers()
          .withListCompareAlgorithm(LEVENSHTEIN_DISTANCE)
          .build();

  Employee frodoOld = EmployeeBuilder.Employee("Frodo")
          .withAge(40)
          .withPosition("Townsman")
          .withSalary(10_000)
          .withPrimaryAddress(new Address("Shire"))
          .withSkills("management")
          .withSubordinates(new Employee("Sam"))
          .build();

  Employee frodoNew = EmployeeBuilder.Employee("Frodo")
          .withAge(41)
          .withPosition("Hero")
          .withBoss(new Employee("Gandalf"))
          .withPrimaryAddress(new Address("Mordor"))
          .withSalary(12_000)
          .withSkills("management", "agile coaching")
          .withSubordinates(new Employee("Sméagol"), new Employee("Sam"))
          .build();

  //when
  Diff diff = javers.compare(frodoOld, frodoNew);

  //then
  assertThat(diff.getChanges()).hasSize(14);
}
```

The resulting [`Diff`]({{ site.github_core_main_url }}org/javers/core/diff/Diff.java)
is a container for the list of [`Changes`]({{ site.github_core_main_url }}org/javers/core/diff/Change.java).

There are three main types of Changes:

* [NewObject]({{ site.github_core_main_url }}org/javers/core/diff/changetype/NewObject.java) &mdash;
  when an object is present only in the right graph,
* [ObjectRemoved]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ObjectRemoved.java) &mdash;
  when an object is present only in the left graph,
* [PropertyChange]({{ site.github_core_main_url }}org/javers/core/diff/changetype/PropertyChange.java) &mdash;
  most common &mdash; a changed property (field or getter).

PropertyChange has the following subtypes:

* [ContainerChange]({{ site.github_core_main_url }}org/javers/core/diff/changetype/container/ContainerChange.java)
  &mdash; list of changed items in Set, List or Array,
* [MapChange]({{ site.github_core_main_url }}org/javers/core/diff/changetype/map/MapChange.java)
  &mdash; list of changed Map entries,
* [ReferenceChange]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ReferenceChange.java)
  &mdash; changed Entity reference,
* [ValueChange]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ValueChange.java)
  &mdash; changed Primitive or Value.
    
**You can print** the list of Changes using `prettyPrint()`:

```java
System.out.println("diff pretty print:");
System.out.println(diff.prettyPrint());
```

output: 

```text
diff pretty print:
Diff:
* new object: Employee/Sméagol
  - 'boss' = 'Employee/Frodo'
  - 'name' = 'Sméagol'
  - 'salary' = '10000'
* new object: Employee/Gandalf
  - 'name' = 'Gandalf'
  - 'salary' = '10000'
* changes on Employee/Frodo :
  - 'age' changed: '40' -> '41'
  - 'boss' = 'Employee/Gandalf'
  - 'position' changed: 'Townsman' -> 'Hero'
  - 'primaryAddress.city' changed: 'Shire' -> 'Mordor'
  - 'salary' changed: '10000' -> '12000'
  - 'skills' collection changes :
     · 'agile coaching' added
  - 'subordinates' collection changes :
     0. 'Employee/Sméagol' added
```

**Iterating** over the list of Changes:

```java
System.out.println("iterating over changes:");
diff.getChanges().forEach(change -> System.out.println("- " + change));
```

output:

```
iterating over changes:
- NewObject{ new object: Employee/Gandalf }
- NewObject{ new object: Employee/Sméagol }
- InitialValueChange{ property: 'name', left:'',  right:'Gandalf' }
- InitialValueChange{ property: 'salary', left:'',  right:'10000' }
- InitialValueChange{ property: 'name', left:'',  right:'Sméagol' }
- InitialValueChange{ property: 'salary', left:'',  right:'10000' }
- ReferenceChange{ property: 'boss', left:'',  right:'Employee/Frodo' }
- ValueChange{ property: 'position', left:'Townsman',  right:'Hero' }
- ValueChange{ property: 'salary', left:'10000',  right:'12000' }
- ValueChange{ property: 'age', left:'40',  right:'41' }
- ReferenceChange{ property: 'boss', left:'',  right:'Employee/Gandalf' }
- ListChange{ property: 'subordinates', elementChanges:1 }
- SetChange{ property: 'skills', elementChanges:1 }
- ValueChange{ property: 'city', left:'Shire',  right:'Mordor' }
```

Iterating over the list of Changes **grouped by objects**:

```java
System.out.println("iterating over changes grouped by objects");
diff.groupByObject().forEach(byObject -> {
    System.out.println("* changes on " +byObject.getGlobalId().value() + " : ");
    byObject.get().forEach(change -> System.out.println("  - " + change));
});
```

output:

```
iterating over changes grouped by objects
* changes on Employee/Sméagol : 
  - NewObject{ new object: Employee/Sméagol }
  - InitialValueChange{ property: 'name', left:'',  right:'Sméagol' }
  - InitialValueChange{ property: 'salary', left:'',  right:'10000' }
  - ReferenceChange{ property: 'boss', left:'',  right:'Employee/Frodo' }
* changes on Employee/Gandalf : 
  - NewObject{ new object: Employee/Gandalf }
  - InitialValueChange{ property: 'name', left:'',  right:'Gandalf' }
  - InitialValueChange{ property: 'salary', left:'',  right:'10000' }
* changes on Employee/Frodo : 
  - ValueChange{ property: 'position', left:'Townsman',  right:'Hero' }
  - ValueChange{ property: 'salary', left:'10000',  right:'12000' }
  - ValueChange{ property: 'age', left:'40',  right:'41' }
  - ReferenceChange{ property: 'boss', left:'',  right:'Employee/Gandalf' }
  - ListChange{ property: 'subordinates', elementChanges:1 }
  - SetChange{ property: 'skills', elementChanges:1 }
  - ValueChange{ property: 'city', left:'Shire',  right:'Mordor' }
```

Diff can be easily **serialized to JSON**:

```java
System.out.println(javers.getJsonConverter().toJson(diff));
```

```json
{
  "changes": [
    {
      "changeType": "NewObject",
      "globalId": {
        "entity": "Employee",
        "cdoId": "Gandalf"
      }
    },
    {
      "changeType": "NewObject",
      "globalId": {
        "entity": "Employee",
        "cdoId": "Sméagol"
      }
    },
    {
      "changeType": "InitialValueChange",
      "globalId": {
        "entity": "Employee",
        "cdoId": "Gandalf"
      },
      "property": "name",
      "propertyChangeType": "PROPERTY_VALUE_CHANGED"
    }
...
```

<h2 id="compare-graphs">Compare graphs</h2>

JaVers can compare arbitrary complex structures of objects.
In this example, we show how you can deeply compare employee hierarchies to detect specific types of changes.

For simplicity of this example, the data model is reduced to the one class &mdash; 
[Employee](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Employee.java)
 (the same as in the previous example).

Conceptually, an employee hierarchy is a tree.
Technically, we have a graph with cycles here (since the relationship between boss and employees is bidirectional).

**The case**<br/>
We are comparing two versions (historical states) of the employee hierarchy in order 
to detect the four types of changes:

- employee hired &mdash; `NewObject`,
- employee fired &mdash; `ObjectRemoved`,
- salary change &mdash; `ValueChange`,
- boss change &mdash; `ReferenceChange`.

**Configuration** <br/>
JaVers needs to know that `Employee` class is an [Entity](/documentation/domain-configuration/#entity).
It’s enough to annotate the `name` field with the `@Id` annotation. 

**What’s important**<br/>
JaVers makes no assumptions about your data structures
and treats them just like graphs with cycles (the same as JVM does).
There are no limitations on the number of nodes in the graph.

[`shouldDetectHired()`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/EmployeeHierarchiesDiffExample.java#L14):

```java
/** NewObject example */
@Test
public void shouldDetectHired() {
  //given
  Javers javers = JaversBuilder.javers().build();

  Employee oldBoss = new Employee("Big Boss").addSubordinates(
          new Employee("Great Developer"));

  Employee newBoss = new Employee("Big Boss").addSubordinates(
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
``` 

output:

```text
Diff:
* new object: Employee/Hired One
  - 'boss' = 'Employee/Big Boss'
  - 'name' = 'Hired One'
  - 'salary' = '10000'
* new object: Employee/Hired Second
  - 'boss' = 'Employee/Big Boss'
  - 'name' = 'Hired Second'
  - 'salary' = '10000'
* changes on Employee/Big Boss :
  - 'subordinates' collection changes :
     1. 'Employee/Hired One' added
     2. 'Employee/Hired Second' added
```                      

[`shouldDetectFired()`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/EmployeeHierarchiesDiffExample.java):

```java
/** ObjectRemoved example */
@Test
public void shouldDetectFired() {
  //given
  Javers javers = JaversBuilder.javers().build();

  Employee oldBoss = new Employee("Big Boss").addSubordinates(
      new Employee("Great Developer"),
      new Employee("Team Lead").addSubordinates(
              new Employee("Another Dev"),
              new Employee("To Be Fired")
      ));

  Employee newBoss = new Employee("Big Boss").addSubordinates(
      new Employee("Great Developer"),
      new Employee("Team Lead").addSubordinates(
              new Employee("Another Dev")
      ));

  //when
  Diff diff = javers.compare(oldBoss, newBoss);

  //then
  assertThat(diff.getChangesByType(ObjectRemoved.class)).hasSize(1);

  System.out.println(diff);
}
```

output:

```text
Diff:
* object removed: Employee/To Be Fired
  - 'boss' reference 'Employee/Team Lead' unset
  - 'name' value 'To Be Fired' unset
  - 'salary' value '10000' unset
* changes on Employee/Team Lead :
  - 'subordinates' collection changes :
     1. 'Employee/To Be Fired' removed
```
 
[`shouldDetectSalaryChange()`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/EmployeeHierarchiesDiffExample.java):

```java
  /** ValueChange example */
  @Test
  public void shouldDetectSalaryChange(){
    //given
    Javers javers = JaversBuilder.javers().build();

  Employee oldBoss = new Employee("Big Boss").addSubordinates(
      new Employee("Noisy Manager"),
      new Employee("Great Developer", 10000));

  Employee newBoss = new Employee("Big Boss").addSubordinates(
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
``` 

output:

```text
Diff:
* changes on Employee/Great Developer :
  - 'salary' changed: '10000' -> '20000'
```

[`shouldDetectBossChange()`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/EmployeeHierarchiesDiffExample.java#L102):

```java
/** ReferenceChange example */
@Test
public void shouldDetectBossChange() {
  //given
  Javers javers = JaversBuilder.javers().build();

  Employee oldBoss = new Employee("Big Boss").addSubordinates(
      new Employee("Manager One")
         .addSubordinate(new Employee("Great Developer")),
      new Employee("Manager Second"));

  Employee newBoss = new Employee("Big Boss").addSubordinates(
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
``` 

output:

```text
Diff:
* changes on Employee/Manager One :
  - 'subordinates' collection changes :
     0. 'Employee/Great Developer' removed
* changes on Employee/Great Developer :
  - 'boss' reference changed: 'Employee/Manager One' -> 'Employee/Manager Second'
* changes on Employee/Manager Second :
  - 'subordinates' collection changes :
     0. 'Employee/Great Developer' added
```

<h2 id="compare-valueobjects">Compare top-level Value Objects</h2>

This example shows how to find a diff between two objects of the `Address` class.
Address is a typical [Value Object](/documentation/domain-configuration/#value-object), it doesn’t have its own identity.
It’s just a complex value holder.

**The case**<br/>
We have two objects, `address1` and `address2`. These objects represent two different addresses.
To find out what the difference is, just call:

```java
javers.compare(address1, address2)
```

**What’s important**<br/>
When JaVers knows nothing about a class, it treats it as Value Object.
As we said in the previous example, JaVers compares only objects with the same GlobalId.

What’s the Address Id? It’s based on the path in the object graph.
In this case, both objects are roots, so the path is simply `'/'`
and the GlobalId is `'org.javers.core.examples.model.Address/'`.

[`Address.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/model/Address.java):

```java
public class Address {
    private String city;

    private String street;

    ... // omitted
}
``` 

[`BasicValueObjectDiffExample.java`](https://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/BasicValueObjectDiffExample.java):

```java
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
```    

The output of running this program is:

```
Diff:
* changes on org.javers.core.examples.model.Address/ :
  - 'street' changed: '5th Avenue' -> '6th Avenue'
```

<h2 id="compare-collections">Compare top-level collections</h2>

JaVers can compare arbitrary complex structures of objects,
including collections passed as top-level handles.

If you want to compare top-level collections with Primitives or 
[Values](/documentation/domain-configuration/#ValueType)
(see [domain-model-mapping](/documentation/domain-configuration/#domain-model-mapping)),
you can use the standard `javers.compare(Object, Object)` method.
Collection items will be compared using `equals()`, resulting in a flat list of Changes.

But when you need to compare top-level collections with complex items,
like Entities or Value Objects, use `javers.compareCollections(Collection, Collection, Class)`.
This method builds object graphs and compares them deeply,
using `itemClass` as a hint about the item’s type.

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

[`ComparingTopLevelCollectionExample`<wbr/>`.java`](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/ComparingTopLevelCollectionExample.java):

```java
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
```

The output:

```text
Diff:
* changes on org.javers.core.examples.model.Person/tommy :
  - 'name' changed: 'Tommy Smart' -> 'Tommy C. Smart'
```

<h2 id="groovy-diff-example">Groovy diff example</h2>

In JaVers we love the [Groovy](http://www.groovy-lang.org/) language.
From the very beginning of the JaVers project, we used the [Spock framework](http://docs.spockframework.org)
for writing tests.
One of Groovy’s killer features is excellent interoperability with Java.
Looking from the other side, modern Java frameworks should be Groovy friendly. 

As you know, all Java classes extend the `Object` class.
All Groovy classes extend `GroovyObject`,
that’s how Groovy implements its metaprogramming features. 

Good news, JaVers is fully compatible with Groovy!
You can compare and commit Groovy objects in the same way as plain Java objects.
Let’s see how it works:


[`GroovyDiffExample.groovy`](http://github.com/javers/javers/blob/master/javers-core/src/test/groovy/org/javers/core/examples/GroovyDiffExample.groovy):

```groovy
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
In the example, we use the `FIELD` (default) mapping style.
Since Groovy generates getters and setters on the fly, you
can also use the `BEAN` mapping style without adding boilerplate code to domain classes.

## Custom Value comparator example

In this example, we show how to use 
[Custom Value comparators](/documentation/diff-configuration/#custom-value-comparators)
to play with `BigDecimals` equality.

Javers comes with two Custom comparators for `BigDecimals`,
they are ready to use in your project:

* [`CustomBigDecimalComparator`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/CustomBigDecimalComparator.java)
  compares BigDecimals after rounding to the required scale,
* [`BigDecimalComparatorWithFixedEquals`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/BigDecimalComparatorWithFixedEquals.java)
  compares BigDecimals in the correct (arithmetical) way &mdash; ignoring trailing zeros.

[`CustomBigDecimalComparator.java`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/CustomBigDecimalComparator.java):

```java
public class CustomBigDecimalComparator implements CustomValueComparator<BigDecimal>{
    private int significantDecimalPlaces;

    public CustomBigDecimalComparator(int significantDecimalPlaces) {
        this.significantDecimalPlaces = significantDecimalPlaces;
    }

    @Override
    public boolean equals(BigDecimal a, BigDecimal b) {
        return round(a).equals(round(b));
    }

    @Override
    public String toString(BigDecimal value) {
        return round(value).toString();
    }

    private BigDecimal round(BigDecimal val) {
        return val.setScale(significantDecimalPlaces, ROUND_HALF_UP);
    }
}
```

Comparing `BigDecimals` rounded to two decimal digits (Groovy):

```groovy
class ValueObject {
    BigDecimal value
    List<BigDecimal> values
}

def "should compare BigDecimal properties with desired precision"(){
  given:
  def javers = JaversBuilder.javers()
         .registerValue(BigDecimal, new CustomBigDecimalComparator(2)).build()

  expect:
  javers.compare(new ValueObject(value: 1.123), new ValueObject(value: 1.124)).changes.size() == 0
  javers.compare(new ValueObject(value: 1.12),  new ValueObject(value: 1.13)).changes.size()  == 1
}
```

[`BigDecimalComparatorWithFixedEquals.java`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/BigDecimalComparatorWithFixedEquals.java):
```java
public class BigDecimalComparatorWithFixedEquals implements CustomValueComparator<BigDecimal> {
    @Override
    public boolean equals(BigDecimal a, BigDecimal b) {
        return a.compareTo(b) == 0;
    }

    @Override
    public String toString(BigDecimal value) {
        return value.stripTrailingZeros().toString();
    }
}
```

Comparing `BigDecimals` in the correct, arithmetical way (Groovy): 

```groovy
def "should compare BigDecimal with fixed equals"() {
    when: "comparing using BigDecimal.equals()"
    def javers = JaversBuilder.javers().build()

    then:
    javers.compare(new ValueObject(value: 1.000), new ValueObject(value: 1.00)).changes.size() == 1

    when: "comparing using arithmetical equals()"
    javers = JaversBuilder.javers()
            .registerValue(BigDecimal, new BigDecimalComparatorWithFixedEquals())
            .build()

    then:
    javers.compare(new ValueObject(value: 1.000), new ValueObject(value: 1.00)).changes.size() == 0
    javers.compare(new ValueObject(value: 1.100), new ValueObject(value: 1.20)).changes.size() == 1
}
```

## Custom Property comparator example

In this example, we show how to use a
[Custom Property comparator](/documentation/diff-configuration/#custom-property-comparators)
to calculate `SetChange`.
Our comparator is called `FunnyStringComparator` and it compares Strings as character Sets.
The logic is simple. When two Strings are built from the same set of characters &mdash;
we don’t see a difference. Otherwise, we log each added or removed character.
 
Check the full example implemented in
[CustomPropertyComparatorExample.groovy](https://github.com/javers/javers/blob/master/javers-core/src/test/groovy/org/javers/core/examples/CustomPropertyComparatorExample.groovy)
as a Spock test.
Here we show the most essential part.

First, the comparator implementation:

```groovy
/**
 * Compares Strings as character sets
 */
class FunnyStringComparator implements CustomPropertyComparator<String, SetChange> {
    @Override
    Optional<SetChange> compare(String left, String right, PropertyChangeMetadata metadata, Property property) {
        if (equals(left, right)) {
            return Optional.empty()
        }

        Set leftSet = left.toCharArray().toSet()
        Set rightSet = right.toCharArray().toSet()

        List<ContainerElementChange> changes = []
        Sets.difference(leftSet, rightSet).forEach{c -> changes.add(new ValueRemoved(c))}
        Sets.difference(rightSet, leftSet).forEach{c -> changes.add(new ValueAdded(c))}

        return Optional.of(new SetChange(metadata, changes))
    }

    @Override
    boolean equals(String a, String b) {
        a.toCharArray().toSet() == b.toCharArray().toSet()
    }

    @Override
    String toString(String value) {
        return value;
    }
}
```

In the test, we compare two Value Objects with a `String` property:

```groovy
class ValueObject {
    String value
}
```

Let’s see how `FunnyStringComparator` compares String properties:

```groovy
def "should use FunnyStringComparator to compare String properties"(){
    given:
    def javers = JaversBuilder.javers()
            .registerCustomType(String, new FunnyStringComparator()).build()

    when:
    def diff = javers.compare(new ValueObject(value: "aaa"), new ValueObject(value: "a"))
    println "first diff: "+ diff

    then:
    diff.changes.size() == 0

    when:
    diff = javers.compare(new ValueObject(value: "aaa"), new ValueObject(value: "b"))
    println "second diff: "+ diff

    then:
    diff.changes.size() == 1
    diff.changes[0] instanceof SetChange
    diff.changes[0].changes.size() == 2 // two item changes in this SetChange
}
``` 

output:

```text
first diff: Diff:

second diff: Diff:
* changes on org.javers.core.examples.CustomPropertyComparatorExample$Entity/ :
  - 'value' collection changes :
    . 'a' removed
    . 'b' added
```