---
layout: docs
title: Documentation - Configuration
---

# Configuration #
None of us likes to configure tools but don't worry, JaVers knows it and
does the hard work to minimize the configuration efforts on your side.

As we stated before, JaVers configuration is very concise.
You can start with zero config and give JaVers a chance to infer all facts about your domain model.

Take a look how JaVers deals with your data. If it's fine, let the defaults work for.  
Add more configuration when you would like to change the default behavior.
 
There are two logical areas of the configuration,
[domain model mapping](/documentation/configuration#domain-model-mapping) 
and 
[repository setup](/documentation/configuration#repository-setup).
Proper mapping is important for both JaVers features, the object diff and the data audit (JaversRepository).

The object diff algorithm is the core of JaVers. When two objects are compared, JaVers needs to know what
type they are. We distinct following types: *Entities*, *ValueObjects*, *Values*, *Containers* and *Primitives*.  
Each type has a different comparing style. 

JaVers can infer the type of your classes, but if it goes wrong, the diff result could be strange.
In this case you should tune the type mapping.

For now, we support the Java config via [`JaversBuilder`]({{ site.javadoc_url }}index.html?org/javers/core/JaversBuilder.html)
and the annotations.

<a name="domain-model-mapping"></a>
## Domain model mapping

### Why domain model mapping?
Many frameworks which deal with user domain model (aka data model) use some kind of <b>mapping</b>.
For example JPA uses annotations in order to map user classes into relational database.
Plenty of XML and JSON serializers uses various approaches to mapping, usually based on annotations.

When combined together, all of those framework-specific annotations could be a pain and a
pollution in your business domain code.

Mapping is also a case in JaVers but don't worry:

* JaVers wants to know only a few basic facts about your domain model classes.
* Mapping is done mainly on the class level, property level mapping is required only for
  choosing Entity ID.
* JaVers scans well known annotations sets like JPA and Hibernate, see [supported annotations table](#supported-annotations).
  So if your classes are already annotated with these sets, you are lucky.
  If not, JaVers provides its [own annotations set]({{ site.javadoc_url }}org/javers/core/metamodel/annotation/package-summary.html).
* If you'd rather keep your domain domain model classes framework agnostic,
  use [`JaversBuilder`]({{ site.javadoc_url }}index.html?org/javers/core/JaversBuilder.html).
* JaVers uses reasonable defaults and takes advantage of *type inferring algorithm*.
  So for a quick start just let it do the mapping for You.
  Later on, it would be advisable to refine the mapping in order to optimize the diff semantic

Proper mapping is essential for the diff algorithm, for example JaVers needs to know if a given objects
should be compared property-by-property or using equals().

### Javers Types
JaVers type system is based on *Entity* and *ValueObjects* notions, following Eric Evans
Domain Driven Design terminology (DDD).
Furthermore, it uses *Value*, *Primitive* and *Container* notions.
The last two types are JaVers internals and can't be mapped by user.

To make long story short, JaVers needs to know
the [`JaversType`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/JaversType.html)
for each of your class spotted in runtime.
See [mapping configuration](#mapping-configuration).

Let's examine these three fundamental types more closely.

### Entity
JaVers [`Entity`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/EntityType.html)</a>
has exactly the same semantic like DDD Entity or JPA Entity.

Usually, each Entity instance represents concrete physical object.
Entity has a list of mutable properties and its own *identity* hold in *ID property*.

Each Entity instance has a global identifier called
[`InstanceId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/InstanceId.html).
It's consists of a class name and an ID value.

**Comparing strategy** for Entity references is based on ID and
for the Entity state is property-by-property.

Entity can contain ValueObjects, References, Containers, Values & Primitives.

**For example** Entities are: Person, Company.

### Value Object
JaVers [`ValueObject`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueObjectType.html)
is similar to DDD ValueObject and JPA Embeddable.
It's a complex value holder with a list of mutable properties but without a unique identifier.
It can't be dereferenced.

ValueObject instance has a 'best effort' global identifier called
[`ValueObjectId`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/object/ValueObjectId.html).
It's consists of a class name and a path in the object graph.

**Comparing strategy** for ValueObject state is property-by-property.

In strict DDD approach, ValueObject can't exists independently and have to be bound to an Entity instance
(as a part of an Aggregate). JaVers is not such radical and supports both embedded and dangling ValueObjects.
So in JaVers, ValueObject is just Entity without identity.

**For example** ValueObjects are: Address, Point.

### Value
JaVers [`Value`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueType.html)
is a simple (scalar) value holder.

**Comparing strategy** for Value state is based on `equals()` method.
So it's highly important to implement it properly by comparing underlying state.

**For example** Values are: BigDecimal, LocalDate.

For Values it's advisable to customize JSON serialization by implementing *Type Adapters*,
see [`JsonConverter`]({{ site.javadoc_url }}index.html?org/javers/core/json/JsonConverter.html).

<a name="mapping-configuration"></a>
### Mapping configuration
Your task is to identify Entities, ValueObjects and Values in your domain model
and make sure JaVers got it. So what should you do?

There are three ways to map a class:

1. explicitly, by JPA or JaVers annotations, see [table below](#supported-annotations)
1. explicitly, by <tt>JaversBuilder</tt> methods :
    * [`JaversBuilder.registerEntity(Class<?> entityClass)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-java.lang.Class-), @ID annotation is pointing to id-property
    * [`JaversBuilder.registerEntity(Class<?> entityClass, String idPropertyName)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-java.lang.Class-java.lang.String-), id-property given by name
    * [`JaversBuilder.registerValueObject(Class<?> valueObjectClass)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueObject-java.lang.Class-)
    * [`JaversBuilder.registerValue(Class<?> valueClass)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValue-java.lang.Class-)
1. implicitly, using type inferring algorithm based on class inheritance hierarchy.
   JaVers **propagates** the class mapping down to the inheritance hierarchy.
   If a class is not explicitly mapped, JaVers maps it the same as its nearest supertype (superclass or interface).

Mapping hints:

* First, try to map high level abstract classes or interfaces.
  For example, if all of your Entities extends some abstract class,
  you should map only this class.
* JaVers automatically scans JPA annotations
  and maps classes with `@Entity` annotation as Entities
  and classes with `@Embeddable` as ValueObjects. So if you are using frameworks like Hibernate,
  your mapping is probably already done.
* By default, JaVers maps a class as ValueObject.

<a name="supported-annotations"></a>
### Supported annotations

JaVers annotations support is based on two sets, JPA & JaVers.

In the table header, there are JaVers types resulting from annotations, listed in table cells.
As you can see, the trick is, JaVers ignores package names and cares only about annotation simple class names.
So you can use any annotations set as far as their names match JPA or JaVers names.

**Class level annotations:**
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

**Property level annotations:**
<table class="table" width="100%" style='font-family: monospace;'>
<tr>
    <th>DiffIgnore</th>
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

### Property mapping style
There are two mapping styles in JaVers `FIELD` and `BEAN`.
FIELD style is the default one. We recommend not to change it, as it's suitable in most cases.

BEAN style is useful for domain models compliant with `Java Bean` convention.

When using `FIELD` style, JaVers accesses objects state directly from fields.
In this case, `@Id` annotation should be placed at the field level. For example:

```java
public class User {
    @Id
    private String login;
    private String name;
    //...
}
```

When using `BEAN` style, JaVers is accessing objects state by calling **getters**,
annotations should be placed at the method level. For example:

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

`BEAN` mapping style is selected in `JaversBuilder` as follows:

```java
Javers javers = JaversBuilder
               .javers()
               .withMappingStyle(MappingStyle.BEAN)
               .build();
```

In both styles, access modifiers are not important, it could be private ;)

 
<a name="repository-setup"></a>
## Repository setup
If you are going to use JaVers as data audit framework you are supposed to configure JaversRepository.
 
JaversRepository is simply a class which purpose is to store Javers Commits in your database,
alongside with your domain data. 

JaVers comes by default with in-memory repository implementation. It's perfect for testing but
for production enviroment you will need something real.

First, choose proper JaversRepository implementation.
If you are using `MongoDB`, choose `org.javers.repository.mongo.MongoRepository`.
(Support for `SQL` databases, is scheduled for releasing with JaVers 1.1)
 
The idea of configuring the JaversRepository is simple, 
just provide working database connection. 

For `MongoDB`:

```java
Db database = ... //autowired or configured here,
                  //preferably, use the same database connection
                  //as you are using for your main (domain) database
MongoRepository mongoRepo =  new MongoRepository(database)
JaversBuilder.javers().registerJaversRepository(mongoRepo).build()
```