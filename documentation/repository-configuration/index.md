---
layout: docs
title: JaVers Documentation — JaVers Repository Configuration
submenu: repository-configuration
---

# JaVers Repository Configuration

If you are going to use JaVers as a data audit framework you are supposed to configure `JaversRepository`.

The purpose of JaversRepository is to store JaVers commits in your database,
alongside your domain data. JSON format is used for serializing your data.
This approach significantly simplifies JaversRepository construction.
The hardest work — mapping domain object to persistent format (JSON)
is done by javers-core.
This common JSON format is used by many JaversRepository implementations.

In runtime, JaVers commit holds a list of domain object snapshots and a list of changes (a diff).
Only snapshots are persisted in a database.
When commit is being read from a database, snapshots are deserialized from JSON
and diff is re-calculated by comparing snapshot pairs.

JaVers comes by default with in-memory repository implementation. It’s perfect for testing but
for production environment you will need something real.

<h2 id="choose-javers-repository">Choose JaversRepository</h2>

First, choose proper JaversRepository implementation.
Currently, JaVers supports **MongoDB**.
Support for SQL databases, is scheduled for release with JaVers 1.1.

If you are using MongoDB, choose `org.javers.repository.mongo.MongoRepository`.
The idea of configuring MongoRepository is simple,
just provide a working database client.

```java
Db database = ... //autowired or configured here,
                  //preferably, use the same database connection
                  //as you are using for your primary database
MongoRepository mongoRepo =  new MongoRepository(database)
JaversBuilder.javers().registerJaversRepository(mongoRepo).build()
```

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
by providing TypeAdapters for your `Value` types.

JaVers supports two families of TypeAdapters.


1. **JaVers family**, specified by the [JsonTypeAdapter]({{ site.javadoc_url }}index.html?org/javers/core/json/JsonTypeAdapter.html) interface.
   It’s a thin abstraction over Gson native type adapters.
   We recommend using this family in most cases
   as it has a nice API and isolates you (to some extent) from low level Gson API.
   * Implement the `JsonTypeAdapter` interface
     if you need full control over the JSON conversion process.
     Register your adapters with
     [`JaversBuilder.registerValueTypeAdapter(JsonTypeAdapter)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueTypeAdapter-org.javers.core.json.JsonTypeAdapter-).
   * [`BasicStringTypeAdapter`]({{ site.javadoc_url }}index.html?org/javers/core/json/BasicStringTypeAdapter.html)
     is a convenient scaffolding implementation of the JsonTypeAdapter interface.
     Extend it if you want to represent your Value type as atomic String
     (and when you don’t want to deal with JSON API).
     See [TypeAdapter example](/documentation/repository-examples#json-type-adapter) for ObjectId.
1. **Gson family**, useful when you’re already using Gson and have adapters implementing the
    [com.google.gson.TypeAdapter](https://google-gson.googlecode.com/svn/trunk/gson/docs/javadocs/com/google/gson/TypeAdapter.html) interface.
     Register your adapters with
     [`JaversBuilder.registerValueGsonTypeAdapter(Class, TypeAdapter)`]({{ site.javadoc_url }}org/javers/core/JaversBuilder.html#registerValueGsonTypeAdapter-java.lang.Class-com.google.gson.TypeAdapter-).

JaVers provides JsonTypeAdapters for some well-known Values like
`org.joda.time.LocalDate`.