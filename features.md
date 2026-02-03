---
layout: page
title: Features Overview
category: Documentation
submenu: features
sidebar-url: features-sidebar.html
---

**The Complete Solution for Data Auditing and Compliance**
<br/>
In today’s data-driven world, data audit is more important than ever.
Businesses need to know exactly what changed in their data,
when the change occurred, and who made it. JaVers makes auditing your
data effortless — tracking every change at the object level,
whether you use **SQL** or **NoSQL** databases.

Data audit is especially critical in **regulated industries** like finance,
healthcare, and legal sectors, where **compliance and accountability**
aren’t optional—they’re essential. JaVers helps you maintain a clear,
reliable history of your data, so you can make confident decisions,
satisfy audits, and stay compliant.

JaVers **Data Audit** is built on top of the **Object Diff** engine,
which could be used as a standalone object diff tool for ad-hoc
comparison of two object graphs.

All JaVers functions are exposed via a single Facade, the
[Javers]({{ site.github_core_main_url }}org/javers/core/Javers.java) instance.
As you can see, JaVers API is concise and simple.

The main features of JaVers are described below.

<h2 id="object-diff">Object diff</h2>

JaVers provides a powerful object-diffing engine that identifies deep changes between two object graphs with zero configuration.

* **DDD-Powered Domain Mapping:**
  Align the diff engine with your Core Domain by categorizing classes as Entities (identity-based), Value Objects (state-based), or Values.
* **Recursive Deep Comparison:**
  JaVers performs a deep-scan of nested object graphs, collections, and arrays, identifying changes in complex structures. JaVers handles circular references and bidirectional relationships within the graph.
* **Zero-Config Introspection:**
  Works out of the box with standard POJOs, Maps, and Lists using smart defaults to understand your data model. JaVers automatically interprets JPA annotations to infer your domain mapping, requiring no extra setup for existing Hibernate or JPA projects.
* **Rich Diff API:**
  Provides a powerful `Diff` object to group changes by object, filter by change type, or generate human-readable summaries via the `prettyPrint()` method.
* **Customizable Comparison Logic**: JaVers allows you to override equality for specific types using Cusom Comparators, and select specific List Comparing Algorithms (like Levenshtein or Simple) to match your collection's specific semantics.

See the documentation for
[Domain Configuration](/documentation/domain-configuration) and
[Diff Configuration](/documentation/diff-configuration).

<h2 id="data-audit">Data Audit</h2>

JaVers Data Audit lets you track every change to your domain objects. Using `javers.commit()`, you capture updates to object
fields and relationships. JaVers stores these updates as immutable Snapshots
in dedicated tables or collections within your application database.
This gives you full access to historical data for auditing, debugging, and compliance

<h3 id="database-Independent-Audit-Model">Database-Independent Audit Model</h3>

