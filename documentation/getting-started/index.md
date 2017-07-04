---
layout: page
title: Getting started
category: JaVers Documentation
submenu: getting-started
sidebar-url: docs-sidebar.html
---

<h2 id="get-javers">Get JaVers</h2>

JaVers artifacts are published to [Maven Central](https://search.maven.org/#artifactdetails%7Corg.javers%7Cjavers-core%7C{{site.javers_current_version}}%7C).
To get JaVers, add `javers-core`
to your project dependencies and (optionally) choose proper `javers-repository` module.

### javers-core
Gradle: 

```groovy
compile 'org.javers:javers-core:{{site.javers_current_version}}'
```   

Maven: 

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-core</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

If you’re going to use JaVers as an object diff tool, this is the only dependency you need.
        
### javers-repository
If you are going to use JaVers as a data audit framework, choose the proper repository implementation.
For example, if you’re using MongoDB add:

Gradle: 

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

Maven:

```xml
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-persistence-mongo</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

### Java 7 compatibility

Since 3.0, JaVers is written in Java 8.
If you still use Java 7, you can’t use the latest version.
 
The last JaVers’ version compatible with Java 7 is {{site.javers_java7_version}}. 


<h2 id="create-javers-instance">Create a JaVers instance</h2>
Use JaversBuilder to create a JaVers instance:

```java
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
//...
Javers javers = JaversBuilder.javers().build();
```

Now, the JaVers instance is up and ready, configured with reasonable defaults.
Good enough to start.

Later on, you would probably need to refine the [configuration](/documentation/domain-configuration)
and introduce some basic facts about your domain model to JaVers.

<h2 id="getting-started-diff">Object diff</h2>
Use the `compare()` method to calculate a diff for two arbitrary complex domain objects:

```java
Person tommyOld = new Person("tommy", "Tommy Smart");
Person tommyNew = new Person("tommy", "Tommy C. Smart");

Diff diff = javers.compare(tommyOld, tommyNew);
```

See more [diff examples](/documentation/diff-examples/).

<h2 id="getting-started-audit">Object audit</h2>
Use the `commit()` method to persist changes done on domain objects
in [JaversRepository](/documentation/repository-configuration/):

```java
Person robert = new Person("bob", "Robert Martin");
javers.commit("user", robert);
```
See more [audit examples](/documentation/repository-examples/).
