---
layout: page
title: Spring Boot integration
category: Documentation
submenu: spring-boot-integration
sidebar-url: docs-sidebar.html
---

[Spring Boot](http://projects.spring.io/spring-boot/)
is the standard in the world of enterprise Java.

Javers Spring Boot starters are the easiest 
and strongly recommended way of integrating Javers with your application.
This is the truly plug-and-play solution.

There are two Javers Spring Boot starters:

* **Javers Spring Boot starter for MongoDB**,
  compatible with [Spring Boot starter for Spring Data MongoDB](https://spring.io/guides/gs/accessing-data-mongodb/)
* **Javers Spring Boot starter for SQL**,
  compatible with [Spring Boot starter for Spring Data JPA](https://spring.io/guides/gs/accessing-data-jpa/)

<h2 id="get-javers-starters">Get a Javers Spring Boot starter</h2>

### The Redis starter ###
Add the Javers Spring Boot starter for Redis to your classpath:

```groovy
implementation 'org.javers:javers-spring-boot-starter-redis:{{site.javers_current_version}}'
```

### The MongoDB starter ###
Add the Javers Spring Boot starter for MongoDB to your classpath:

```groovy
implementation 'org.javers:javers-spring-boot-starter-mongo:{{site.javers_current_version}}'
```

### The SQL starter ###
Add the Javers Spring Boot starter for SQL to your classpath:

```groovy
implementation 'org.javers:javers-spring-boot-starter-sql:{{site.javers_current_version}}'
```

Check [Maven Central](https://central.sonatype.com/artifact/org.javers/javers-spring-boot-starter-sql/{{site.javers_current_version}}/versions)
for other build tool snippets.

<h2 id="starters-auto-configuration">Spring Boot Auto-configuration</h2>

Thanks to the Spring Boot magic, Javers auto-configuration
when available on a classpath, is automatically picked up and loaded.

The Javers starter creates all required Javers beans and optimally adjusts them
according to your application configuration. That is:

- [Javers instance bean](/documentation/spring-integration/#javers-instance-as-spring-bean)
  with [JaversRepository](/documentation/repository-configuration)
  connected to your application’s database,
- [Auto-audit aspects beans](/documentation/spring-integration/#auto-audit-aspects-spring-configuration).

Check the complete list of Javers beans added to your Spring Context:

* for Redis: [JaversRedisAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-redis/src/main/java/org/javers/spring/boot/redis/JaversRedisAutoConfiguration.java)
* for MongoDB: [JaversMongoAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-mongo/src/main/java/org/javers/spring/boot/mongo/JaversMongoAutoConfiguration.java),
* for SQL: [JaversSqlAutoConfiguration.java](https://github.com/javers/javers/blob/master/javers-spring-boot-starter-sql/src/main/java/org/javers/spring/boot/sql/JaversSqlAutoConfiguration.java).

<h2 id="customizing-auto-configuration">Customizing the Auto-configuration</h2>

First of all, Javers auto-configuration can be customized using the
standard Spring Boot configuration files.

Second, by adding the following beans to your Spring Context:
[AuthorProvider, CommitPropertiesProvider](#AuthorProvider-and-CommitPropertiesProvider), and
[JSON TypeAdapters](#registering-json-type-adapters).

<h3 id="javers-configuration-properties">Javers Core configuration</h3>

Use [Spring Boot configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
and configure Javers in the same way as your application (typically by YAML files).

Here is an example `application.yml` file
with the full list of Javers core properties, and their default values.
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
  usePrimitiveDefaults: true
  prettyPrintDateFormats:
    localDateTime: 'dd MMM yyyy, HH:mm:ss'
    zonedDateTime: 'dd MMM yyyy, HH:mm:ssZ'
    localDate: 'dd MMM yyyy'
    localTime: 'HH:mm:ss'  
```  

Each of these properties have a corresponding `with*()`
method in [`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java).

<h3 id="AuthorProvider-and-CommitPropertiesProvider">AuthorProvider and CommitPropertiesProvider beans</h3>

These two beans are required by the [Auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect).
Default implementations are provided by Javers starters:

* [`SpringSecurityAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/SpringSecurityAuthorProvider.java)
  bean is created if Javers detects Spring Security on your classpath.
  Otherwise, Javers creates [`MockAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/MockAuthorProvider.java)
  which returns `"unknown"` author.
* [`EmptyPropertiesProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/EmptyPropertiesProvider.java)
  bean is created. It returns an empty Map.

Register your own beans **only** if you need to override these defaults.

See documentation of [AuthorProvider](/documentation/spring-integration/#author-provider-bean)
and [CommitPropertiesProvider](/documentation/spring-integration/#commit-properties-provider-bean)
for more details.

<h3 id="Javers-SQL-Repository">Javers SQL Repository</h3>

The Javers SQL starter creates a [JaversSqlRepository](/documentation/repository-configuration/#sql-databases)
instance connected to your application’s database, which is managed by the Spring Data starter.

Here is the list of `JaversSqlRepository` properties with default values
provided by the SQL starter. Please don’t change them without a good reason.

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

#### Transaction management in the SQL starter

The Javers SQL starter creates a transactional Javers instance linked to
`PlatformTransactionManager` managed by Spring Data JPA. 
It should not come as a surprise, that transaction management is mandatory here. 

<h3 id="Javers-MongoDB-Repository">Javers MongoDB Repository</h3>

By default, the Javers MongoDB starter creates a 
[MongoRepository](/documentation/repository-configuration/#mongodb-configuration)
instance connected to your application’s database,
which is managed by the Spring MongoDB starter.

Here is the list of `MongoRepository` properties with default values
provided by the MongoDB starter. Please don’t change them without a good reason.

```yaml
javers:
  documentDbCompatibilityEnabled: false
  objectAccessHook: org.javers.spring.mongodb.DBRefUnproxyObjectAccessHook
  snapshotsCacheSize: 5000
  snapshotCollectionName: "jv_snapshots"
  headCollectionName: "jv_head_id"
  schemaManagementEnabled: true
```

#### Transaction management in the MongoDB starter

The Javers MongoDB starter supports both approaches: non-transactional (MongoDB classic)
and transactional (introduced in MongoDB 4.0).

The starter automatically detects which approach is used by your application
by checking if `MongoTransactionManager` is defined in your Spring Context.
If so, the starter creates a transactional Javers instance
linked to your `MongoTransactionManager`.
Then, the transactional Javers participates in your application’s transactions. Awesome!

If `MongoTransactionManager` is missing &mdash; the starter simply creates
a non-transactional Javers instance.

See [MongoDB transactions support](/documentation/spring-integration/#mongo-transactions).

#### Dedicated MongoDB database for Javers

Optionally, you can configure
the starter to store Javers’ data in a dedicated MongoDB database.
If so, application’s data and Javers’ data are stored in different databases.

Configure a dedicated database for Javers as shown below:

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

If the `javers.mongodb` property is defined, either `host` or `uri` has to be set.
  
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
Remember, the `javersMongoClientSettings` bean is used only when Javers connects
to dedicated MongoDB database defined in `javers.mongodb` property.

<h3 id="Javers-Redis-Repository">Javers Redis Repository</h3>

The Javers Redis starter creates a [JaversRedisRepository](/documentation/repository-configuration/#redis-db)
instance connected to your application’s database, which is managed by the Spring Data starter.
This integration allows for easy configuration of Redis, leveraging Spring Boot’s properties management. 
The support extends to both standalone Redis and Redis with Sentinel for high availability.

<h4>Global Redis Configuration</h4>

<div style="background-color: #F5F5F5; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <table style="width: 100%;">
    <thead>
      <tr>
        <th>Property Key</th>
        <th>Description</th>
        <th style="text-align:right;">Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>javers.redis.enabled</td>
        <td>Enables or disables Redis support in JaVers.</td>
        <td style="text-align:right;">true</td>
      </tr>
      <tr>
        <td>javers.redis.audit-duration</td>
        <td>The duration for keeping audit snapshots in Redis.</td>
        <td style="text-align:right;">30d (30 days)</td>
      </tr>
    </tbody>
  </table>
</div>

<h4>Standalone Redis Properties</h4>

For standalone Redis instances, you can configure the following properties as follows:

<div style="background-color: #F5F5F5; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <table style="width: 100%;">
    <thead>
      <tr>
        <th>Property Key</th>
        <th>Description</th>
        <th style="text-align:right;">Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>javers.redis.jedis.user</td>
        <td>The username for Redis authentication.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.password</td>
        <td>The password for Redis authentication.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.database</td>
        <td>The Redis database index.</td>
        <td style="text-align:right;">0</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.client-name</td>
        <td>The client name for identifying the connection.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.host</td>
        <td>The Redis server host.</td>
        <td style="text-align:right;">localhost</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.port</td>
        <td>The Redis server port.</td>
        <td style="text-align:right;">6379</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.timeout</td>
        <td>Connection timeout in milliseconds.</td>
        <td style="text-align:right;">2000</td>
      </tr>
      <tr>
        <td>javers.redis.jedis.ssl</td>
        <td>Enable SSL for the Redis connection.</td>
        <td style="text-align:right;">false</td>
      </tr>
    </tbody>
  </table>
</div>


<h4>Sentinel Configuration Properties</h4>

For high availability, JaVers supports Redis Sentinel, which you can configure with the following properties as follows:

<div style="background-color: #F5F5F5; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <table style="width: 100%;">
    <thead>
      <tr>
        <th>Property Key</th>
        <th>Description</th>
        <th style="text-align:right;">Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>javers.redis.sentinel.master-name</td>
        <td>The name of the Redis master managed by Sentinel.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinels</td>
        <td>A set of Sentinel nodes (host:port).</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.connection-timeout</td>
        <td>Timeout for connecting to Redis, in milliseconds.</td>
        <td style="text-align:right;">2000</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.so-timeout</td>
        <td>Socket timeout for Redis connections, in milliseconds.</td>
        <td style="text-align:right;">2000</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinel-connection-timeout</td>
        <td>Timeout for connecting to Sentinel, in milliseconds.</td>
        <td style="text-align:right;">2000</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinel-so-timeout</td>
        <td>Socket timeout for Sentinel connections, in milliseconds.</td>
        <td style="text-align:right;">2000</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinel-user</td>
        <td>The username for Sentinel authentication.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinel-password</td>
        <td>The password for Sentinel authentication.</td>
        <td style="text-align:right;">null</td>
      </tr>
      <tr>
        <td>javers.redis.sentinel.sentinel-client-name</td>
        <td>The client name for identifying the Sentinel connection.</td>
        <td style="text-align:right;">null</td>
      </tr>
    </tbody>
  </table>
</div>


<h4>Important Notes</h4>

- **Global Configuration:** 

    The enabled property controls whether Redis support is active. The audit-duration and object-access-hook properties provide additional control over auditing behavior.
- **Jedis and Sentinel:** 

    You can configure either jedis for standalone Redis or sentinel for high-availability setups. Ensure you set the correct properties based on your Redis deployment.
- **Default Values:** 

    Properties such as host, port, and timeout have default values but can be customized as needed.

- **SSL Support:** 

    If your Redis instance uses SSL, set the ssl property to true.

<h4>Example Standalone Configuration</h4>

```yaml
javers:
  redis:
    enabled: true
    audit-duration: 30d
    jedis:
      user: standaloneUser
      password: secret
      database: 1
      client-name: myJaversClient
      host: redis-server
      port: 6379
      timeout: 3000
      ssl: true
```   

<h4>Example Sentinel Configuration</h4>

```yaml
javers:
  redis:
    enabled: true
    audit-duration: 30d
    sentinel:
      master-name: mymaster
      sentinels: redis-sentinel-1:26379,redis-sentinel-2:26379,redis-sentinel-3:26379
      connection-timeout: 3000
      so-timeout: 3000
      sentinel-connection-timeout: 3000
      sentinel-so-timeout: 3000
      sentinel-user: sentinelUser
      sentinel-password: secret
      sentinel-client-name: mySentinelClient
```   

<h3 id="registering-json-type-adapters">Registering Custom JSON TypeAdapters</h3>

Your [JSON TypeAdapters](/documentation/repository-configuration/#json-type-adapters)
will be automatically registered if you configure
them as Spring beans anywhere in your Spring Context.

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

<h2 id="starter-boot">Boot it!</h2>

Once you’ve added the Javers starter to the classpath, you can use all Javers features.

<h3 id="boot-Auto-audit">Auto-audit aspect annotations</h3>

Javers [auto-audit aspects](/documentation/spring-integration/#auto-audit-aspect)
are based on annotations.

Basically, choose Entities you want to be audited by Javers and
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

and all changes made to Person objects will be automatically committed to JaversRepository.

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
If you need more fine-grained control over Javers commits,
use Javers instance directly (which is available as a Spring bean).

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
   
Check out how easy it is to add the Javers audit to the Spring Boot application.

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






