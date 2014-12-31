---
layout: docs
title: Documentation — Getting started
submenu: getting-started
---

# Getting started

<h2 id="get-javers">Get JaVers</h2>

To get JaVers add <code>javers-core</code>
to your project dependencies and (optionally) add proper dependency on <code>javers-repository</code>.

### javers-core
For maven: 

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-core</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

For gradle: 

```groovy
compile 'org.javers:javers-core:{{site.javers_current_version}}'
```   
If you are going to use JaVers as an object diff tool, this is only dependency you need.
        
### javers-repository
If you are going to use JaVers as a data audit framework, choose proper repository implementation.
For example, if you are using MongoDb add:

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-persistence-mongo</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

For gradle: 

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

<h2 id="create-javers-instance">Create JaVers instance</h2>
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
