---
layout: docs
title: JaVers Documentation — Domain Configuration
redirect_from: "/documentation/configuration/"
submenu: domain-configuration
---

# Domain Configuration

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
type they are. We distinguish between the following types: `Entities`, `ValueObjects`, `Values`, `Containers` and `Primitives`.
Each type has a different comparing style. 

JaVers can infer the type of your classes, but if it goes wrong, the diff result might be strange.
In this case you should tune the type mapping.

For now, we support both the Java config via [`JaversBuilder`]({{ site.javadoc_url }}index.html?org/javers/core/JaversBuilder.html)
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
  If not, JaVers provides its [own annotations set]({{ site.javadoc_url }}org/javers/core/metamodel/annotation/package-summary.html).
* If you’d rather keep your domain model classes framework agnostic,
  use [`JaversBuilder`]({{ site.javadoc_url }}index.html?org/javers/core/JaversBuilder.html).
* JaVers uses reasonable defaults and takes advantage of a *type inferring algorithm*.
  So for a quick start just let JaVers do the mapping for you.
  Later on, it would be advisable to refine the mapping in order to optimize the diff semantic.

Proper mapping is essential for the diff algorithm, for example JaVers needs to know if a given object
should be compared property-by-property or using equals().

### JaVers Types
The JaVers type system is based on `Entity` and `ValueObjects` notions, following Eric Evans
Domain Driven Design terminology (DDD).
Furthermore, it uses *Value*, *Primitive* and *Container* notions.
The last two types are JaVers internals and can’t be mapped by the user.

