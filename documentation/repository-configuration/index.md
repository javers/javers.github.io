---
layout: page
title: JaVers Repository Configuration
category: Documentation
submenu: repository-configuration
sidebar-url: docs-sidebar.html
---

If you’re going to use JaVers as a data audit framework you should configure `JaversRepository`.

The purpose of JaversRepository is to store JaVers commits in your database,
alongside your domain data. JSON format is used for serializing your data.
This approach significantly simplifies the construction of JaversRepository.
The hardest work — mapping domain objects to persistent format (JSON) —
is done by javers-core.
This common JSON format is used by many JaversRepository implementations.

In runtime, JaVers commit holds a list of domain object snapshots and a list of changes (a diff).
Only snapshots are persisted in a database.
When JaVers commit is being read from a database, snapshots are deserialized from JSON
and the diff is re-calculated by comparing snapshot pairs.

By default, JaVers comes with in-memory repository implementation. It’s perfect for testing,
but for production environment you need something real.

<h2 id="choose-javers-repository">Choose JaversRepository</h2>

First, choose proper JaversRepository implementation.
Currently, JaVers supports the following databases: **MongoDB**, **H2**, **PostgreSQL**, **MySQL**, **MariaDB**,
**Oracle**, **Microsoft SQL Server** and **Redis**.

In JaVers 5.2.4, we have added experimental support for **Amazon DocumentDB** which claims to be
almost fully compatible with MongoDB.

**Hint.** If you are using Spring Boot, just add one of our
[Spring Boot starters for Spring Data](/documentation/spring-boot-integration/)
and let them automatically configure and boot a JaVers instance with proper JaversRepository implementation.

<h2 id="redis-db">Redis</h2>

**Dependency**<br/>
Add `javers-persistence-redis` module to your classpath:

_Maven_<br/>

```
<dependency>
    <groupId>org.javers</groupId>
    <artifactId>javers-persistence-redis</artifactId>
    <version>{{site.javers_current_version}}</version>
</dependency>
```

_Gradle (short)_<br/>

```
implementation 'org.javers:javers-persistence-redis:{{site.javers_current_version}}'
```

