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
Proper mapping is important for both JaVers features, object diff and data audit (JaversRepository).

Object diff algorithm is the core of JaVers. When two objects are compared, JaVers needs to know what
type they are. We distinct following types: *Entities*, *ValueObjects*, *Values*, *Containers* and *Primitives*.  
Each type has a different comparing style. 

JaVers can infer the type of your classes, but if it goes wrong the diff result could be strange.
In this case you should tune the type mapping.

For now, we support Java config via [`JaversBuilder`]({{ javadoc_url }}index.html?org/javers/core/JaversBuilder.html). 

<a name="domain-model-mapping"></a>
## Domain model mapping

### Why domain model mapping?
Many frameworks which deal with user domain model (aka data model) use some kind of <b>mapping</b>.
For example JPA uses annotations in order to map user classes into relational database.
Plenty of XML and JSON serializers uses various approaches to mapping, usually based on annotations.

When combined together, all of those framework-specific annotations could be a pain and
pollution in Your business domain code.

Mapping is also a case in JaVers but don't worry:

* It's far more simple than JPA
* JaVers uses reasonable defaults and takes advantage of *type inferring algorithm*.
  So for a quick start just let it do the mapping for You.
  Later on, it would be advisable to refine the mapping in order to optimize a diff semantic
* We believe that domain model classes should be framework agnostic,
  so we do not ask You to embrace another annotation set

JaVers wants to know only a few basic facts about your domain model classes,
particularly [`JaversType`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/JaversType.html) 
of each class spotted in runtime.
**Proper mapping is essential** for diff algorithm, for example we need to know if given objects 
should be compared property-by-property or using equals().

### Choose mapping style
There are two mapping styles in JaVers `FIELD` and `BEAN`.
FIELD style is the default one. We recommend not to change it, as it's suitable in most cases.   

BEAN style is useful for domain models compliant with <code>Java Bean</code> convention.
 
When using <code>FIELD</code> style, JaVers accesses objects state directly from fields.
In this case, <code>@Id</code> annotation should be placed at the field level. For example:

```java
public class User {
    @Id
    private String login;
    private String name;
    //...
}
```

When using <code>BEAN</code> style, JaVers is accessing objects state by calling **getters**,
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

<code>BEAN</code> mapping style is selected in <code>JaversBuilder</code> as follows:

```java
Javers javers = JaversBuilder
               .javers()
               .withMappingStyle(MappingStyle.BEAN)
               .build();
```

In both styles, access modifiers are not important, it could be private ;)

### Javers Types
JaVers type system is based on *Entity* and *ValueObjects* notions, following Eric Evans
Domain Driven Design terminology (DDD).
Furthermore, it uses *Value*, *Primitive* and *Container* notions.
The last two types are JaVers internals and can't be mapped by user.

To make long story short, JaVers needs to know a Javers Type
of each class spotted in runtime.

There are two ways to achieve this: 

* annotations, JPA or JaVers, well known
* type inferring algorithm based class inheritance tree
* explicit, use [`JaversBuilder`]({{ site.javadoc_url }}index.html?org/javers/core/JaversBuilder.html)
  methods to label your domain model classes as Entities, ValueObjects or Values.

These methods are listed below:

* [`JaversBuilder.registerEntity()`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerEntity-java.lang.Class-)
* [`JaversBuilder.registerValueObject()`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueObject-java.lang.Class-)
* [`JaversBuilder.registerValue()`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValue-java.lang.Class-)

Let's examine these three fundamental types more closely.

### Entity
JaVers [`Entity`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/EntityType.html)</a>
has exactly the same semantic like DDD Entity or JPA Entity.

Usually, each entity instance represents concrete physical object.
Entity has a list of mutable properties and its own *identity* hold in *id property*.
Entity can contain ValueObjects, References (to entity instances), Containers, Values & Primitives.

For example Entities are: Person, Company.

### Value Object
JaVers [`ValueObject`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueObjectType.html)
is similar to DDD ValueObject and JPA Embeddable.
It's a complex value holder with a list of mutable properties but without unique identifier.

In strict DDD approach, ValueObjects can't exists independently and have to be bound do Entity instances
(as a part of an Aggregate). JaVers is not such radical and supports both embedded and dangling ValueObjects.
So in JaVers, ValueObject is just Entity without identity.

For example ValueObjects are: Address, Point.

### Value
JaVers [`Value`]({{ site.javadoc_url }}index.html?org/javers/core/metamodel/type/ValueType.html) is a simple (scalar) value holder.
Two Values are compared using **equals()** method so its highly important to implement it properly by comparing underlying state.

For example Values are: BigDecimal, LocalDate.

For Values it's advisable to customize JSON serialization by implementing *Type Adapters*,
see [`JsonConverter`]({{ site.javadoc_url }}index.html?org/javers/core/json/JsonConverter.html).

### Mapping scenario 
Your task is to identify Entities and ValueObjects and Values in your domain model
and make sure JaVers got it. So what should you do?

* 
For example, if all your Entities extends some abstract class, like

First, try to distinct them by high level abstract classes or interfaces.

  

Minimize JaversBuilder configuration by taking advantage of type inferring algorithm.
For Values, remember about implementing equals() properly
and consider implementing JSON type adapters.
*
 
<a name="repository-setup"></a>
## Repository setup
If you are going to use JaVers as data audit framework you are supposed to configure JaversRepository.
 
JaversRepository is simply a class which purpose is to store Javers Commits in your database,
alongside with your domain data. 

JaVers comes by default with in-memory repository implementation. It's perfect for testing but
for production enviroment you will need something real.

First, choose proper JaversRepository implementation.
If you are using <code>MongoDB</code>, choose <code>org.javers.repository.mongo.MongoRepository</code>.
(Support for <code>SQL</code> databases, is scheduled for releasing with JaVers 1.1)
 
The idea of configuring the JaversRepository is simple, 
just provide working database connection. 

For <code>MongoDB</code>:

        Db database = ... //autowired or configured here,
                          //preferably, use the same database connection as you are using for your main (domain) database 
        MongoRepository mongoRepo =  new MongoRepository(database)
        JaversBuilder.javers().registerJaversRepository(mongoRepo).build()
