---
layout: page
title: Spring Boot integration
category: Documentation
submenu: spring-boot-integration
sidebar-url: docs-sidebar.html
---

[Spring Boot](http://projects.spring.io/spring-boot/)
has become a standard in the world of Java enterprise applications.

Our Spring Boot starters simplify integrating
JaVers with your application. All required JaVers beans are 
created and auto-configured with reasonable defaults.

There are two starters compatible with Spring Data and 
common persistence stacks:

* **JaVers Spring Boot starter for MongoDB**,
  compatible with [Spring Boot starter for Spring Data MongoDB](https://spring.io/guides/gs/accessing-data-mongodb/)
* **JaVers Spring Boot starter for SQL**,
  compatible with [Spring Boot starter for Spring Data JPA](https://spring.io/guides/gs/accessing-data-jpa/)

<h2 id="get-javers-starters">Get JaVers Spring Boot starter</h2>

### MongoDB starter ###
Add JaVers MongoDB and Spring Data MongoDB starters to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
compile 'org.springframework.boot:spring-boot-starter-data-mongodb:' + $SPRING_BOOT_VERSION   
```

### SQL starter ###
Add JaVers SQL and Spring Data JPA starters to your classpath:

```groovy
compile 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'
compile 'org.springframework.boot:spring-boot-starter-data-jpa:' + $SPRING_BOOT_VERSION   
```

Check [Maven Central](https://search.maven.org/#artifactdetails|org.javers|javers-spring-boot-starter-mongo|{{site.javers_current_version}}|jar)
for other build tool snippets.

<h2 id="javers-configuration-properties">JaVers configuration</h2>

Use [Spring Boot configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
and configure JaVers in the same way as your application (typically by YAML property files).

Here is an example `application.yml` file
with the full list of JaVers core properties and their default values.
You don’t need to add anything to your configuration, if these defaults are OK for you.

```
javers:
  mappingStyle: FIELD
  algorithm: SIMPLE
  commitIdGenerator: synchronized_sequence
  prettyPrint: true
  typeSafeValues: false
  newObjectSnapshot: false
  packagesToScan:
  auditableAspectEnabled: true
  springDataAuditableRepositoryAspectEnabled: true
  sqlSchema:
  sqlSchemaManagementEnabled: true
  prettyPrintDateFormats:
    localDateTime: "dd MMM yyyy, HH:mm:ss"
    zonedDateTime: "dd MMM yyyy, HH:mm:ssZ"
    localDate: "dd MMM yyyy"
    localTime: "HH:mm:ss"  
```  

Additional properties available in SQL starter:

```
javers:
  sqlSchema:
  sqlSchemaManagementEnabled: true
```   

Additional properties available in MongoDB starter:

```
javers:
  documentDbCompatibilityEnabled: false
```   

Each property in the Spring `application.yml` file has the corresponding `with*()` method in the
[JaversBuilder]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html).

<h2 id="starters-auto-configuration">Spring AutoConfiguration</h2>
Thanks to Spring Boot magic, starters available on the classpath are automatically picked up
and launched. 

See the complete list of JaVers beans added to your Spring ApplicationContext:

* for MongoDB: [JaversMongoAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-mongo/src/main/java/org/javers/spring/boot/mongo/JaversMongoAutoConfiguration.java)
* for SQL: [JaversSqlAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-sql/src/main/java/org/javers/spring/boot/sql/JaversSqlAutoConfiguration.java)

### AuthorProvider and CommitPropertiesProvider beans
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

<h2 id="starter-repository-configuration">JaversRepository configuration</h2>
JaVers starters rely on Spring Data starters.
Proper JaversRepository implementation is created and configured to reuse an application’s
database (managed by Spring Data starters).
  
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
  
#### MongoClientOptions
If you need more control over Javers’ dedicated `MongoClient`,
you can configure a `MongoClientOptions` bean named `javersMongoClientOptions`.
If there is no such bean, default client options are used. 
  
For example, if you want to enable SSL and set socket timeout value,
define this bean:
  
```java
@Bean("javersMongoClientOptions")
public MongoClientOptions clientOptions() {
  return MongoClientOptions.builder()
  .sslEnabled(true)
  .socketTimeout(1500)
  .build();
}
```  
Remember, the `javersMongoClientOptions` bean is used only when JaVers connects to dedicated Mongo
database defined in `javers.mongodb` property.
 
<h2 id="starter-boot">Boot it!</h2>

Once you’ve added the JaVers starter to the classpath, you can use all JaVers features.

<h3 id="boot-Auto-audit">Auto-audit aspect annotations</h3>

JaVers [auto-audit](/documentation/spring-integration/#auto-audit-aspect)
aspect is based on annotations: `@JaversSpringDataAuditable` and `@JaversAuditable`.

Basically, choose Entities you want to be audited by JaVers and
add `@JaversSpringDataAuditable` to corresponding Spring Data CRUD repositories.

For example, if you want to audit the Person Entity, annotate `PersonRepository`:

```java
import org.javers.spring.annotation.JaversSpringDataAuditable
import org.springframework.data.mongodb.repository.MongoRepository;
import org.javers.organization.structure.domain.Person;

@JaversSpringDataAuditable
public interface PersonRepository extends MongoRepository<Person, String> {
}
```

and all changes made to Person objects will be committed to JaVersRepository.

If you aren’t using Spring Data repositories,
annotate all data-changing methods with `@JaversAuditable`.

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


<h3 id="boot-manual-commis">Manual commits</h3>
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






