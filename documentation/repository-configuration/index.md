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
Currently, JaVers supports the following databases: **MongoDB**, **H2**, **PostgreSQL**, **MySQL**,
**Oracle** and **Microsoft SQL Server**.

<h2 id="mongodb-configuration">MongoDB</h2>
**Dependency**<br/>
If you’re using MongoDB, choose `MongoRepository`.

Add `javers-persistence-mongo` module to your classpath:

```groovy
compile 'org.javers:javers-persistence-mongo:{{site.javers_current_version}}'
```

Check
[Maven Central](https://search.maven.org/#artifactdetails|org.javers|javers-persistence-mongo|{{site.javers_current_version}}|jar)
for other build tools snippets.

**Usage**<br/>
The idea of configuring MongoRepository is simple,
just provide a working Mongo client.

```java
import org.javers.repository.mongo.MongoRepository;
import com.mongodb.MongoClient
import com.mongodb.client.MongoDatabase

... //

//preferably, use the same database connection
//as you are using for your primary database
MongoDatabase mongoDb = new MongoClient( "localhost" ).getDatabase("test");

MongoRepository mongoRepo = new MongoRepository(mongoDb);
Javers javers = JaversBuilder.javers().registerJaversRepository(mongoRepo).build();
```

Here’s the [Spring Config example](/documentation/spring-integration/#auto-audit-example) for MongoRepository.

**Schema**<br/>
JaVers creates two collections in MongoDB:

* `jv_head_id` — one document with the last CommitId,
* `jv_snapshots` — domain object snapshots. Each document contains snapshot data and commit metadata.

JaVers uses MongoDB Java Driver v 3.0 so which is compatible with MongoDB versions: 2.4, 2.6 and 3.0. 

<h2 id="sql-databases">SQL databases</h2>
**Dependency**<br/>
Add `javers-persistence-sql` module to your classpath:

```groovy
compile 'org.javers:javers-persistence-sql:{{site.javers_current_version}}'
```
Check
[Maven Central](https://search.maven.org/#artifactdetails|org.javers|javers-persistence-sql|{{site.javers_current_version}}|jar)
for other build tools snippets.

<h3>Overview</h3>

JaVers is meant to be as lightweight and versatile as possible.
That’s why we use [PolyJDBC](http://polyjdbc.org/), which
is an abstraction layer over various SQL dialects.

PolyJDBC supports the following databases: **H2**, **PostgreSQL**, **MySQL** **Oracle** and **Microsoft SQL Server**.

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

In the following table, there is a summary of all supported SQL databases,
dialect names and JDBC driver versions.

These versions are only a suggestion, we use them in JaVers integration tests. 
You should provide a proper JDBC driver version on your classpath, which works bests for you.
Probably it would be the same version
which you already use for your main database. 

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
    <td><a href="https://search.maven.org/#artifactdetails|org.postgresql|postgresql|9.4-1201-jdbc41|jar">
        org.postgresql:postgresql:9.4-1201-jdbc41</a></td>
</tr>
<tr>
    <td>MySQL</td>
    <td>MYSQL</td>
    <td><a href="https://search.maven.org/#artifactdetails|mysql|mysql-connector-java|5.1.36|jar">
        mysql:mysql-connector-java:5.1.36</a></td>
</tr>
<tr>
    <td>H2</td>
    <td>H2</td>
    <td><a href="https://search.maven.org/#artifactdetails|com.h2database|h2|1.4.187|jar">
        com.h2database:h2:1.4.187</a></td>
</tr>
<tr>
    <td>Oracle</td>
    <td>ORACLE</td>
    <td>ojdbc6.jar, xdb6.jar</td>
</tr>
<tr>
    <td>Microsoft SQL Server</td>
    <td>MSSQL</td>
    <td>sqljdbc4.jar</td>
</tr>
</table>
</div>

<h3 id="connection-provider">ConnectionProvider</h3>
ConnectionProvider serves as the source of live JDBC connections for your JaversSQLRepository.
JaversSqlRepository works in *passive* mode, which means:

* JaVers doesn’t create JDBC connections on its own and uses connections provided by an application
  (via `ConnectionProvider.getConnection()`).
* JaVers philosophy is to use application’s transactions
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

*  `jv_global_id` — domain object identifiers,
*  `jv_commit` — JaVers commits metadata,
*  `jv_commit_property` — commit properties,
*  `jv_snapshot` — domain object snapshots.

JaVers has a basic schema-create implementation.
If a table is missing, JaVers simply creates it, together with a sequence and indexes.
There’s no schema-update, so if you drop a column, index or sequence, it wouldn’t be recreated automatically.

<h2 id="custom-json-serialization">Custom JSON serialization</h2>
JaVers is meant to support various persistence stores for
any kind of client’s data. Hence we use JSON format to serialize client’s domain objects.

JaVers uses the [Gson](http://sites.google.com/site/gson/) library which provides neat
and pretty JSON representation for well known Java types.

But sometimes Gson’s default JSON representation isn’t what you like.
This happens when dealing with `Values` like Date, Money or ObjectId.

Consider the [`org.bson.types.ObjectId`](http://api.mongodb.org/java/2.0/org/bson/types/ObjectId.html) class,
often used as Id-property for objects persisted in MongoDB.

By default, JaVers serializes ObjectId as follows:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    "cdoId": <span class='s2'>{
      "_time": 1417358422,
      "_machine": 1904935013,
      "_inc": 1615625682,
      "_new": true
    }</span>
  }
</pre>

As you can see, ObjectId is serialized using its 4 internal fields.
The resulting JSON is verbose and ugly. You would rather expect neat and atomic value like this:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    "cdoId": <span class='s2'>"54789e5cfb2ca07e65130e7c"</span>
    },
</pre>

That’s where custom JSON `TypeAdapters` come into play.

<h2 id="json-type-adapters">JSON TypeAdapters</h2>
You can easily customize JaVers serialization/deserialization behavior
by providing TypeAdapters for your `Value` types.  <br/>
See [TypeAdapter example](/documentation/repository-examples#json-type-adapter) for ObjectId.

JaVers supports two families of TypeAdapters.

1. **JaVers family**, specified by the [JsonTypeAdapter]({{ site.javadoc_url }}index.html?org/javers/core/json/JsonTypeAdapter.html) interface.
   It’s a thin abstraction over Gson native type adapters.
   We recommend using this family in most cases
   as it has a nice API and isolates you (to some extent) from low level Gson API.
   * [BasicStringTypeAdapter]({{ site.javadoc_url }}index.html?org/javers/core/json/BasicStringTypeAdapter.html)
     is a convenient scaffolding implementation of the JsonTypeAdapter interface.
     Extend it if you want to represent your Value type as atomic String
     (and when you don’t want to deal with JSON API).
   * Implement the `JsonTypeAdapter` interface
     if you need full control over the JSON conversion process.
     Register your adapters with
     [`JaversBuilder.registerValueTypeAdapter(JsonTypeAdapter)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueTypeAdapter-org.javers.core.json.JsonTypeAdapter-).
1. **Gson family**, useful when you’re already using Gson and have adapters implementing the
    [com.google.gson.TypeAdapter](https://google-gson.googlecode.com/svn/trunk/gson/docs/javadocs/com/google/gson/TypeAdapter.html) interface.
     Register your adapters with
     [`JaversBuilder.registerValueGsonTypeAdapter(Class, TypeAdapter)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueGsonTypeAdapter-java.lang.Class-com.google.gson.TypeAdapter-).

JaVers provides JsonTypeAdapters for some well-known Values like
`org.joda.time.LocalDate`.