JaVers offers a database-agnostic approach to data auditing
based on the [`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java) abstraction.

*   **Supported Databases:** JaVers supports MongoDB and the following SQL databases: Oracle, PostgreSQL, Microsoft SQL Server, MySQL/MariaDB, and H2. 
*   **JSON-Based Snapshots:** Unlike table-oriented tools (like Envers), JaVers uses an **object-oriented approach** and stores object Snapshots as JSON documents in a unified structure.
*   **Decoupled Persistence:** Because it relies on JSON serialization, audit data is decoupled from live data [7]. This allows you to store audit logs in a different database than the application data if desired (e.g., application in SQL, JaVers in MongoDB).
*   **Custom JSON serialization:** JaVers has a well-designed and customizable JSON serialization and deserialization module, based on
      [`GSON`](https://code.google.com/p/google-gson/) and Java reflection, see [custom JSON serialization](/documentation/repository-configuration#custom-json-serialization).

See the documentation for
[Repository Configuration](/documentation/repository-configuration).

<h3 id="Advanced-Domain-Modeling">Advanced Domain Modeling</h3>

* **Domain Model Mapping:** JaVers identifies objects based on Domain-Driven Design (DDD) principles, distinguishing between **Entities** (with unique IDs) and **Value Objects** (identified by their path from a parent entity).
* **Flexible Mapping Configuration**: JaVers provides multiple ways to configure how domain objects are audited (mapped to Snapshots) and compared. You can use annotations, fluent API configuration, or default conventions to fine-tune auditing behavior without modifying your persistence model.
* **Selective Property Auditing**: With mapping annotations such as `@DiffIgnore` and `@ShallowReference`, you can precisely control which fields are audited and how object references are handled.
  This allows you to focus the audit on important business changes while ignoring technical data noise.
* **Type Name Customization**: By default, JaVers identifies types using their fully qualified Java class names. For better stability and alignment with your domain’s ubiquitous language, you can explicitly define type names using the `@TypeName` annotation. This decouples audit data from class and package names, enabling safe refactoring without breaking historical data.

See [Domain Configuration](/documentation/domain-configuration) documentation.

<h3 id="jql">JaVers Query Language (JQL)</h3>

With JaVers, you can easily browse the change history
of your domain objects, seeing when a change occurred,
who made it, and the values before and after.

*   **Powerful Filtering:** JaVers provides its own query language (JQL) to browse data history.
*   **Three View Modes:** Results can be retrieved as **Snapshots** (dehydrated data), **Changes** (atomic differences),
*   or **Shadows** (historical objects restored to their domain state).
*   **Shadow Scopes:** When querying historical data, JaVers can reconstruct object graphs using different scopes: **Shallow**, **Child-value-object**, **Commit-deep**, and **Deep+**.
*   **Rich Filters:** Developers can filter history by instance ID, class, property, commit author, or specific dates.

See the [JaVers Query Language](/documentation/jql-examples) documentation.

<h3 id="spring-integration">Spring and Spring Boot Integration</h3>

*   **Spring Boot Starters**: JaVers offers Spring Boot starters for SQL and MongoDB with sensible default configurations. These starters let you integrate JaVers into your Spring Data applications with minimal manual setup.
*   **Auto-Audit Aspects**: For Spring Data repositories, you can enable full data auditing with a single annotation: `@JaversSpringDataAuditable`. JaVers will then automatically track changes to objects whenever they are created, updated, or deleted. For non–Spring Data repositories, you can use the method-level `@JaversAuditable` annotation to capture changes automatically.
*   **Transaction Management**: It integrates with Spring's transaction management, ensuring that audit logs are committed or rolled back alongside application data.

See the [Spring Integration](/documentation/spring-integration)
and [Spring Boot Integration](/documentation/spring-boot-integration) documentation.

<h2 id="How-to-use-JaVers">How to use JaVers</h2>

<h3 id="How-to-use-JaVers-Object-Diff">How to use Object Diff</h3>

* Create a JaVers instance (see [getting started](/documentation/getting-started#create-javers-instance)) and
  use [`javers.compare()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  to compare two object graphs.

* As the result, you get list of atomic [`Changes`]({{ site.github_core_main_url }}org/javers/core/diff/Change.java).
  There are several types of Changes:
  [`ValueChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ValueChange.java),
  [`ReferenceChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/ReferenceChange.java),
  [`ListChange`]({{ site.github_core_main_url }}org/javers/core/diff/changetype/container/ListChange.java) and so on (see the inheritance hierarchy of
  [`Change`]({{ site.github_core_main_url }}org/javers/core/diff/Change.java)
  class to get the complete list).

* See the [Diff Examples](/documentation/diff-examples).

<h3 id="How-to-use-JaVers-Data-Audit">How to use Data Audit</h3>

* Configure and build a
  JaVers instance (see [configuration](/documentation/domain-configuration)).

* Integrate JaVers with your system by applying
  the [`javers.commit()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  function in every place where
  important data (domain objects) are being created and modified.

* You don’t need to commit every object. JaVers navigates through the object graph, starting from
  the object passed to
  [`javers.commit()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  and deeply compares the whole structure with the previous version stored in JaversRepository.
  Thanks to this approach, you can commit large structures, like trees, graphs and DDD aggregates with a single
  `commit()` call.

* If you are using Spring Data, annotate your Repositories with
  [`@JaversSpringDataAuditable`]({{ site.github_spring_main_url }}org/javers/spring/annotation/JaversSpringDataAuditable.java)
  and take advantage of the [auto-audit aspect](/documentation/spring-integration#auto-audit-aspect).

* Once your domain objects are being managed by JaVers, you can query
  [`JaversRepository`]({{ site.github_core_main_url }}org/javers/repository/api/JaversRepository.java) using powerful [JQL](/documentation/jql-examples) &mdash; JaVers Query Language.
  
* JaVers provides [three views](/documentation/jql-examples/#data-history-views) on objects history:
  [Changes](/documentation/jql-examples/#query-for-changes),
  [Shadows](/documentation/jql-examples/#query-for-shadows) and 
  [Snapshots](/documentation/jql-examples/#query-for-snapshots). 
  Use [`javers.find*()`]({{ site.github_core_main_url }}org/javers/core/Javers.java)
  methods to browse detailed history of a given class, object or property.

See the [Repository Examples](/documentation/repository-examples).

