---
layout: page
title: Getting started
category: Documentation
submenu: getting-started
sidebar-url: docs-sidebar.html
---

All JaVers artifacts are published to [Maven Central](https://central.sonatype.com/search?smo=true&namespace=org.javers&q=org.javers).

<h2 id="getting-started-boot">Spring Boot Starter</h2>

The easiest and strongly recommended way to start with Javers
is adding one of our Spring Boot starters to your project dependencies.

If you are using MongoDB &mdash; take:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```

If you are using an SQL database:

```groovy
compile 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'
```

**Please note** that Javers 7.10+ is compatible with Spring Boot 4,
so all Javers Spring integration modules require **Java 17**.

Javers Spring Boot starters integrate seamlessly with your existing Spring Boot configuration.
They provide sensible defaults and automatically create the Javers instance as a Spring bean.
You can start using Javers immediately with little to no additional configuration.

Read more about [Javers’ Spring Boot integration](/documentation/spring-boot-integration/)
and [Javers’ Spring integration](/documentation/spring-integration/).

<h2 id="getting-started-Baeldung">Javers tutorial on baeldung.com</h2>

**Eugen Baeldung** has written an excellent tutorial about Javers &mdash;
[Using JaVers for Data Model Auditing in Spring Data](https://www.baeldung.com/spring-data-javers-audit )

We recommend reading it in the first place.

### Other Community Tutorials

This [Getting Started](https://betterprojectsfaster.com/learn/talks-ljc-medium-talk-2020-javers-audit-log/#getting-started)
written by Karsten Silz
tells you how to get started with JaVers, how to query for one or more objects, how to query nested objects, and how to customize the versioning JSON.

## Vanilla Javers

If you are not using Spring, add `javers-core`
to your project dependencies and (optionally) choose proper `javers-repository` module.

### javers-core
Gradle: 

```groovy
compile 'org.javers:javers-core:{{site.javers_current_version}}'
```   

**Please note** that Javers core and Javers persistence modules require **Java 11**.

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
compile 'org.javers:javers-persistence-sql:{{site.javers_current_version}}'
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
Use the `javers.commit()` method to audit changes done on your domain objects.
Javers saves subsequent versions of domain objects 
as [Snapshots](/documentation/jql-examples/#query-for-snapshots)
in [JaversRepository](/documentation/repository-configuration/)

```java
Person robert = new Person("bob", "Robert Martin");
javers.commit("user", robert);
```

See more [audit examples](/documentation/repository-examples/).

<h2 id="getting-started-auto-audit">Auto audit</h2>

In order to automatically audit objects saved to Spring Data repositories
use the `@JaversSpringDataAuditable` annotation:

```java
@JaversSpringDataAuditable
public interface PersonRepository extends CrudRepository<Person, String> {
}
```

Read more about the [Auto audit aspects](/documentation/spring-integration/#auto-audit-aspect).