To make long story short, JaVers needs to know
the [`JaversType`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/JaversType.html)
for each of your classes spotted in runtime (see [mapping configuration](#mapping-configuration)).

Let’s examine these three fundamental types more closely.

<h3 id="entity">Entity</h3>
JaVers [`Entity`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/EntityType.html)</a>
has exactly the same semantic as DDD Entity or JPA Entity.

Usually, each Entity instance represents a concrete physical object.
The Entity has a list of mutable properties and its own *identity* held in *ID property*.

Each Entity instance has a global identifier called
[`InstanceId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/InstanceId.html).
It consists of a class name and an ID value.

**Comparing strategy** for Entity references is based on ID and
for the Entity state is property-by-property.

The Entity can contain ValueObjects, References, Containers, Values and Primitives.

**For example** Entities are: Person, Company.

<h3 id="value-object">Value Object</h3>
JaVers [`ValueObject`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueObjectType.html)
is similar to DDD ValueObject and JPA Embeddable.
It’s a complex value holder with a list of mutable properties but without a unique identifier.
It can’t be dereferenced.

The ValueObject instance has a ‘best effort’ global identifier called
[`ValueObjectId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/ValueObjectId.html).
It consists of a class name and a path in the object graph.

**Comparing strategy** for the ValueObject state is property-by-property.

In a strict DDD approach, ValueObject can’t exist independently and has to be bound to an Entity instance
(as a part of an Aggregate). JaVers is not so radical and supports both embedded and dangling ValueObjects.
So in JaVers, ValueObject is just an Entity without identity.

**For example** ValueObjects are: Address, Point.

<h3 id="ValueType">Value</h3>
JaVers [`Value`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueType.html)
is a simple (scalar) value holder.

**Comparing strategy** for a Value state is based on the `equals()` method.
So it’s highly important to implement it properly by comparing the underlying state.

**For example** Values are: BigDecimal, LocalDate.

For Values it’s advisable to customize the JSON serialization by implementing *Type Adapters*
(see [custom json serialization](#custom-json-serialization)).

<h2 id="mapping-configuration">Mapping configuration</h2>
Your task is to identify `Entities`, `ValueObjects` and `Values` in your domain model
and make sure that JaVers has got it. So what should you do?

There are three ways to map a class:

1. explicitly, with the JaversBuilder methods :
    * [`registerEntity(Class<?>)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-java.lang.Class-),
      `@ID` annotation points to *Id-property*
    * [`registerEntity(Class<?> entityClass, String idPropertyName)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-java.lang.Class-java.lang.String-), Id-property given by name
    * [`registerValueObject(Class<?>)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueObject-java.lang.Class-)
    * [`registerValue(Class<?>)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValue-java.lang.Class-)
1. implicitly, with annotations (JPA, JaVers or others, see [table below](#supported-annotations))
1. implicitly, using a *type inferring algorithm* based on a class inheritance hierarchy.
   JaVers **propagates** the class mapping down to the inheritance hierarchy.
   If a class is not mapped (by method 1 or 2),
   JaVers maps this class the in same way as its nearest supertype (superclass or interface).

Mapping hints:

* First, try to map high level abstract classes or interfaces.
  For example, if all of your Entities extend some abstract class,
  you should map only this class.
* JaVers automatically scans JPA annotations
  and maps classes with `@Entity` annotation as Entities
  and classes with `@Embeddable` as ValueObjects. So if you are using frameworks like Hibernate,
  your mapping is probably already done.
* In some cases, annotations could be misleading for JaVers.
  For example [Morphia](https://github.com/mongodb/morphia) framework uses `@Entity` annotation for each persistent class
  (even for ValueObjects). This could cause incorrect JaVers mapping.
  As a solution, use explicit mapping with the JaversBuilder methods,
  as it has the highest priority.
* For an Entity, a type of its Id-property is mapped as Value by default.
* If JaVers knows nothing about a class, it maps that class as ValueObject **by default**.
* If you are not sure how JaVers maps your class, check effective mapping using
  [`getTypeMapping(Class<?>)`]({{ site.javadoc_url }}org/javers/core/Javers.html#getTypeMapping-java.lang.Class-) method.
  Once you have JaversType for your class, you can pretty-print it: 
  `System.out.println( javers.getTypeMapping(YourClass.class).prettyPrint() );`

<h3 id="supported-annotations">Supported annotations</h3>

JaVers annotations support is based on two sets, JPA and JaVers.

**Class level annotations**<br/>
In the table below, there are JaVers types (headers) resulting from annotations (cells).
As you can see, the trick is that JaVers ignores package names and cares only about simple class names.
So you can use any annotation set as long as the annotation names match JPA or JaVers names.

<table class="table" width="100%" style='word-wrap: break-word; font-family: monospace;'>
<tr>
    <th>Entity</th>
    <th>ValueObject</th>
    <th>Value</th>
</tr>
    <td>@javax.persistence.<wbr>Entity</td>
    <td>@javax.persistence.<wbr>Embeddable</td>
    <td>@org.javers.core<wbr>.metamodel.annotation.<wbr>Value</td>
<tr>
</tr>
    <td>@org.javers.core.<wbr>metamodel.annotation.<wbr>Entity</td>
    <td>@org.javers.core.<wbr>metamodel.annotation.<wbr>ValueObject</td>
    <td>@*.Value</td>
<tr>
</tr>
    <td>@javax.persistence.<wbr>MappedSuperclass </td>
    <td>@*.Embeddable</td>
    <td></td>
<tr>
</tr>
    <td>@*.Entity </td>
    <td>@*.ValueObject </td>
    <td></td>
<tr>
</tr>
    <td>@*.MappedSuperclass </td>
    <td></td>
    <td></td>
<tr>
</table>

<span id="property-level-annotations">**Property level annotations**</span>
<br/>
There are two kinds of property level annotations.

* `Id` annotation, to mark the Id-property of an Entity class.
  Furthermore, Id annotation maps the owning class as an Entity.
  So when you use `@Id`, the class level `@Entity` is optional.
* `Ignore` annotation, to mark a property as ignored by the diff engine.

<table class="table" width="100%" style='font-family: monospace;'>
<tr>
    <th>Ignore</th>
    <th>Id</th>
</tr>
<tr>
    <td>@javax.persistence.<wbr>Transient</td>
    <td>@javax.persistence.<wbr>Id</td>
</tr>
<tr>
    <td>@org.javers.core.<wbr>metamodel.<wbr>annotation.DiffIgnore</td>
    <td>@org.javers.core.<wbr>metamodel.<wbr>annotation.Id</td>
</tr>
<tr>
    <td>@*.Transient</td>
    <td>@*.Id</td>
</tr>
<tr>
    <td>@*.DiffIgnore</td>
    <td></td>
</tr>
</table>

<h3 id="entity-id-property">Entity Id</h3>
Entity `Id` has a special role in JaVers. It identifies an Entity instance.
You need to choose **exactly one** property as Id for each of your Entity classes (we call it Id-property).

The *JaversType* of Id can be *Primitive* or *Value*
so one of the types with atomic values, compared by `equals()`.
We discourage the use of `ValueObject` here as it has multiple values.

This rule is expressed in the JaVers type inferring algorithm.
If an Entity Id is not Primitive, JaVers maps it as *Value* by default.

Consider the following Entity mapping example:

```java
package org.javers.core.cases.morphia;

import org.bson.types.ObjectId;
import org.mongodb.morphia.annotations.Id;
import org.mongodb.morphia.annotations.Property;
import org.mongodb.morphia.annotations.Entity;

@Entity
public class MongoStoredEntity {
    @Id
    private ObjectId _id;

    @Property("description")
    private String description;

    ... //
```

With zero config, JaVers maps:

- `MongoStoredEntity` class as `Entity`,
  since `@Id` and `@Entity` annotations are scanned (JaVers only cares about the annotation class name, not package name).
- `ObjectId` class as `Value`, since it’s the type of the Id-property and it’s not Primitive.

So far so good. This mapping is OK for calculating diffs.
Nevertheless, if you plan to use `JaversRepository`,
consider providing custom JSON `TypeAdapters`
for your each of your `Value` types, especially Id types like `ObjectId` (see [JSON TypeAdapters](#json-type-adapters)).

<h3 id="property-mapping-style">Property mapping style</h3>
There are two mapping styles in JaVers `FIELD` and `BEAN`.
FIELD style is the default one. We recommend not changing it, as it’s suitable in most cases.

BEAN style is useful for domain models compliant with *Java Bean* convention.

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

<h3 id="ignoring-things">Ignoring things</h3>

The ideal domain model contains only business relevant data and no technical clutter.
Such a model is compact and neat. All domain objects and their properties are important and worth being persisted.

In the real world, domain objects often contain various kind of noisy properties you don’t want to audit,
such as dynamic proxies (like Hibernate lazy loading proxies), duplicated data, technical flags,
auto-generated data and so on.

It is important to exclude these things from the JaVers mapping, simply to save the storage and CPU.
This can be done by marking them as ignored.
Ignored properties are omitted by both the JaVers diff algorithm and JaversRepository.

Sometimes ignoring certain properties can dramatically improve performance.
Imagine that you have a technical property updated every time an object is touched
by some external system, for example:

```
public class User {
   ...
   private Timestamp lastSyncWithDWH; //updated daily to currentdate, when object is exported to DWH
   ...
}
```

Whenever a User is committed to JaversRepository,
`lastSyncWithDWH` is likely to *cause* a new version of the User object, even if no important data are changed.
Each new version means a new User snapshot persisted to JaversRepository
and one more DB insert in your commit.

**The rule of thumb:**<br/>
check JaVers log messages with commit statistics, e.g.

```
23:49:01.155 [main] INFO  org.javers.core.Javers - Commit(id:1.0, snapshots:2, changes - NewObject:2)

```
If numbers looks suspicious, configure JaVers to ignore all business irrelevant data.

**How to configure ignored properties**<br/>
There are two ways to do this. First, you can use `@Transient` or `@DiffIgnore`
[property annotations](#property-level-annotations) (this is the recommended way).

Second, if you are not willing to use annotations, register your classes
using
[`JaversBuilder.registerEntity(EntityDefinition)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-org.javers.core.metamodel.clazz.EntityDefinition-)
or
[`JaversBuilder.registerValueObject(ValueObjectDefinition)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueObject-org.javers.core.metamodel.clazz.ValueObjectDefinition-)
, for example:

```java
JaversBuildert.javers()
        .registerEntity(new EntityDefinition(User.class, "someId", Arrays.asList("lastSyncWithDWH")))
        .build();
```