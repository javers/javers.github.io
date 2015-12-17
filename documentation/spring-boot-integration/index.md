---
layout: docs
title: Spring Boot integration
submenu: spring-boot-integration
---

[Spring Boot](http://projects.spring.io/spring-boot/)
becomes a standard in the world of Java enterprise applications.

Our Spring Boot starters simplifies integrating
JaVers with your application. All required JaVers beans are 
created and auto-configured to use application’s database.  

There are two starters compatible with Sping Data and 
common persistence stacks:

* [`javers-spring-boot-starter-mongo`]
 (#mongodb-auto-configuration) compatible with [`spring-boot-starter-data-mongodb`]
(https://spring.io/guides/gs/accessing-data-mongodb/),
* `javers-spring-boot-starter-sql` compatible with [`spring-boot-starter-data-jpa`]
(https://spring.io/guides/gs/accessing-data-jpa/),


<h2 id="javers-configuration-properties">JaVers configuration</h2>

Use [Spring Boot externalized configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
and configure JaVers the same way like your application (typically by YAML property files).

Here is an `application.yml` file example
with the full list of JaVers properties and their default values.

```
javers:
  databaseName: javers_db
  mappingStyle: FIELD
  algorithm: BEAN
  prettyPrint: true
  typeSafeValues: false
  newObjectSnapshot: false
```  

See [JaversBuilder javadoc]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html)
for properties documentation. Each property
(except of `databaseName`) has a corresponding `with*()` method.

<h2 id="mongodb-auto-configuration">MongoDB auto-configuration</h2>

### Dependency ###
Add `javers-spring-boot-starter-mongo` module to your classpath.

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```

Check [Maven Central](http://search.maven.org/#artifactdetails|org.javers|javers-spring-boot-starter-mongo|{{site.javers_current_version}}|jar)
for other build tools snippets.

### AutoConfiguration ###

Import `JaversMongoAutoConfiguration` into your Spring application:

```java
import org.javers.spring.boot.mongo.JaversMongoAutoConfiguration;
import org.springframework.context.annotation.Configuration;

@Configuration
@Import(JaversMongoAutoConfiguration.class)
public class JaversSpringBootMongoConfiguration {
   ...
}

```

### Setup MongoDB ###
JaVers depends on `MongoClient` bean, typically created by `spring-boot-starter-data-mongodb`.

Set `javers.databaseName` property to choose a database name for JaversRepository. 

For now, database name is defaulted to `javers_db`. 
In the next JaVers version, database name would be
taken from `spring.data.mongodb.database` property (application’s main database).

/*
Keep in mind that [JaversMongoAutoConfiguration]() autowired interface to access database
([MongoDatabase](http://api.mongodb.org/java/current/com/mongodb/client/MongoDatabase.html)) so you should have this object in your
application container.

```java

@Bean
MongoDatabase mongoDatabase() {
    return new MongoClient().getDatabase("test");
}
```
*/

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