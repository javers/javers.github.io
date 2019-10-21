---
layout: page
category: Documentation
title: Domain Configuration
submenu: domain-configuration
sidebar-url: docs-sidebar.html
---

None of us like to configure tools but don’t worry — JaVers knows it and
does the hard work to minimize the configuration efforts on your side.

As we stated before, JaVers configuration is very concise.
You can start with zero config and give JaVers a chance to infer all the facts about your domain model.

Take a look how JaVers deals with your data. If it’s fine, let the defaults work for you.
Add more configuration when you want to change the default behavior.

There are two logical areas of the the configuration,
[domain model mapping](/documentation/domain-configuration#domain-model-mapping)
and
[repository setup](/documentation/repository-configuration).
Proper mapping is important for both JaVers features, the object diff and the data audit (JaversRepository).

The object diff algorithm is the core of JaVers. When two objects are compared, JaVers needs to know what
type they are.
We distinguish between the following types: Entities, Value Objects, Values, Containers, and Primitives.
Each type has a different comparing style.

JaVers can infer the type of your classes, but if it goes wrong, the diff result might be strange.
In this case you should tune the type mapping.

For now, we support both the Java config via [`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java)
and the annotations config.

<h2 id="domain-model-mapping">Domain model mapping</h2>

**Why domain model mapping is important?**<br/>
Many frameworks which deal with user domain model (aka data model) use some kind of <b>mapping</b>.
For example JPA uses annotations in order to map user classes into a relational database.
Plenty of XML and JSON serializers use various approaches to mapping, usually based on annotations.

When combined together, all of those framework-specific annotations could be a pain and a
pollution in your business domain code.

Mapping is also a case in JaVers but don’t worry:

* JaVers wants to know only a few basic facts about your domain model classes.
* Mapping is done mainly on the class level — property level mapping is required only for
  choosing Entity ID.
* JaVers scans well-known annotations sets like JPA and Hibernate (see [supported annotations table](#supported-annotations)).
  So if your classes are already annotated with these sets, you are lucky.
  If not, JaVers provides its [`own annotations set`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation).
* If you’d rather keep your domain model classes framework agnostic,
  use [`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java).
* JaVers uses reasonable defaults and takes advantage of a *type inferring algorithm*.
  So for a quick start just let JaVers do the mapping for you.
  Later on, it would be advisable to refine the mapping in order to optimize the diff semantic.

Proper mapping is essential for the diff algorithm, for example JaVers needs to know if a given object
should be compared property-by-property or using equals().

### JaVers Types
The JaVers type system is based on *Entity* and *Value Objects* notions, following Eric Evans
Domain Driven Design terminology (DDD).
Furthermore, JaVers uses *Value*, *Primitive*, and *Container* notions.
The last two types are JaVers internals and can’t be mapped by a user.

To make long story short, JaVers needs to know
the [`JaversType`]({{ site.github_core_main_url }}org/javers/core/metamodel/type/JaversType.java)
for each of your classes spotted in runtime (see [mapping configuration](#mapping-configuration)).

Let’s examine the fundamental types more closely.

<h3 id="entity">Entity</h3>
JaVers [`Entity`]({{ site.github_core_main_url }}org/javers/core/metamodel/type/EntityType.java) has exactly the same semantic as DDD Entity or JPA Entity.
It’s a big domain object (for example Person, Company, Car).

Usually, each Entity instance represents a concrete physical object
which can be identified.
An Entity has a list of mutable properties and its own identity held in *ID property*.

For example:

```groovy
@TypeName("Person")
class Person {
    @Id String name
    String position
}

def "should map Person as EntityType"(){
  given:
  def bob = new Person(name: "Bob", position: "dev")
  def javers = JaversBuilder.javers().build()

  def personType = javers.getTypeMapping(Person)
  def bobId = personType.createIdFromInstance(bob)

  expect:
  bobId.value() == "Person/Bob"
  bobId instanceof InstanceId
  
  println "JaversType of Person: " + personType.prettyPrint()
  println "ID of bob: '${bobId.value()}'"
}
```

output:

```text
JaversType of Person: EntityType{
  baseType: class org.javers.core.examples.CustomToStringExample$Person
  typeName: Person
  managedProperties:
    Field String name; //declared in Person
    Field String position; //declared in Person
  idProperty: name
}
ID of bob: 'Person/Bob'
```

**Comparing strategy** for Entity state is property-by-property. 
For Entity references, comparing is based on InstanceId.

Entity can contain Value Objects, Entity references, Containers, Values and Primitives.

<h3 id="entity-id">Entity ID</h3>

Entity ID has a special role in JaVers. It identifies an Entity instance.
You need to choose **exactly one** property as ID for each of your Entity classes
(we call it ID property).
 
For each Entity instance, JaVers creates a global identifier called
[`InstanceId`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/InstanceId.java).
It’s a String composed of an Entity type name and an ID value.

Since InstanceId value is a String, each object used as Entity ID
should have a good String representation.

There are three ways of creating a **String representation** for an Entity ID:

* For Primitives (and we recommend using Primitives here), JaVers simply calls `Object.toString()`. 

* For Objects, JaVers uses the [`reflectiveToString()`]({{ site.github_core_main_url }}org/javers/common/reflection/ReflectionUtil.java)
function by default, which concatenates `toString()` called on
all properties of a given Object ID. 

* For Objects, you can also register a custom function to be used instead of
[`reflectiveToString()`]({{ site.github_core_main_url }}org/javers/common/reflection/ReflectionUtil.java).

For example:

```groovy
@TypeName("Entity")
class Entity {
    @Id Point id
    String data
}

class Point {
    double x
    double y

    String myToString() {
        "("+ (int)x +"," +(int)y + ")"
    }
}
    
def "should use custom toString function for complex Id"(){
  given:
  Entity entity = new Entity(id: new Point(x: 1/3, y: 4/3))

  when: "default reflectiveToString function"
  def javers = JaversBuilder.javers()
          .build()
  GlobalId id = javers.getTypeMapping(Entity).createIdFromInstance(entity)

  then:
  id.value() == "Entity/0.3333333333,1.3333333333"

  when: "custom toString function"
  javers = JaversBuilder.javers()
          .registerValueWithCustomToString(Point, {it.myToString()})
          .build()
  id = javers.getTypeMapping(Entity).createIdFromInstance(entity)

  then:
  id.value() == "Entity/(0,1)"
}
```   

**ProTip:** The JaversType of an ID property type is mapped automatically
to Value if it’s an Object or to Primitive if it’s a Java primitive.
So &mdash; technically &mdash; you can’t have a Value Object type here. 

**ProTip:** JaVers doesn’t distinguish between JPA `@Id` and `@EmbeddedId` annotations,
so you can use them interchangeably. 

<h3 id="value-object">Value Object</h3>
JaVers [`ValueObject`]({{ site.github_core_main_url }}org/javers/core/metamodel/type/ValueObjectType.java) is similar to DDD Value Object and JPA Embeddable.
It’s a complex value holder with a list of mutable properties but without a unique identifier.

Value Object instances has a 'best effort' global identifier called
[`ValueObjectId`]({{ site.github_core_main_url }}org/javers/core/metamodel/object/ValueObjectId.java).
It consists of the owning Entity InstanceId and
the path in an object subtree.

**Comparing strategy** for Value Objects is property-by-property.

**ProTip:** In a strict DDD approach, Value Object can’t exist independently and has to be bound to an Entity instance
(as a part of an Aggregate). JaVers is not so radical and supports both embedded and dangling Value Objects.
So in JaVers, Value Object is just an Entity without identity.

**Example** Value Object class:

```java
// Value Object is the default type in Javers, so @ValueObject annotation can be omitted
public class Address {
    private final String city;
    private final String street;
    private final String zipCode;

    public Address(String city, String street, String zipCode) {
        this.city = city;
        this.street = street;
        this.zipCode = zipCode;
    }

    // Value Object instances are compared property-by-property,
    // so the Object.equals() method is ignored by Javers
    @Override
    public boolean equals(Object o) {
        ...
    }
}
```

<h3 id="ValueType">Value</h3>
Javers [`Value`]({{ site.github_core_main_url }}org/javers/core/metamodel/type/ValueType.java)
is a simple value holder.
A Value class could have more than one field, but they are treated as an internal state.
For the rest of the world, a Value is a ... single value. 
<br/>
A few **examples** of well-known Value types: `BigDecimal`, `LocalDate`, `String`, `URL`. 

**Comparing strategy** for Values is (by default) based on **`Object.equals()`**.
So it’s highly important to implement this method properly,
it should compare the underlying state of given objects.

Values defined in `java.*` packages, like `BigDecimal` or `LocalDate` have it already.
Remember to implement `equals()` for all your Value classes.

If you don’t control the Value implementation, 
you can still change the comparing strategy by registering a
[`CustomValueComparator`]({{ site.github_core_main_url }}org/javers/core/diff/custom/CustomValueComparator.java).

For example, if you want to compare `BigDecimals` rounded to two decimal places:
 
```java
JaversBuilder.javers()
    .registerValue(BigDecimal.class, new CustomBigDecimalComparator(2))
    .build();
``` 

Read more about [Custom comparators](/documentation/diff-configuration/#custom-comparators).

For Values, it’s advisable to customize JSON serialization by implementing *Type Adapters*
(see [custom JSON serialization](/documentation/repository-configuration/#custom-json-serialization)).

**Example** Value class with proper `equals()` and `hashCode()`:

```java
@Value
class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;

        Point that = (Point) o;
        return this.x == that.x && this.y == that.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

<h2 id="mapping-configuration">Mapping configuration</h2>
Your task is to identify *Entities*, *Value Objects* and *Values* in your domain model
and make sure that JaVers has got it. So what should you do?

There are four ways to map a class:

1. **Explicitly**, using one of the [`JaversBuilder.register...()`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java)
   methods:
    * `registerEntity(Class entityClass, String idPropertyName)`,
    * `registerValueObject(Class valueObjectClass)`,
    * `registerValue(Class valueClass)`,
    * ...
1. **Explicitly**, using annotations, see [class level annotations](#class-level-annotations).
1. **Implicitly**, using the *type inferring algorithm* based on the class inheritance hierarchy.
   JaVers **propagates** the class mapping down to the inheritance hierarchy.
   If a class is not mapped (by method 1 or 2),
   JaVers maps this class the in same way as its nearest supertype (superclass or interface)
1. **Use the defaults.** By default, JaVers maps a class to Value Object. 

**Priorities** <br/>
[`JaversBuilder.register...()`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java) methods have a higher priority 
then annotations &mdash; JaVers ignores type annotations when a class is already
registered in JaversBuilder.
Type inferring algorithm has the lowest priority.

**Mapping ProTips**

* First, try to map high level abstract classes.
  For example, if all of your Entities extend some abstract class,
  you can map only this class using [`@Entity`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Entity.java).
* JaVers automatically scans JPA annotations
  and maps classes with `@javax.persistence.Entity` as Entities
  and classes with `@javax.persistence.Embeddable` as Value Objects.
  So if you are using frameworks like Hibernate, your mapping is probably almost done.
* Use [`@TypeName`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/TypeName.java)
  annotation for Entities, it gives you freedom of class names refactoring. 
* In some cases, annotations could be misleading for JaVers.
  For example [Morphia](https://github.com/mongodb/morphia) framework uses `@Entity` annotation for each persistent class
  (even for Value Objects). This could cause incorrect JaVers mapping.
  As a solution, use the [`JaversBuilder.register...()`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java)
  methods, as they have higher priority than annotations.
* For an Entity, a type of its Id-property is mapped as Value by default.
* If JaVers knows nothing about a class &mdash; defaulted mapping is Value Object..
* JaVers compares objects deeply. It can cause performance problems for large object graphs.
  Use [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java)
  and [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
  to [ignoring things](#ignoring-things).
* If you are not sure how JaVers maps your class, check effective mapping using
  [`getTypeMapping(Class<?>)`]({{ site.github_core_main_url }}org/javers/core/Javers.java#getTypeMapping-java.lang.Class-) method.
  Once you have JaversType for your class, you can pretty-print it:
  ```java
  println( javers.getTypeMapping(YourClass.class).prettyPrint() )
  ```   

<h2 id="supported-annotations">Supported annotations</h2>

JaVers supports two sets of annotations:
JaVers native [`set`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation) (recommended)
and JPA set (to some extent).

**ProTip:** JaVers ignores package names and cares only about simple class names.
So you can use any annotation as long as its name matches one of the names from JPA or JaVers sets.

<h3 id="class-level-annotations">Class level annotations</h3>

There are six class level annotations in JaVers:

* [`@Entity`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Entity.java)
  &mdash;
  declares a given class (and all its subclasses) as the [Entity](#entity) type.
   
* [`@ValueObject`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ValueObject.java)
  &mdash;
  declares a given class (and all its subclasses) as the [Value Object](#value-object) type.
  
* [`@Value`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Value.java)
  &mdash;
  declares a given class (and all its subclasses) as the [Value](#ValueType) type.
  
* [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
  &mdash;
  declares a given class as totally ignored by JaVers. 
  All properties with ignored type are ignored.<br/>
  Use it for **limiting depth** of object graphs to compare. See [ignoring things](#ignoring-things). 

* [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java)
  &mdash;
  declares a given class as the Shallow Reference type.
  It’s a tricky variant of the Entity type with all properties except Id ignored.<br/>
  Use it as the less radical alternative to [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
  for **limiting depth** of object graphs to compare. See [ignoring things](#ignoring-things). 
  
* [`@IgnoreDeclaredProperties`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/IgnoreDeclaredProperties.java)
  &mdash;
  use it to mark all properties **declared** in a given class as ignored by JaVers. <br/>
  JaVers still tracks changes done on properties inherited from a superclass.
  See [ignoring things](#ignoring-things). 
  
* [`@TypeName`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/TypeName.java)
  &mdash;
  a convenient way to name Entities and Value Objects.
  We recommend using this annotation for all Entities and Value Objects.
  Otherwise, Javers uses fully-qualified class names 
  in GlobalIds, which hinders refactoring classes committed to JaversRepository.  

Three **JPA** Class level annotations are interpreted as synonyms of JaVers annotations:

* `@javax.persistence.Entity` &mdash; synonym of JaVers’ [`@Entity`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Entity.java),
* `@javax.persistence.MappedSuperclass` &mdash; also the synonym of JaVers’ [`@Entity`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Entity.java),
* `@javax.persistence.Embeddable` &mdash; the synonym of JaVers’ [`@ValueObject`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ValueObject.java).

<h3 id="property-level-annotations">Property level annotations</h3>

There are three property level annotations:

* [`@Id`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Id.java)
  &mdash; 
  declares the [Id-property](#entity-id-property) of an Entity. 
 
* [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
  &mdash;
  declares a property as ignored by JaVers.

* [`@DiffInclude`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffInclude.java)
  &mdash;
  declares a property as visible by JaVers. Other 
  properties in a given class are ignored (unless explicitly included).
  Including is opposite approach to Ignoring, like blacklisting vs whitelisting.
  You can use only one approach for a given class.
 
* [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java)
    &mdash;
  declares a property as `ShallowReference`.
  Can be used only for Entity type properties.
  All properties of a target Entity instance, except Id, are ignored.
  
* [`@PropertyName`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/PropertyName.java)
    &mdash; 
   gives an arbitrary name to a property.
   When not found, Javers infers a property name from a field or getter name.
   `@PropertyName` could be useful when refactoring clases that are already
   committed to JaversRepository.

**ProTip**: when property level @Id is found in a class, JaVers maps it automatically
as Entity. So when you use @Id, class level @Entity is optional.

Two **JPA** property level annotations are interpreted as synonyms of JaVers annotations:

* `@javax.persistence.Id` is the synonym of JaVers `@Id`,
* `@javax.persistence.Transient` is the synonym of `@DiffIgnore`.

<h2 id="entity-mapping-example">Mapping example</h2>
 
Consider the following Entity mapping example:

```groovy
import org.bson.types.ObjectId
import org.mongodb.morphia.annotations.Id
import org.mongodb.morphia.annotations.Property
import org.mongodb.morphia.annotations.Entity

class MongoStoredEntity {
    @Id
    private ObjectId id

    @Property("description")
    private String description

    // ... 
}    
```

With zero config, JaVers maps:

- `MongoStoredEntity` class as Entity, since the [`@Id`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/Id.java) annotation is present,
- `ObjectId` class as Value, since it’s the type of the ID property and it’s not a Primitive.

**So far so good**. This mapping is OK for calculating diffs.
Nevertheless, if you plan to use [`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java),
consider providing custom [`JsonTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/JsonTypeAdapter.java)
for each of yours Value types,
especially Value types used as Entity ID (see [JSON TypeAdapters](/documentation/repository-configuration/#custom-json-serialization)).

<h2 id="property-mapping-style">Property mapping style</h2>
There are two mapping styles in JaVers `FIELD` and `BEAN`.
FIELD style is the default one. We recommend not changing it, as it’s suitable in most cases.

BEAN style is useful for domain models compliant with Java Bean convention.

When using FIELD style, JaVers accesses object state directly from fields.
In this case, `@Id` annotation should be placed at the field level. For example:

```java
public class User {
    @Id
    private String login;
    private String name;
    //...
}
```

When using BEAN style, JaVers accesses object state by calling **getters**.
`@Id` annotation should be placed at the method level. For example:

```java
public class User {
    @Id
    public String getLogin(){
        //...
    }

    public String getName(){
        //...
    }
    //...
}
```

BEAN mapping style is selected in `JaversBuilder` as follows:

```java
Javers javers = JaversBuilder
               .javers()
               .withMappingStyle(MappingStyle.BEAN)
               .build();
```

In both styles, access modifiers are not important, it could be private ;)

<h2 id="ignoring-things">Ignoring things</h2>

The ideal domain model contains only business relevant data and no technical clutter.
Such a model is compact and neat. All domain objects and their properties are important and worth being persisted.

In the real world, domain objects often contain various kind of noisy properties you don’t want to audit,
such as dynamic proxies (like Hibernate lazy loading proxies), duplicated data, technical flags,
auto-generated data and so on.

It’s important to exclude these things from the JaVers mapping, simply to save the storage and CPU.
This can be done by marking them as ignored.
Ignored properties are omitted by both the JaVers diff algorithm and JaversRepository.

Sometimes ignoring certain properties can dramatically improve performance.
Imagine that you have a technical property updated every time an object is touched
by some external system, for example:

```java
public class User {
   ...
   // updated daily to currentdate, when object is exported to DWH
   private Timestamp lastSyncWithDWH; 
   ...
}
```

Whenever a User is committed to [`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java),
the `lastSyncWithDWH` property is likely to cause a new version of the User object, even if no important data are changed.
Each new version means a new User snapshot persisted to JaversRepository
and one more DB insert in your commit.

**The rule of thumb:**<br/>
check JaVers log messages with commit statistics, e.g.

```
23:49:01.155 [main] INFO  org.javers.core.Javers - Commit(id:1.0, snapshots:2, changes - NewObject:2)

```
If numbers looks suspicious, configure JaVers to ignore data not important in your business.

There are a few ways to do this:

**Use property-level** [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
or [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java)
to ignore non-important properties. Alternatively, use
[`@DiffInclude`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffInclude.java)
to mark all important properties. See [property annotations](#property-level-annotations).

**Use class-level** [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
, [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java)
or [`@IgnoreDeclaredProperties`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/IgnoreDeclaredProperties.java)
(see [class annotations](#class-level-annotations)).

* [`@DiffIgnore`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/DiffIgnore.java)
  is strongest and means *I don’t care, just ignore all objects with this type.*

* [`@ShallowReference`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/ShallowReference.java) is moderate and means *Do shallow diff, bother me only when referenced Id is changed.*

* [`@IgnoreDeclaredProperties`]({{ site.github_core_main_url }}org/javers/core/metamodel/annotation/IgnoreDeclaredProperties.java) is the least radical and means *Ignore all properties <b>declared</b> in this class but take care about all <b>inherited</b> properties.*

Annotations are the recommended way for managing domain objects mapping,
but if you’re not willing to use them, map your classes in
[`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java). For example:

```java
JaversBuilder.javers()
    .registerEntity(new EntityDefinition(User.class, "someId", Arrays.asList("lastSyncWithDWH")))
    .build();
```

<h2 id="hooks">Object Hooks</h2>

Hooks are a way to interact with your objects during JaVers processing.

<h3 id="hooks-on-access">Object-access Hook</h3>

[`ObjectAccessHook`]({{ site.github_core_main_url }}org/javers/core/graph/JaversBuilder.java) is called just before JaVers tries to access your domain object.
You can use it for example to initialize an object before processing.

To register an object-access call `withObjectAccessHook()` method of 
[`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java):


```java
JaversBuilder.javers().withObjectAccessHook(new MyObjectAccessHook()).build()
```

JaVers comes with Hibernate Unproxy implementation of object-access hook,
see [hibernate integration](/documentation/spring-integration/#hibernate-unproxy-hook). 
