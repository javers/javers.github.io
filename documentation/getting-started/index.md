---
layout: docs
title: Documentation - Getting started
---

<a name="getting-started"></a>
# Getting started #

To get JaVers add <code>javers-core</code>
to your project dependencies and (optionally) add proper dependency on <code>javers-repository</code>.

### javers-core ###
For maven: 

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-core</artifactId>
    <version>0.8.0</version>
</dependency>
```

For gradle: 

```groovy
compile 'org.javers:javers-core:0.8.0'
```   
If you are going to use JaVers as an object diff tool, this is only dependency you need.
        
### javers-repository ###
If you are going to use JaVers as a data audit framework, choose proper repository implementation.
For example, if you are using MongoDb add:

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-persistence-mongo</artifactId>
    <version>0.8.0</version>
</dependency>
```

For gradle: 

```groovy
compile 'org.javers:javers-persistence-mongo:0.8.0'
```

<a name="create-javers-instance"></a>
## Create JaVers instance ##

Use JaversBuilder to create JaVers instance:

```java
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
//...
Javers javers = JaversBuilder.javers().build();
```

Now, JaVers instance is up & ready, configured with reasonable defaults. 
Good enough to start.

Later on, you would probably need to refine the [configuration](http://javers.org/documentation/configuration), 
introducing to JaVers some basic facts about your domain model.
