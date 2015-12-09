---
layout: docs
title: Spring Boot integration
submenu: spring-boot-integration
---

Spring Boot becomes a ubiquitous standard in enterprise applications world. With this aim in mind we made auto configuration classes that
makes your life easier.


<h2 id="javers-configuration-properties">Javers configuration</h2>

You can use [Spring Boot externalized configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
feature and configure Javers by properties files, YAML files, environment variables or command-line arguments

Properties space: **javers**

<table class="table" width="100%" style='word-wrap: break-word; font-family: monospace;'>
<tr>
    <th>Property</th>
    <th>Description</th>
    <th>Default value</th>
</tr>
    <td>algorithm</td>
    <td><a href="http://javers.org/documentation/diff-configuration/#simple-vs-levenshtein">Simple vs Levenshtein algorithm</a></td>
    <td>simple</td>
<tr>
</tr>
    <td>mappingStyle</td>
    <td><a href="http://javers.org/documentation/domain-configuration/#property-mapping-style">Bean vs field property mapping style</a></td>
    <td>field</td>
<tr>
</tr>
    <td>newObjectSnapshot</td>
    <td><a href="http://javers.org/javadoc_1.3.0/org/javers/core/JaversBuilder.html#withNewObjectsSnapshot-boolean-">Generates additional 'Snapshots' of new objects</a></td>
    <td>false</td>
<tr>
</tr>
    <td>prettyPrint</td>
    <td><a href="http://javers.org/javadoc_1.3.0/org/javers/core/JaversBuilder.html#withPrettyPrint-boolean-">Choose between JSON pretty or concise printing style</a></td>
    <td>true</td>
<tr>
</tr>
    <td>typeSafeValues</td>
    <td><a href="http://javers.org/javadoc_1.3.0/org/javers/core/JaversBuilder.html#withTypeSafeValues-boolean-">Switch on when you need a type safe serialization for heterogeneous collections like List, List<Object></a></td>
    <td>false</td>
<tr>
</table>


<h2 id="mongodb-auto-configuration">MongoDB auto-configuration</h2>
### Usage ###

First add javers-spring-boot-starter-mongo module to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```
Check
[Maven Central](http://search.maven.org/#artifactdetails|org.javers|javers-spring|{{site.javers_current_version}}|jar)
for snippets to other build tools.

### Import configuration ###

Next you have to indicate [JaversMongoAutoConfiguration]() to import into your application

```java

@Configuration
@Import(JaversMongoAutoConfiguration.class)
public class JaversSpringBootMongoConfiguration {

...

```

### Setup MongoDB ###

Keep in mind that [JaversMongoAutoConfiguration]() autowired interface to access database
([MongoDatabase](http://api.mongodb.org/java/current/com/mongodb/client/MongoDatabase.html)) so you should have this object in your
application container.

```java

@Bean
MongoDatabase mongoDatabase() {
    return new MongoClient().getDatabase("test");
}
```

### Register AuthorProvider bean

Every JaVers commit (data change) should be connected to its author, i.e. the
user who made the change.
Please don’t confuse JaVers commit (a bunch of data changes)
with the SQL commit command (finalizing an SQL transaction).

You need to register an implementation of the `AuthorProvider` interface,
which returns a current user login.

Here’s the contract:

```java
package org.javers.spring.auditable;

/**
 * Implementation has to be thread-safe and has to provide
 * an author (typically a user login), bounded to current user session.
 */
public interface AuthorProvider {
    String provide();
}
```