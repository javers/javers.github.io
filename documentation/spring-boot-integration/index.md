---
layout: page
title: Spring Boot integration
category: Documentation
submenu: spring-boot-integration
sidebar-url: docs-sidebar.html
---

[Spring Boot](http://projects.spring.io/spring-boot/)
is the standard in the world of enterprise Java.

Javers’ Spring Boot starters are the easiest 
and strongly recommended way of integrating Javers with your application.
This is the truly plug-and-play solution.

There are two starters compatible with Spring Data MongoDB
or with Spring Data JPA:

* **JaVers Spring Boot starter for MongoDB**,
  compatible with [Spring Boot starter for Spring Data MongoDB](https://spring.io/guides/gs/accessing-data-mongodb/)
* **JaVers Spring Boot starter for SQL**,
  compatible with [Spring Boot starter for Spring Data JPA](https://spring.io/guides/gs/accessing-data-jpa/)

<h2 id="get-javers-starters">Get JaVers Spring Boot starter</h2>

### MongoDB starter ###
Add JaVers Spring Boot starter for MongoDB to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```

### SQL starter ###
Add JaVers Spring Boot starter for SQL to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'
```

Check [Maven Central](https://search.maven.org/#artifactdetails|org.javers|javers-spring-boot-starter-mongo|{{site.javers_current_version}}|jar)
for other build tool snippets.

<h2 id="starters-auto-configuration">Spring Boot Auto-configuration</h2>

Thanks to the Spring Boot magic, Javers’ auto-configuration
when available on a classpath is automatically picked up and loaded.

Javers’ auto-configuration creates
all required Javers beans and optimally adjusts them
according to your application configuration:

- [JaVers instance bean](/documentation/spring-integration/#javers-instance-as-spring-bean)
  with [JaversRepository](/documentation/repository-configuration)
  configured to connect to your application’s database.
- [Auto-audit aspects beans](/documentation/spring-integration/#auto-audit-aspects-spring-configuration)

Check the complete list of JaVers’ beans added to your Spring Context:

* for MongoDB: [JaversMongoAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-mongo/src/main/java/org/javers/spring/boot/mongo/JaversMongoAutoConfiguration.java)
* for SQL: [JaversSqlAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-sql/src/main/java/org/javers/spring/boot/sql/JaversSqlAutoConfiguration.java)

<h2 id="customizing-auto-configuration">Customizing the Auto-configuration</h2>

Javers starters provides 

<h3 id="javers-configuration-properties">JaVers Core configuration</h3>

Use [Spring Boot configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
and configure Javers in the same way as your application (typically by YAML property files).

Here is an example `application.yml` file
with the full list of JaVers core properties, and their default values.
If these defaults are OK for you &mdash;
you don’t need to add anything to your configuration.

```yaml
javers:
  mappingStyle: FIELD
  algorithm: SIMPLE
  commitIdGenerator: synchronized_sequence
  prettyPrint: true
  typeSafeValues: false
  initialChanges: true
  terminalChanges: true
  packagesToScan:
  auditableAspectEnabled: true
  springDataAuditableRepositoryAspectEnabled: true
  objectAccessHook:
  prettyPrintDateFormats:
    localDateTime: 'dd MMM yyyy, HH:mm:ss'
    zonedDateTime: 'dd MMM yyyy, HH:mm:ssZ'
    localDate: 'dd MMM yyyy'
    localTime: 'HH:mm:ss'  
```  

Each property in the Spring `application.yml` file has the corresponding `with*()`
method in [`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java).

<h3 id="AuthorProvider-and-CommitPropertiesProvider">AuthorProvider and CommitPropertiesProvider beans</h3>

These two beans are required by [Auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect).
For both, default implementations are created by JaVers starter:

* For AuthorProvider &mdash;
  if JaVers detects Spring Security on your classpath,
  [`SpringSecurityAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/SpringSecurityAuthorProvider.java)
  is created.
  Otherwise, JaVers creates [`MockAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/MockAuthorProvider.java)
  which returns `"unknown"` author.
* For CommitPropertiesProvider &mdash;
  [`EmptyPropertiesProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/EmptyPropertiesProvider.java) which returns an empty Map.

Register your own beans **only** if you need to override these defaults.

See documentation of [AuthorProvider](/documentation/spring-integration/#author-provider-bean)
and [CommitPropertiesProvider](/documentation/spring-integration/#commit-properties-provider-bean)
for more details.


<h3 id="registering-json-type-adapters">Registering Custom JSON TypeAdapters</h3>

Your [JSON TypeAdapters](/documentation/repository-configuration/#json-type-adapters)
will be automatically registered if you configure 
them as Spring beans anywhere in your ApplicationContext.

For example:

```java
public static class DummyBigDecimalEntity {
    BigDecimal value;

    DummyBigDecimalEntity(BigDecimal value) {
        this.value = value;
    }
}

@Bean
JsonTypeAdapter dummyEntityJsonTypeAdapter () {

    return new BasicStringTypeAdapter<DummyBigDecimalEntity>() {
        @Override
        public String serialize(DummyBigDecimalEntity sourceValue) {
            return sourceValue.value.toString();
        }

        @Override
        public DummyBigDecimalEntity deserialize(String serializedValue) {
            return new DummyBigDecimalEntity(new BigDecimal(serializedValue));
        }

        @Override
        public Class getValueType() {
            return DummyBigDecimalEntity.class;
        }
    };
}
```

<h2 id="starter-repository-configuration">JaversRepository configuration</h2>

Javers starters rely on Spring Data starters
to create a proper [JaversRepository](/documentation/repository-configuration)
instance.
JaversRepository is configured to reuse your application’s
database managed by Spring Data starter.

Properties active in the SQL starter:

```yaml
javers:
  sqlSchema:
  sqlSchemaManagementEnabled: true
  sqlGlobalIdCacheDisabled: false
  objectAccessHook: org.javers.hibernate.integration.HibernateUnproxyObjectAccessHook
  sqlGlobalIdTableName: jv_global_id
  sqlCommitTableName: jv_commit
  sqlSnapshotTableName: jv_snapshot
  sqlCommitPropertyTableName: jv_commit_property
```   

Properties active in the MongoDB starter:

```yaml
javers:
  documentDbCompatibilityEnabled: false
  objectAccessHook: org.javers.spring.mongodb.DBRefUnproxyObjectAccessHook
  snapshotsCacheSize: 5000
```   

  
<h3 id="dedicated-mongo-database">Dedicated Mongo database for JaVers</h3>  
  
Optionally, you can use dedicated Mongo database for JaVers data,
configure Javers as shown below:

```yaml
javers:
  mongodb:
    host: localhost
    port: 27017
    database: javers-audit
    authentication-database: admin
    username: javers
    password: password
```

or:

```yaml
javers:
  mongodb:
    uri: mongodb://javers:password@localhost:27017/javers-audit&authSource=admin
```

If `javers.mongodb` property is defined, either `host` or `uri` has to set.
If so, an application’s data and JaVers data are stored in different databases.
  
#### MongoClientSettings
If you need more control over Javers’ dedicated `MongoClient`,
you can configure a `MongoClientSettings` bean named `javersMongoClientSettings`.
If there is no such bean, default client options are used. 
  
For example, if you want to enable SSL and set socket timeout, define this bean:
  
```java
@Bean("javersMongoClientSettings")
public MongoClientSettings clientSettings() {
    return MongoClientSettings.builder()
            .applyToSslSettings(builder -> builder.enabled(true))
            .applyToSocketSettings(
                builder -> builder.connectTimeout(500, TimeUnit.MILLISECONDS))
            .build();
}
```  
Remember, the `javersMongoClientSettings` bean is used only when JaVers connects
to dedicated Mongo database defined in `javers.mongodb` property.
 
<h2 id="starter-boot">Boot it!</h2>

Once you’ve added the JaVers starter to the classpath, you can use all JaVers features.

<h3 id="boot-Auto-audit">Auto-audit aspect annotations</h3>

JaVers [auto-audit aspects](/documentation/spring-integration/#auto-audit-aspect)
are based on annotations.

Basically, choose Entities you want to be audited by JaVers and
add `@JaversSpringDataAuditable` to corresponding Spring Data CRUD repositories.

For example, if you want to audit a Person Entity, annotate `PersonRepository`:

```java
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.javers.organization.structure.domain.Person;

@JaversSpringDataAuditable
public interface PersonRepository extends MongoRepository<Person, String> {
}
```

and all changes made to Person objects will be automatically committed to JaVersRepository.

If you aren’t using Spring Data repositories,
annotate data-changing methods with `@JaversAuditable`.

For example:

```java
@Repository
class UserRepository {
    @JaversAuditable
    public void save(User user) {
        ...//
    }

    public User find(String login) {
        ...//
    }
}
```    

More [annotations](/documentation/spring-integration/#javers-spring-annotations)
are available.

<h3 id="boot-manual-commits">Manual commits</h3>
If you need more fine-grained control over JaVers commits,
use JaVers instance directly (which is available as a Spring bean).

For example, this service commits changes made to a fired 
Person but only in Friday:

```java
@Service
class PersonService {
    private final Javers javers;
    private final PersonRepository personRepository;

    @Autowired
    public PersonService(Javers javers, PersonRepository personRepository) {
        this.javers = javers;
        this.personRepository = personRepository;
    }
    
    public void fire(Person person) {
        person.fire();
        personRepository.save(person);

        if (LocalDate.now().getDayOfWeek() == DayOfWeek.FRIDAY){
            javers.commit("author", person);
        }
    }
}
```

<h3 id="boot-querying">Querying JaversRepository</h3>

When your objects are persisted in JaversRepository
use [JQL](/documentation/jql-examples/) to query for snapshots and changes.


REST controller example:

```java
@RestController
@RequestMapping(value = "/audit")
public class AuditController {

    private final Javers javers;

    @Autowired
    public AuditController(Javers javers) {
        this.javers = javers;
    }

    @RequestMapping("/person")
    public String getPersonChanges() {
        QueryBuilder jqlQuery = QueryBuilder.byClass(Person.class);

        List<Change> changes = javers.findChanges(jqlQuery.build());

        return javers.getJsonConverter().toJson(changes);
    }
}
```

<h2 id="starter-demo-app">Demo application</h2>
We created a demo application based on Spring Boot.
It manages the Organization Structure domain.
The User can change salaries and positions of Employees and move them in the Structure.
All changes are audited and easy to browse.
   
Check out how easy it is to add the JaVers audit to the Spring Boot application.

Clone it from github:

```
git clone https://github.com/javers/organization-structure.git
```

Run it

```
cd organization-structure
./gradlew organization-structure-sql:bootRun
```

and check it out on [localhost:8080/view/person](http://localhost:8080/view/person).






