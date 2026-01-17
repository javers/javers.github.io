---
layout: page
title: Getting started
category: Documentation
submenu: getting-started
sidebar-url: docs-sidebar.html
---

All JaVers artifacts are published to [Maven Central](https://central.sonatype.com/search?smo=true&namespace=org.javers&q=org.javers).

<h2 id="getting-started-boot">Spring Boot Starters</h2>

The easiest and strongly recommended way to start with Javers
is adding one of our Spring Boot starters to your project dependencies.

If you are using MongoDB &mdash; add this dependency:

```groovy
Gradle:
implementation 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'

Maven:
<dependency> 
    <groupId>org.javers</groupId>
        <artifactId>javers-spring-boot-starter-mongo</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

If you are using an SQL database:

```groovy
Gradle:
implementation 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'

Maven:
<dependency>
        <groupId>org.javers</groupId>
        <artifactId>javers-spring-boot-starter-sql</artifactId>
        <version>{{site.javers_current_version}}</version>
</dependency>
```

**Please note** that Javers 7.10+ is compatible with Spring Boot 4,
so all Javers Spring integration modules require **Java 17**.

Javers Spring Boot starters integrate seamlessly with your existing Spring Boot configuration.
They provide sensible defaults and automatically create the Javers instance as a Spring bean.
You can start using Javers immediately with little to no additional configuration.

Read more about [Javers’ Spring Boot integration](/documentation/spring-boot-integration/)
and [Javers’ Spring integration](/documentation/spring-integration/).

<h2 id="getting-started-Tutorials">Tutorials and Articles</h2>

- [[Baeldung] Intro to JaVers](https://www.baeldung.com/javers)
  <br/>
    **Teaser**: This article, written by Eugen Baeldung, serves as a starting point for understanding JaVers.
   It provides an overview of JaVers’ core feature &mdash;  **the Object Diff**. It covers comparing objects,
   collections, and object graphs.


- [[Baeldung] Using JaVers for Data Model Auditing in Spring Data](https://www.baeldung.com/spring-data-javers-audit)
  <br/>
    **Teaser**:
  This Baeldung tutorial covers the JaVers **Data Audit** feature in depth.
  It shows how to integrate JaVers with Spring Data JPA to automate entity change tracking with minimal configuration.
  The article provides concrete examples of auditing repositories using `@JaversSpringDataAuditable` and `@JaversAuditable`, as well as managing transactions.
  It also explains JQL queries for retrieving historical data as `Snapshots` (state maps), `Changes` (atomic differences), or `Shadows` (reconstructed domain objects).


- [[JaVers Blog] JaVers vs Envers Comparison](https://javers.org/blog/2017/12/javers-vs-envers-comparision.html)
    <br/>
    **Teaser**: If you are debating between JaVers and Hibernate Envers, this article is essential reading.
    It provides a detailed technical breakdown of the object-oriented approach used by JaVers versus the table-oriented model of Envers, highlighting the benefits of technology independence.


- [JaVers: Code Audit Logs Easily in Java](https://betterprojectsfaster.com/learn/talks-ljc-medium-talk-2020-javers-audit-log/#getting-started)
  <br/>
  **Teaser**:
This article provides a comprehensive guide to implementing data audit logs using JaVers
and Spring Boot. It describes the JaVers table structure for SQL repositories,
specifically detailing how the `JV_COMMIT` table stores metadata like the author and commit date,
while the `JV_SNAPSHOT` table stores the object's state as JSON.
The article includes examples of versioning nested Value Objects (like EmailAddress lists),
showing how JaVers creates separate snapshots for each object.
Furthermore, it demonstrates querying for nested objects using the `DEEP_PLUS`
Shadow scope to reconstruct full historical object graphs.


## Vanilla Javers

If you are not using Spring, add `javers-core`
to your project dependencies and (optionally) choose proper `javers-repository` module.

### javers-core
Gradle: 

```groovy
implementation 'org.javers:javers-core:{{site.javers_current_version}}'
```   

**Please note** that Javers core and Javers persistence modules require **Java 11**.

If you’re going to use JaVers as an object diff tool, this is the only dependency you need.
        
### javers-repository
If you are going to use JaVers as a data audit framework, choose the proper repository implementation.
For example, if you’re using MongoDB add:

Gradle: 

```groovy
implementation 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

If you are using an SQL database &mdash; add:

```groovy
implementation 'org.javers:javers-persistence-sql:{{site.javers_current_version}}'
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

<h2 id="getting-started-audit">Data audit</h2>
Use the `javers.commit()` method to audit changes done on your domain objects.
Javers saves subsequent versions of domain objects 
as [Snapshots](/documentation/jql-examples/#query-for-snapshots)
in [JaversRepository](/documentation/repository-configuration/)

```java
Person robert = new Person("bob", "Robert Martin");
javers.commit("user", robert);
```

See more [audit examples](/documentation/repository-examples/).

<h2 id="getting-started-auto-audit">Auto-audit aspects</h2>

To automatically audit objects saved to your repositories, use the JaVers auto-audit aspect annotations.
For example, apply `@JaversSpringDataAuditable` to Spring Data repositories:

```java
@JaversSpringDataAuditable
public interface PersonRepository extends CrudRepository<Person, String> {
}
```

Read more about the [Auto-audit aspects](/documentation/spring-integration/#auto-audit-aspect).