Check
[Maven Central](https://central.sonatype.com/artifact/org.javers/javers-persistence-redis/{{site.javers_current_version}}/versions)
for other build tools snippets.

<h3>Overview</h3>

The idea of configuring `JaversRedisRepository` is simple, just provide a working Jedis (Java client for Redis). You can setup `JaversRedisRepository` as follows:

```java
import org.javers.repository.redis.JaversRedisRepository;
import redis.clients.jedis.JedisPool;
...

private static final String REDIS_HOST = "localhost";
private static final int REDIS_PORT = 6379;
private static final Duration REDIS_KEY_EXPIRATION_TIME = Duration.ofSeconds(3600);


final var jedisPool = new JedisPool();
final var javersRedisRepository = new JaversRedisRepository(jedisPool, REDIS_KEY_EXPIRATION_TIME);
final var javers = JaversBuilder.javers().registerJaversRepository(javersRedisRepository).build();
```

<h3>Schema</h3>
JaVers creates several key-value pairs in Redis, with main keys being:

- `jv_head_id` — A `String` that holds the value of the last `CommitId`.
- `jv_snapshots_keys` — A `Set` that contains keys, where each key is a reference to another key of type `List`. These lists contain snapshots for specific entities and their properties.
- `jv_snapshots_keys:<Entity Name>` — Domain-specific sets pointing to lists containing snapshots for specific objects of that entity type.

<h3>Handling Redis Key Expiration</h3>

In Redis, when a key expires, it is automatically removed from the database. However, additional cleanup may be required if the expired key is referenced in other structures, such as sets.

**CdoSnapshotKeyExpireListener**

The `CdoSnapshotKeyExpireListener` is an event listener designed to handle key expiration events in Redis. Its primary responsibility is to ensure that expired key entries are removed from all relevant sets.

When an instance of `JaversRedisRepository` is created, it subscribes to keyspace events with the pattern `__key*__:jv_snapshots:*`. This subscription allows the `CdoSnapshotKeyExpireListener` to process key expiration events as they occur.

Upon receiving a key expiration event, the `CdoSnapshotKeyExpireListener` identifies the expired key and removes its entries from all relevant sets, such as `jv_snapshots_keys` and `jv_snapshots_keys:<Entity Name>`.

**Expired Keys Cleanup**

A significant challenge arises if Redis keys expire when there is no active `CdoSnapshotKeyExpireListener` running. In this scenario, expired key entries will remain in the sets, leading to potential data inconsistencies.

To address this challenge, we have introduced the public method `cleanExpiredSnapshotsKeysSets` in JaversRedisRepository that can be called to perform the necessary cleanup. This ensures that expired keys are properly removed from all relevant sets, even if the listener is not active at the time of expiration.

<h2 id="mongodb-configuration">MongoDB</h2>
**Dependency**<br/>
If you’re using MongoDB, choose `MongoRepository`.

Add `javers-persistence-mongo` module to your classpath:

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

Check
[Maven Central](https://central.sonatype.com/artifact/org.javers/javers-persistence-mongo/{{site.javers_current_version}}/versions)
for other build tools snippets.

**Usage**<br/>
The idea of configuring MongoRepository is simple,
just provide a working Mongo client.

```java
import org.javers.repository.mongo.MongoRepository;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;

...

//by default, use the same database connection
//which you are using for your primary database
MongoDatabase mongoDb = new MongoClient( "localhost" ).getDatabase("test");

MongoRepository mongoRepository = new MongoRepository(mongoDb);
Javers javers = JaversBuilder.javers().registerJaversRepository(mongoRepository).build();
```

Here’s the [Spring Config example](/documentation/spring-integration/#auto-audit-example) for MongoRepository.

**Schema**<br/>
JaVers creates two collections in MongoDB:

- `jv_head_id` — one document with the last CommitId,
- `jv_snapshots` — domain object snapshots. Each document contains snapshot data and commit metadata.

<h3 id="documentdb-configuration">Amazon DocumentDB</h3>

Configuration is the same as for MongoDB, but you should use this factory method
to create a repository instance:

```java
MongoRepository documentDBrepository =
        MongoRepository.mongoRepositoryWithDocumentDBCompatibility(mongoDb);
```

<h2 id="sql-databases">SQL databases</h2>
**Dependency**<br/>
Add `javers-persistence-sql` module to your classpath:

```groovy
compile 'org.javers:javers-persistence-sql:{{site.javers_current_version}}'
```

Check
[Maven Central](https://central.sonatype.com/artifact/org.javers/javers-persistence-sql/{{site.javers_current_version}}/versions)
for other build tools snippets.

<h3>Overview</h3>

JaVers uses it’s own, lightweight abstraction layer over various SQL dialects.

The following SQL database types are supported:
**H2**, **PostgreSQL**, **MySQL**/**MariaDB**, **Oracle** and **Microsoft SQL Server**.

For testing, you can setup `JaversSqlRepository` as follows:

```java
import org.javers.repository.sql.JaversSqlRepository;
import java.sql.Connection;
import java.sql.DriverManager;
... //

final Connection dbConnection = DriverManager.getConnection("jdbc:h2:mem:test");

ConnectionProvider connectionProvider = new ConnectionProvider() {
    @Override
    public Connection getConnection() {
        //suitable only for testing!
        return dbConnection;
    }
};

JaversSqlRepository sqlRepository = SqlRepositoryBuilder
        .sqlRepository()
        .withSchema("my_schema") //optionally, provide the schame name
        .withConnectionProvider(connectionProvider)
        .withDialect(DialectName.H2).build();
Javers javers = JaversBuilder.javers().registerJaversRepository(sqlRepository).build();
```

To setup JaversSqlRepository you need to provide three things: an SQL dialect name,
a `ConnectionProvider` implementation and a JDBC driver on your classpath.

In the following table, there is a summary of all supported SQL databases with corresponding
dialect names.

You should provide a proper JDBC driver version on your classpath, which works bests for you
(these versions are only a suggestion, we use them in JaVers integration tests)
.
Probably it would be the same version which you already use for your application’s database.

**Open source databases**

<div style="overflow:auto;">
<table class="table" width="100%" style='word-wrap: break-word; font-family: monospace;'>
<tr>
    <th>Database name</th>
    <th>DialectName</th>
    <th>JDBC driver</th>
</tr>
<tr>
    <td>PostgreSQL</td>
    <td>POSTGRES</td>
    <td><a href="https://search.maven.org/artifact/org.postgresql/postgresql/42.2.5/jar">
        org.postgresql:postgresql:42.2.5</a></td>
</tr>
<tr>
    <td>MariaDB</td>
    <td>MYSQL</td>
    <td><a href="https://search.maven.org/artifact/org.mariadb.jdbc/mariadb-java-client/2.2.3/jar">
        org.mariadb.jdbc:mariadb-java-client:2.2.3</a></td>
</tr>
<tr>
    <td>H2</td>
    <td>H2</td>
    <td><a href="https://search.maven.org/artifact/com.h2database/h2/1.4.197/jar">
        com.h2database:h2:1.4.187</a></td>
</tr>
<tr>
    <td>Oracle</td>
    <td>ORACLE</td>
    <td>commercial</td>
</tr>
<tr>
    <td>MySQL</td>
    <td>MYSQL</td>
    <td><a href="https://search.maven.org/artifact/mysql/mysql-connector-java/8.0.15/jar">
            mysql:mysql-connector-java:8.0.15</a></td>
    <td></td>
</tr>
<tr>
    <td>Microsoft SQL Server</td>
    <td>MSSQL</td>
    <td>commercial</td>
</tr>
</table>
</div>

<h3 id="connection-provider">ConnectionProvider</h3>
ConnectionProvider serves as the source of live JDBC connections for your JaversSQLRepository.
JaversSqlRepository works in *passive* mode, which means:

- JaVers doesn’t create JDBC connections on its own and uses connections provided by an application
  (via `ConnectionProvider.getConnection()`).
- JaVers philosophy is to use application’s transactions
  and never to call SQL `commit` or `rollback` commands on its own.

Thanks to this approach, data managed by an application (domain objects) and data managed by JaVers (object snapshots)
can be saved to SQL database in one transaction.

If you’re using a **transaction manager**, implement a ConnectionProvider to integrate with it.
For Spring users, we have out-of-the-box implementation: `JpaHibernateConnectionProvider` from `javers-spring` module.
Choose this, if you’re using Spring/JPA/Hibernate stack (see [JPA EntityManager integration](/documentation/spring-integration/#jpa-entity-manager-integration)).

If you’re not using any kind of transaction manager, implement a ConnectionProvider to return
the current connection (thread-safely).

<h3>Schema</h3>
JaVers creates four tables in SQL database:

- `jv_global_id` — domain object identifiers,
- `jv_commit` — JaVers commits metadata,
- `jv_commit_property` — commit properties,
- `jv_snapshot` — domain object snapshots.

JaVers has a basic schema-create implementation.
If a table is missing, JaVers simply creates it, together with a sequence and indexes.
There’s no schema-update, so if you drop a column, index or sequence, it wouldn’t be recreated automatically.

<h2 id="custom-json-serialization">Custom JSON serialization</h2>
JaVers is meant to support various persistence stores (MongoDB, SQL)
for any kind of your data. Hence, we use JSON format to serialize your objects in a JaversRepository.

JaVers uses the [Gson](http://sites.google.com/site/gson/) library which provides neat
and pretty JSON representation for well known Java types.
But sometimes Gson’s defaults isn’t what you like.
That happens many times when dealing with `Values` like Date, Money or ObjectId.

Consider the [`org.bson.types.ObjectId`](http://api.mongodb.org/java/2.0/org/bson/types/ObjectId.html) class,
often used as Id-property for objects persisted in MongoDB.

By default, Gson serializes ObjectId as follows:

```json
  "id": {
      "_time": 1417358422,
      "_machine": 1904935013,
      "_inc": 1615625682,
      "_new": true
  }
```

As you can see, `ObjectId` is serialized using its 4 internal fields.
The resulting JSON is verbose and ugly. You would rather expect neat and atomic value like this:

```json
  "id": "54789e5cfb2ca07e65130e7c"
```

That’s where custom JSON `TypeAdapters` come into play.

<h3 id="json-type-adapters">JSON TypeAdapters</h3>
JSON TypeAdapters allows customizing JSON serialization of your Value types.

JaVers supports two families of TypeAdapters.

1. **JaVers family**, specified by the
   [`JsonTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/JsonTypeAdapter.java) interface.
   It’s a thin abstraction over Gson native type adapters.
   We recommend using this family in most cases
   as it has a nice API and isolates you (to some extent) from low level Gson API.
   - [`BasicStringTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/BasicStringTypeAdapter.java)
     is a convenient scaffolding implementation of the JsonTypeAdapter interface.
     Extend it if you want to represent your Value type as atomic String
     (and when you don’t want to deal with JSON API).
   - Implement the [`JsonTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/JsonTypeAdapter.java) interface
     if you need full control over the JSON conversion process.
     Register your adapters using
     [`JaversBuilder.registerValueTypeAdapter(...)`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java).
1. **Gson family**, useful when you’re already using Gson and have adapters implementing the
   [com.google.gson.TypeAdapter](https://github.com/google/gson/blob/master/gson/src/main/java/com/google/gson/TypeAdapter.java) interface.
   Register your adapters with
   [`JaversBuilder.registerValueGsonTypeAdapter(...)`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java).

<h3 id="json-type-adapter-example">JSON TypeAdapter example</h3>

Consider the following domain Entity:

```java
package org.javers.core.cases.morphia;

import org.bson.types.ObjectId;
... // omitted

@Entity
public class MongoStoredEntity {
    @Id
    private ObjectId _id;

    private String name;
    ... // omitted
}
```

First, we need to implement the [`JsonTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/JsonTypeAdapter.java) interface.
In this case, we recommend extending the
[`BasicStringTypeAdapter`]({{ site.github_core_main_url }}org/javers/core/json/BasicStringTypeAdapter.java)
abstract class.

[`ObjectIdTypeAdapter.java`]({{ site.github_core_test_java_url }}org/javers/core/examples/ObjectIdTypeAdapter.java):

```java
package org.javers.core.examples.adapter;

import org.bson.types.ObjectId;
import org.javers.core.json.BasicStringTypeAdapter;

public class ObjectIdTypeAdapter extends BasicStringTypeAdapter {

    @Override
    public String serialize(Object sourceValue) {
        return sourceValue.toString();
    }

    @Override
    public Object deserialize(String serializedValue) {
        return new ObjectId(serializedValue);
    }

    @Override
    public Class getValueType() {
        return ObjectId.class;
    }
}
```

Then, our TypeAdapter should be registered in
[`JaversBuilder`]({{ site.github_core_main_url }}org/javers/core/JaversBuilder.java), and that’s it.

See how it works in the test case &mdash; [`JsonTypeAdapterExample.java`]({{ site.github_core_test_java_url }}org/javers/core/examples/JsonTypeAdapterExample.java):

```java
@Test
public void shouldSerializeValueToJsonWithTypeAdapter() {
    //given
    Javers javers = JaversBuilder.javers()
    .registerValueTypeAdapter(new ObjectIdTypeAdapter())
    .build();

    //when
    ObjectId id = ObjectId.get();
    MongoStoredEntity entity = new MongoStoredEntity(id, "alg1", "1.0", "name");
    javers.commit("author", entity);
    CdoSnapshot snapshot = javers.getLatestSnapshot(id, MongoStoredEntity.class).get();

    //then
    String json = javers.getJsonConverter().toJson(snapshot);
    Assertions.assertThat(json).contains(id.toString());

    System.out.println(json);
}
```

The output:

<pre>
{
  "commitMetadata": {
    "author": "author",
    "properties": [],
    "commitDate": "2021-03-12T15:50:17.663813",
    "commitDateInstant": "2021-03-12T14:50:17.663813Z",
    "id": 1.00
  },
  "globalId": {
    "entity": "org.javers.core.cases.MongoStoredEntity",
    "cdoId": <span class='s2'>"54876f694b9d4135b0b179ec"</span>
  },
  "state": {
    "_algorithm": "alg1",
    "_name": "name",
    "_id": <span class='s2'>"54876f694b9d4135b0b179ec"</span>,
    "_version": "1.0"
  },
  "changedProperties": [
    "_algorithm",
    "_name",
    "_id",
    "_version"
  ],
  "type": "INITIAL",
  "version": 1
}
</pre>
