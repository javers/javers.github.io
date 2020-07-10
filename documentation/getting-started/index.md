---
layout: page
title: Getting started
category: Documentation
submenu: getting-started
sidebar-url: docs-sidebar.html
---

All JaVers artifacts are published to [Maven Central](https://search.maven.org/search?q=org.javers).

<h2 id="getting-started-boot">Spring Boot Starter</h2>

The easiest and recommended way to start with Javers
is adding one of our Spring Boot starters to your project dependencies.

If you are using MongoDB &mdash; take:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```

If you are using an SQL database:

```groovy
compile 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'
```

These starters provide default configuration and create the Javers instance as a Spring bean.
You can start using Javers with almost no configuration.  

Read more about [Javers’ Spring Boot integration](/documentation/spring-boot-integration/)
and [Javers’ Spring integration](/documentation/spring-integration/)

<h2 id="getting-started-Baeldung">Javers tutorial on baeldung.com</h2>

Recently, Eugen Baeldung wrote an excellent [quick start tutorial](https://www.baeldung.com/spring-data-javers-audit )
about Javers and Spring Data.
We recommend reading it in the first place.

## Vanilla Javers

If you are not using Spring, add `javers-core`
to your project dependencies and (optionally) choose proper `javers-repository` module.

### javers-core
Gradle: 

```groovy
compile 'org.javers:javers-core:{{site.javers_current_version}}'
```   

If you’re going to use JaVers as an object diff tool, this is the only dependency you need.
        
### javers-repository
If you are going to use JaVers as a data audit framework, choose the proper repository implementation.
For example, if you’re using MongoDB add:

Gradle: 

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

If you are using an SQL database &mdash; add:

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

### Create a JaVers instance
Use `JaversBuilder` to create a JaVers instance:

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

 