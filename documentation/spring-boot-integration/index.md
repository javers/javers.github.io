---
layout: docs
title: Spring Boot integration
submenu: spring-boot-integration
---

<font color="red">
**INCUBATING**
Spring Boot starters are incubating and will be released with JaVers 1.4.1. 
</font>


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


<h2 id="javers-configuration-properties">JaVers Core configuration</h2>

Use [Spring Boot configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
and configure JaVers the same way like your application (typically by YAML property files).

Here is an `application.yml` file example
with the full list of JaVers properties and their default values.

```
javers:
  mappingStyle: FIELD
  algorithm: BEAN
  prettyPrint: true
  typeSafeValues: false
  newObjectSnapshot: false
```  

See [JaversBuilder javadoc]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html)
for properties documentation.
Each property has a corresponding `with*()` method.

<h2 id="mongodb-auto-configuration">MongoDB auto-configuration</h2>

### Dependency ###
Add JaVers MongoDB and Spring Data MongoDB starters to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
compile 'org.springframework.boot:spring-boot-starter-data-mongodb:' + SPRING_BOOT_VERSION   
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

### AuthorProvider bean

Default [AuthorProvider](/documentation/spring-integration/#author-provider-bean) 
implementation is provided in JaVers starter.
It returns `"unknown"` name.

If you are using [Auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect)
(`@JaversSpringDataAuditable` or `@JaversAuditable`),
consider implementing AuthorProvider bean. It should return a current user login.

### Setup MongoDB ###
JaVers depends on `MongoClient` bean, created by `spring-boot-starter-data-mongodb`.

Set `javers.databaseName` property to choose a database name for JaversRepository.
For example, in `application.yml`:

```
javers:
  databaseName: test
```  

For now, database name is defaulted to `javers_db`. 
In JaVers 1.4.1, database name would be
taken from `spring.data.mongodb.database` property (application’s main database).

