---
layout: page
category: Blog
§title: JaVers vs Envers Comparision
author: Bartosz Walacik
authorTwitter: BartoszWalacik
submenu: blog
---

In the Java world, there are two tools for data auditing: [Envers](http://hibernate.org/orm/envers/)
and [JaVers](https://javers.org).
Envers is here for a long time and it’s considered mainstream.
JaVers offers the fresh approach and technology independence.
If you consider which tool will be better for your project, this article is the good starting point.

The article has three sections. First, is a high-level comparison.
In the second section, we show the simple, demo application for managing organization structure with 
data audit made by both JaVers and Envers.
In the third section, we show how both tools are coping with queries on audit data.

<center>
<img src="/blog/javers-vs-envers/competition.png" alt="competition" style="margin:10px;"/>
</center>

#### ToC

* [High-level comparison](#high-level-comparison)
* [Demo application](#demo-application)
  * [Database configuration](#database-configuration) 
  * [Enabling Envers audit](#enabling-envers-audit)
  * [Enabling JaVers audit](#enabling-javers-audit)
* [Querying contest](#querying-contest)   
  * [Browsing objects history by type](#browsing-objects-history-by-type)
    * [Envers way](#envers-way-1)
    * [JaVers way](#javers-way-1)
    * [Comparision](#comparision-1)
  * [Query filters](#query-filters)  
    * [Envers way](#envers-way-query-filters)
    * [JaVers way](#javers-way-query-filters)
    * [Comparision](#comparision-query-filters)
  * [More query filters](#more-query-filters)  
  * [Reconstructing a full object graphs](#reconstructing-full-object-graphs) 
    * [Envers way](#envers-way-graphs)
    * [JaVers way](#javers-way-graphs)
    * [Comparision](#comparision-graphs) 
  * [Other query types](#other-query-types)    
* [Final thoughts](#final-thoughts)   

## High-level comparison

There are two big differences between JaVers and Envers:

1. **Envers** is the Hibernate plugin.
   It has good integration with Hibernate but you can use it only with traditional SQL databases.
   If you chose NoSQL database or SQL but with other persistence framework like 
   [JOOQ](https://www.jooq.org/) &mdash; Envers is not an option.
   
   On the contrary, **JaVers** can be used with any kind of database and any kind of 
   persistence framework. For now, JaVers comes with repository implementations for MongoDB and
   popular SQL databases. Other databases (like Cassandra, Elastic) might be added in the future.
   
1. **Envers’ audit model is table-oriented**.
   You can think about Envers as the tool for versioning database records.  
   As the doc says:
   *For each audited entity, an audit table is created.
   By default, the audit table name is created by adding a `_AUD` suffix to the original name.*
   It can be advantage, you have audit data stored close to your live data.
   Envers’ tables look familiar. It’s easy to query them with SQL.
     
   **JaVers’ audit model is object-oriented**, it’s all about objects’ Snapshots.
   JaVers saves them to the single table (or the collection in Mongo)
   as JSON documents with unified structure.
   Advantages? You can focus on domain objects and treat persistence and auditing
   as infrastructural aspects.
   Since audit data are decoupled from live data, you can choose where to store them.
   By default JaVers saves Snapshots to the application’s database, but you can point another one.
   For example, SQL for application and MongoDB for JaVers
   (or even centralized JaVers database shared for all applications in your company).
   
## Demo application  
 
Our demo project is the simple Groovy application based on Spring Boot.
Clone it from [https://github.com/javers/javers-vs-envers](https://github.com/javers/javers-vs-envers).
        
Let’s start from the domain model. 
There are only two classes: Employee and Address. Employees are organized in tree structures.

##### [`Employee.groovy`](https://github.com/javers/javers-vs-envers/blob/master/src/main/groovy/org/javers/organization/structure/domain/Employee.groovy)

```groovy
@Entity
class Employee {
    @Id
    String name

    @ManyToOne
    Employee boss

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "boss")
    Set<Employee> subordinates = new HashSet()

    @Embedded
    Address address

    Integer salary
    
    Position position

    Employee() {
    }
    
    ...
}
```

##### [`Address.groovy`](https://github.com/javers/javers-vs-envers/blob/master/src/main/groovy/org/javers/organization/structure/domain/Address.groovy)

```groovy
@Embeddable
class Address {
    @Column(name = "address_city")
    String city

    @Column(name = "address_street")
    String street

    Address() {
    }

    Address(String city) {
        this.city = city
    }
}
```

### Database configuration

The application is configured to work with a local PostgreSQL.
You can change it easily (don’t forget about a proper JDBC driver).

##### [`application.properties`](https://github.com/javers/javers-vs-envers/blob/master/src/main/resources/application.properties)

```
spring.datasource.url=jdbc:postgresql://localhost:5432/javers-vs-envers
```

##### [`build.gradle`](https://github.com/javers/javers-vs-envers/blob/master/build.gradle)

```
compile 'postgresql:postgresql:9.1-901-1.jdbc4'
```

To run the application and populate the database, execute the 
[`InitHierarchyTest.groovy`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/InitHierarchyTest.groovy):

```groovy
def "should init and persist organization structure"(){
  given:
  def boss = hierarchyService.initStructure()

  boss.prettyPrint()

  expect:
  boss.name == "Gandalf"
}
```

You can run it from command line:

```
./gradlew test -Dtest.single=InitHierarchyTest
```

Now you should have the `Employee` table populated with initial data. 

##### `select * from Employee`

<img src="/blog/javers-vs-envers/employee-table.png" alt="Employee table" width="646px"/>

### Enabling Envers audit

To enable Envers we need to add the `hibernate-envers` dependency:

```
compile 'org.hibernate:hibernate-envers:'+hibernateVersion
```

and `@Audited` annotation to our entity:

```groovy
import org.hibernate.envers.Audited

@Entity
@Audited
class Employee {
    ...
}
```

That’s it. Now, we can do some audited changes:


##### [`SimpleChangeTest.groovy`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/SimpleChangeTest.groovy)

```groovy
def "should persist Employee's property change"(){
    given:
    def boss = hierarchyService.initStructure()

    hierarchyService.giveRaise(boss, 200)

    expect:
    hierarchyService.findByName("Gandalf").salary == 10200
}
```
 
Envers creates two tables: `revinfo` and `employee_aud`.

##### `select * from revinfo`

<img src="/blog/javers-vs-envers/revinfo_1.png" alt="revinfo table" width="213px"/>

##### `select * from employee_aud`

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/employee_aud.png" alt="employee_aud table" width="807px"/>

No surprise so far. We have two revisions likned with records in the audit table.
Revtype 0 means insert and 1 means update.
What is strange is the type of revision timestamps.
Why long instead of date? Luckily you can fix using custom [Revision Entity](http://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#envers-revisionlog).
Also, Revision Entity is the place when you can hook changes metadata like change author.

### Enabling JaVers audit

To enable JaVers we need to add the dependency to JaVers Spring Boot starter for SQL:

```
compile 'org.javers:javers-spring-boot-starter-sql:'+javersVersion
```

The easiest way to integrate JaVers with a Spring application is the  
`@JaversSpringDataAuditable` annotation added to Spring Data CRUD repositories.
This annotation enables the [auto-audit aspect](/documentation/spring-integration/#auto-audit-aspect).

##### [`EmployeeRepository.groovy`](https://github.com/javers/javers-vs-envers/blob/master/src/main/groovy/org/javers/organization/structure/EmployeeRepository.groovy)

```groovy
import org.javers.spring.annotation.JaversSpringDataAuditable
import org.springframework.data.repository.CrudRepository

@JaversSpringDataAuditable
interface EmployeeRepository extends CrudRepository<Employee, String> {
}
```

That’s all. Now, when you rerun the `SimpleChangeTest`,
JaVers will create three tables: 

* `jv_commit`,
* `jv_global_id`,
* `jv_snapshot`

(there is also the fourth table &mdash; `jv_commit_property`, but our application doesn’t touch it).

JaVers’ Commit is the similar concept to Envers’ Revision 
(inspirations from Git and Subversion are evident). 

In JaVers, each Commit has timestamp and author.
Here, author field is unknown, it would be set to current user if you enable Spring Security
(see [AuthorProvider](https://javers.org/documentation/spring-integration/#author-provider-bean))

##### `select * from jv_commit`

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/jv_commit_table.png" alt="jv_commit table" width="457px"/>

Now, let's check out how objects’ Snapshots are stored.

In JaVers, each audited object has GlobalId.
For Entities it’s the pair of type name and local Id.
ValueObjects (like Address) are treated as components of an Entity,
so they are identified by the pair: owning entity GlobalId and a path (typically a property name).  
We have 18 objects so far, hence 18 GlobalIds are stored.

##### `select * from jv_global_id`

<img style="margin-bottom:10px;"
     src="/blog/javers-vs-envers/jv_global_id_table.png" alt="jv_global_id table" width="683px"/>

For each GlobalId, JaVers binds one ore more object’s Snapshots.
We did only one change so far (Gandalf got a rise), so we have 18 *initial* Snapshots
and one *update* Snapshot for Gandalf. Seems right.

##### `select * from jv_snapshot`

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/jv_snapshot_table.png" alt="jv_snapshot table" width="1002px"/>

What distinguish JaVers from Envers is the `state` column, here live Snapshots per se.
It’s the text column with JSON documents.
Thanks to that, JaVers isn’t coupled to any particular kind of database.
As long as a database supports text or JSON types, it’s fine.
In fact, MongoDB is more *natural* to JaVers than SQL,
because MongoDB is designed to store JSON documents.

The Snapshot’s state document is the map where keys are properties’ names and values are,
well, properties’ values (pretty much like in Javascript).
References to other objects are *dehydrated* and stored as GlobalId.

For example, this is the current state of Gandalf: 

```json
{
  "address": {
    "valueObject": "org.javers.organization.structure.Address",
    "ownerId": {
      "entity": "org.javers.organization.structure.Employee",
      "cdoId": "Gandalf"
    },
    "fragment": "address"
  },
  "name": "Gandalf",
  "position": "CEO",
  "salary": 10200,
  "subordinates": [
    {
      "entity": "org.javers.organization.structure.Employee",
      "cdoId": "Elrond"
    },
    {
      "entity": "org.javers.organization.structure.Employee",
      "cdoId": "Aragorn"
    }
  ]
}
```

## Querying contest   

Some applications do data audit only just in case.
For example, in case of an unexpected and intimidating visit of an IT auditor asking you tons of questions.
In this scenario, application don’t need to have any special UI for browsing audit data.
Any developer can connect directly to a database, generate some reports and make auditor happy.

In other applications, data audit is so important that
it becomes one of the features offered to users.
For example, Wikipedia has the [page history view](https://en.wikipedia.org/w/index.php?title=Lego&action=history)
which shows changes made to any page.

We focus on the second case,
our application runs queries on audit data to show history of The Fellowship.

### Browsing objects history by type

Let’s start from the elementary query &mdash; query by type.
We are giving a rise for Gandalf and Aragorn and also we are changing their address.
That means four changes.
Then we show how to browse history of our Employees in Envers and JaVers.

```groovy
  given:
    def gandalf = hierarchyService.initStructure()
    def aragorn = gandalf.getSubordinate('Aragorn')
    gandalf.prettyPrint()

    //changes
    hierarchyService.giveRaise(gandalf, 200)
    hierarchyService.updateCity(gandalf, 'Shire')
    hierarchyService.giveRaise(aragorn, 100)
    hierarchyService.updateCity(aragorn, 'Shire')
```    

<h4 id="envers-way-1">Envers way</h4>

[`EnversQueryTest.groovy#L27`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/EnversQueryTest.groovy#L27)

```groovy
@Transactional
def "should browse Envers history of objects by type"(){
  given:
    ...

  when:
    List folks = AuditReaderFactory
            .get(entityManager)
            .createQuery()
            .forRevisionsOfEntity( Employee, false, true )
            .add(AuditEntity.revisionType().eq(MOD)) // without initial versions
            .getResultList()

    println 'envers history of Employees:'
    folks.each {
        println 'revision:' + it[1].id + ', entity: '+ it[0]
    }

  then:
    folks.size() == 4
}
```

Envers output: 

```text
envers history of Employees:
revision:33, entity: Employee{ Gandalf CEO, $10200, Middle-earth, subordinates:Aragorn,Elrond }
revision:34, entity: Employee{ Gandalf CEO, $10200, Shire, subordinates:Aragorn,Elrond }
revision:35, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates:Thorin }
revision:36, entity: Employee{ Aragorn CTO, $8100, Shire, subordinates:Thorin }
```

<h4 id="javers-way-1">JaVers way</h4>

[`JaversQueryTest.groovy#L23`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/JaversQueryTest.groovy#L23)

```groovy
def "should browse JaVers history of objects by type"(){
  given:
    ...

  when:
    List<Shadow<Employee>> shadows = javers.findShadows(
            QueryBuilder.byClass(Employee)
                        .withSnapshotTypeUpdate()
                        .build())

    println 'javers history of Employees:'
    shadows.each { shadow ->
        println 'commit:' + shadow.commitMetadata.id + ', entity: '+ shadow.get()
    }

  then:
    shadows.size() == 4
    shadows[0].commitMetadata.id.majorId == 5
    shadows[3].commitMetadata.id.majorId == 2
}
```

JaVers output: 

```text
javers history of Employees:
commit:5.0, entity: Employee{ Aragorn CTO, $8100, Shire, subordinates:Thorin }
commit:4.0, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates:Thorin }
commit:3.0, entity: Employee{ Gandalf CEO, $10200, Shire, subordinates:Aragorn,Elrond }
commit:2.0, entity: Employee{ Gandalf CEO, $10200, Middle-earth, subordinates:Aragorn,Elrond }
```

<h4 id="comparision-1">Comparision</h4>

Both tools did the job and shown correct history. Both tools loaded related entities.

What about artistic impression? There are a few interesting differences.

* Envers query results are ordered chronologically.
  The oldest change is first on the list. 
  When browsing history, usually you want to see latest changes first.
  The reverse chronological order is more natural and that’s how JaVers sorts.
  I didn’t find the way in Envers to get reverse ordering.
   
* JaVers query API seems more elegant. In fact it’s a small DSL called [JQL](/documentation/jql-examples/)
  (JaVers Query Language). 

* What is really cryptic in Envers’ query is the results type.
  Why `getResultList()` returns non-parametrized List? List of what? Well, it depends on the second flag
  passed to `forRevisionsOfEntity()` named `selectEntitiesOnly`.
  If it’s true, it will be a list of entites, otherwise
  *a list of three-element arrays, containing: the entity instance, revision entity and type of the revision*. 
  Not cool. In Groovy it’s not a problem but in Java you have to cast heavily to get the data.
  In JaVers, you get the type-safe list of
  [Shadows](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/shadow/Shadow.java).
  In short, Shadow is a pair of a historical entity and commit metadata.  

* Both tools have loaded related entities (subordinates and boss),
  although we didn’t asked for this.
  Envers uses well-known Hibernate lazy loading approach.
  On the contrary, JaVers always loads data eagerly
  on a basis of the [query scope](/documentation/jql-examples/#shadow-scopes).
  Both approaches have pros and cons.
  Lazy loading looks invitingly, you load as much data as you need without bothering about query boundaries.
  Disadvantages? `LazyInitializationException` is the constant threat.
  Moreover, Hibernate dynamic proxies and persistent collections clutter your object graph.
   
### Query filters 
 
Browsing objects history is not very useful without search features.
  
In the next example we show how to implement
the two common search use cases:

1. Search by Id, to show history of a specified Employee. 
1. Search by changed property, to show history of salary changes in the whole organization.

<h4 id="envers-way-query-filters">Envers way</h4>

[`EnversQueryTest.groovy#L57`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/EnversQueryTest.groovy#L57)

```groovy
@Transactional
def "should browse Envers history of objects by type with filters"(){
  given:
    def gandalf = hierarchyService.initStructure()
    def aragorn = gandalf.getSubordinate('Aragorn')
    def thorin = aragorn.getSubordinate('Thorin')

    //changes
    [gandalf, aragorn, thorin].each {
        hierarchyService.giveRaise(it, 100)
        hierarchyService.updateCity(it, 'Shire')
    }

  when: 'query with Id filter'
    List aragorns = AuditReaderFactory
          .get(entityManager)
          .createQuery()
          .forRevisionsOfEntity( Employee, false, true )
          .add(AuditEntity.id().eq( 'Aragorn' ))
          .getResultList()

  then:
    println 'envers history of Aragorn:'
    aragorns.each {
        println 'revision:' + it[1].id + ', entity: '+ it[0]
    }
    aragorns.size() == 3

  when: 'query with Property filter'
  List folks = AuditReaderFactory
          .get(entityManager)
          .createQuery()
          .forRevisionsOfEntity( Employee, false, true )
          .add(AuditEntity.property('salary').hasChanged())
          .add(AuditEntity.revisionType().eq(MOD))
          .getResultList()

  then:
    println 'envers history of salary changes:'
    folks.each {
        println 'revision:' + it[1].id + ', entity: '+ it[0]
    }
    folks.size() == 3
}
```

Our queries didn’t change much. To search by Id we use:

```groovy
.add(AuditEntity.id().eq( 'Aragorn' ))
```

and to search by changed property we added:

```groovy
.add(AuditEntity.property('salary').hasChanged())
```

Looks fine, but what happens when you run this test? Whoops!
The second query throws an exception:

```text
org.hibernate.QueryException: could not resolve property: salary_MOD of: org.javers.organization.structure.Employee_AUD [select e__, r from org.javers.organization.structure.Employee_AUD e__, org.hibernate.envers.DefaultRevisionEntity r where e__.salary_MOD = :_p0 and e__.REVTYPE = :_p1 and e__.originalId.REV.id = r.id order by e__.originalId.REV.id asc]
```

Looks like there is a missing column &mdash;
`salary_MOD` in the `employee_AUD` table. But this table is managed by Envers,
why he can’t find a column in his own table? 

After some digging in the [User Guide](http://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#envers-tracking-properties-changes)
, we can find the answer &mdash; *Modification Flags*.
If we want to query by changed property we need to enable them for our class:

```groovy
@Entity
@Audited( withModifiedFlag=true )
class Employee {
    ...
```

Then, Envers adds the boolean matrix to the `employee_AUD` table:

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/employee-aud-matrix.png" alt="employee_aud table" width="679px"/>

When we see these flags, they become obvious.
Envers uses them to find records with changes on a given property.

Now, the Envers output seems right:

```text
envers history of Aragorn:
revision:6554, entity: Employee{ Aragorn CTO, $8000, Minas Tirith, subordinates:'Thorin' }
revision:6557, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates:'Thorin' }
revision:6558, entity: Employee{ Aragorn CTO, $8100, Shire, subordinates:'Thorin' }

envers history of salary changes:
revision:6555, entity: Employee{ Gandalf CEO, $10100, Middle-earth, subordinates:'Aragorn','Elrond' }
revision:6557, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates:'Thorin' }
revision:6559, entity: Employee{ Thorin TEAM_LEAD, $5100, Lonely Mountain, subordinates:'Bombur','Frodo','Fili','Kili','Bifur' }
```  

On the contrary, JaVers queries works out of the box.

<h4 id="javers-way-query-filters">JaVers way</h4>

[`JaversQueryTest.groovy#L52`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/JaversQueryTest.groovy#L52)

```groovy
def "should browse JaVers history of objects by type with filters"(){
  given:
    def gandalf = hierarchyService.initStructure()
    def aragorn = gandalf.getSubordinate('Aragorn')
    def thorin = aragorn.getSubordinate('Thorin')

    //changes
    [gandalf, aragorn, thorin].each {
        hierarchyService.giveRaise(it, 100)
        hierarchyService.updateCity(it, 'Shire')
    }

  when: 'query with Id filter'
    List<Shadow<Employee>> shadows = javers.findShadows(
            QueryBuilder.byInstanceId('Aragorn', Employee).build())

  then:
    println 'javers history of Aragorn:'
    shadows.each { shadow ->
      println 'commit:' + shadow.commitMetadata.id + ', entity: '+ shadow.get()
    }
    shadows.size() == 3

  when: 'query with Property filter'
    shadows = javers.findShadows(
            QueryBuilder.byClass(Employee)
                        .withChangedProperty('salary')
                        .withSnapshotTypeUpdate()
                        .build())

  then:
    println 'javers history of salary changes:'
    shadows.each { shadow ->
        println 'commit:' + shadow.commitMetadata.id + ', entity: '+ shadow.get()
    }
    shadows.size() == 3
}
```

JaVers output: 

```text
javers history of Aragorn:
commit:5.1, entity: Employee{ Aragorn CTO, $8100, Shire, subordinates: }
commit:4.1, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates: }
commit:1.1, entity: Employee{ Aragorn CTO, $8000, Minas Tirith, subordinates: }
javers history of salary changes:
commit:6.0, entity: Employee{ Thorin TEAM_LEAD, $5100, Lonely Mountain, subordinates: }
commit:4.1, entity: Employee{ Aragorn CTO, $8100, Minas Tirith, subordinates: }
commit:2.1, entity: Employee{ Gandalf CEO, $10100, Middle-earth, subordinates: }
```

<h4 id="comparision-query-filters">Comparision</h4>

Once again both tools did the job and shown correct history.

* **Search by Id**. Just works as expected.

* **Search by changed property**.
Here, at the beginning, Envers thrown an exception and we had to add 
the Modification Flags to the table schema. 
I like the design of these flags for its simplicity.
The problem is that they are disabled by default.  
What if you application is running on production for some time
and you didn’t enabled *the Flags* from the very beginning? Adding them to existing tables could be a pain...
<br/>
I think that JaVers solved this problem in a bit more elegant way.
By default, each Snapshot holds the list of changed property names (in `jv_snapshot.changed_properties`).
JaVers’ Snapshot structure is fixed, no more mucking around flags configuration.

### More query filters

What are the other options for filtering? Envers offers filtering by property value:

```java
query.add(AuditEntity.property("name").eq("John"));
// or
query.add(AuditEntity.relatedId("address").eq(addressId));
```

This is useful. Besides `eq`, you can use many other operators typical to SQL: `ge`, `le`, `like`, `between`, etc.

In JaVers, there are no property value filters, we have the open [issue](https://github.com/javers/javers/issues/556) for that.
On the other hand, JaVers offers a few filters based on Commit metadata.
You can query by Commit author, dates and properties:

```groovy
QueryBuilder.byInstanceId("bob", Employee.class).byAuthor("Pam").build()
// or
QueryBuilder.byInstanceId("bob", Employee.class).withCommitProperty("tenant", "ACME")
// or
QueryBuilder.byInstanceId("bob", Employee.class)
            .from(new LocalDate(2016,01,1))
            .to  (new LocalDate(2018,01,1)).build()
```

See the full list of JaVers’ [query filters](https://javers.org/documentation/jql-examples/#query-filters).
        
### Reconstructing full object graphs

The last task is the hardest part of the competition. 
We want to reconstruct the full object graph for a given point in time.
That means time-aware joins which are tricky.  

In this use case, we load the historical version of one Employee
and we check if related Employees are joined in proper versions.

To make the case harder (and more realistic), we update Employees independently.
What we want from JaVers and Envers is recalling that specific point in time
when all the guys had the same sallary &mdash; $6000.  


```groovy
  given:
    def gandalf = hierarchyService.initStructure()
    def aragorn = gandalf.getSubordinate('Aragorn')
    def thorin = aragorn.getSubordinate('Thorin')
    def bombur = thorin.getSubordinate("Bombur")
    
    [gandalf,aragorn, bombur].each {
      hierarchyService.updateSalary(it, 6000)
    }
    
    hierarchyService.giveRaise(thorin, 1000)
    //this state we want to reconstruct,
    //when all the four guys have salary $6000
    gandalf.prettyPrint()
    
    [gandalf, aragorn, thorin, bombur].each {
      hierarchyService.giveRaise(it, 500)
    }
```

Let’s start the challenge from Envers.

<h4 id="envers-way-graphs">Envers way</h4>

[`EnversQueryTest.groovy#L102`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/EnversQueryTest.groovy#L102)

```groovy
@Transactional
def "should reconstruct a full object graph with Envers"(){
  given:
  ...

  when:
    def start = System.currentTimeMillis()
    List thorins = AuditReaderFactory
          .get(entityManager)
          .createQuery()
          .forRevisionsOfEntity( Employee, false, true )
          .add( AuditEntity.id().eq( 'Thorin' ) )
          .getResultList()

  then:
    def thorinShadow = thorins.collect{it[0]}.find{it.salary == 6000}

    [thorinShadow,
     thorinShadow.getBoss(),
     thorinShadow.getBoss().getBoss(),
     thorinShadow.getSubordinate("Bombur")].each
    {
        println it
        assert it.salary == 6000
    }
    println "Envers query executed in " + (System.currentTimeMillis() - start) + " millis"
}
```

Envers output: 

```text
Employee{ Thorin TEAM_LEAD, $6000, Lonely Mountain, subordinates:'Bombur','Frodo','Fili','Kili','Bifur' }
Employee{ Aragorn CTO, $6000, Minas Tirith, subordinates:'Thorin' }
Employee{ Gandalf CEO, $6000, Middle-earth, subordinates:'Aragorn','Elrond' }
Employee{ Bombur SCRUM_MASTER, $6000, Lonely Mountain, subordinates: }
Envers query executed in 47 millis
```

<h4 id="javers-way-graphs">JaVers way</h4>

[`JaversQueryTest.groovy#L90`](https://github.com/javers/javers-vs-envers/blob/master/src/test/groovy/org/javers/organization/structure/JaversQueryTest.groovy#L90)

```groovy
def "should reconstruct a full object graph with JaVers"(){
  given:
    ... 

  when:
    def start = System.currentTimeMillis()
    List<Shadow<Employee>> shadows = javers.findShadows(
            QueryBuilder.byInstanceId('Thorin', Employee)
                        .withScopeDeepPlus()
                        .build())

  then:
    def thorinShadow = shadows.collect{it.get()}.find{it.salary == 6000}
    [thorinShadow,
     thorinShadow.getBoss(),
     thorinShadow.getBoss().getBoss(),
     thorinShadow.getSubordinate("Bombur")].each
    {
        println it
        assert it.salary == 6000
    }
    println "JaVers query executed in " + (System.currentTimeMillis() - start) + " millis"
}
```

JaVers output: 

```text
Employee{ Thorin TEAM_LEAD, $6000, Lonely Mountain, subordinates:'Bombur','Frodo','Fili','Kili','Bifur' }
Employee{ Aragorn CTO, $6000, Minas Tirith, subordinates:'Thorin' }
Employee{ Gandalf CEO, $6000, Middle-earth, subordinates:'Aragorn','Elrond' }
Employee{ Bombur SCRUM_MASTER, $6000, Lonely Mountain, subordinates: }
JaVers query executed in 48 millis
```

<h4 id="comparision-graphs">Comparision</h4>

Both tools succeeded to reconstruct the correct object graph.
Thorin’s version is wired with
the right Aragorn’s version, which is wired with the right  
Gandalf’s version.
Believe or not, this reconstruction is not trivial
because it’s implemented atop of an ordinary SQL database which has no time dimension.

**Performance** benchmark is beyond the scope of this article.
When you try to reconstruct large object graphs on a production database,
you are likely to face performance issues both in JaVers and Envers.
 
In JaVers you can enable a simple profiler tool, which logs query execution statistics
to standard `slf4j` logger:

```xml
<logger name="org.javers.JQL" level="DEBUG"/>
```

Then, you can analyze logs from the JQL query execution: 

```text
[main] org.javers.core.Javers  : Commit(id:6.1, snapshots:1, author:unknown, changes - ValueChange:1), done in 68 millis (diff:64, persist:4)
[main] org.javers.core.Javers  : Commit(id:7.1, snapshots:1, author:unknown, changes - ValueChange:1), done in 54 millis (diff:52, persist:2)
[main] org.javers.core.Javers  : Commit(id:8.0, snapshots:1, author:unknown, changes - ValueChange:1), done in 66 millis (diff:64, persist:2)
[main] org.javers.core.Javers  : Commit(id:9.0, snapshots:1, author:unknown, changes - ValueChange:1), done in 62 millis (diff:57, persist:5)
[main] org.javers.JQL          : SHALLOW query: 4 snapshots loaded (entities: 3, valueObjects: 1)
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Aragorn' at commitId 8.0, 4 snapshot(s) loaded, gaps filled so far: 1
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Gandalf' at commitId 8.0, 4 snapshot(s) loaded, gaps filled so far: 2
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Elrond' at commitId 8.0, 2 snapshot(s) loaded, gaps filled so far: 3
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Frodo' at commitId 8.0, 2 snapshot(s) loaded, gaps filled so far: 4
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Kili' at commitId 8.0, 2 snapshot(s) loaded, gaps filled so far: 5
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Fili' at commitId 8.0, 2 snapshot(s) loaded, gaps filled so far: 6
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Bifur' at commitId 8.0, 2 snapshot(s) loaded, gaps filled so far: 7
[main] org.javers.JQL          : DEEP_PLUS query for '...Employee/Bombur' at commitId 8.0, 3 snapshot(s) loaded, gaps filled so far: 8
[main] org.javers.JQL          : queryForShadows executed: 
JqlQuery {
  IdFilter{ globalId: ...Employee/Thorin }
  QueryParams{ aggregate: true, limit: 100 }
  ShadowScopeDefinition{ shadowScope: DEEP_PLUS, maxGapsToFill: 10 }
  Stats{  
    executed in millis: 36  
    DB queries: 9  
    all snapshots: 25  
    SHALLOW snapshots: 4  
    DEEP_PLUS snapshots: 21  
    gaps filled: 8  
  }
}
```

The rule of thumb &mdash; try keep the number of DB queries executed per each JQL query
as low as possible. Use the right *Shadow scope* (read more about [scopes](/documentation/jql-examples/#shadow-scopes)).

### Other query types

Envers has the only one type of query result &mdash; 
historical versions of an object, which is the most natural view of objects history.

In JaVers, this query type is called *Shadow query* (that’s why we use `findShadows()` in query examples).
Besides that, JaVers provides two more query types:
[Snapshots query](/documentation/jql-examples/#query-for-snapshots)
and
[Changes query](/documentation/jql-examples/#query-for-changes). 

**Snapshots** contain the same data as Shadows, but they are *dehydrated*. What does it mean?

* Snapshot is an instance of the JaVers’ `CdoSnapshot` class,
  while Shadow is simply an instance of a user’s domain class.
* Snapshot is self-contained and can be easily serialized/deserialized to JSON and send over network.
  Snapshots can be useful for example when you are building REST API for frontend application
  (see how we use Snapshots in the POC of [JaVers GUI](https://javers.org/javers-admin-frontend)).
  
**Changes** are the best choice for rendering objects history as a unified change log.
JaVers provides the `SimpleTextChangeLog` formatter, which creates the textual change log like this:   
  
```text 
commit 3.0, author: hr.manager, 2015-04-16 22:16:50
  changed object: Employee/Bob
    list changed on 'subordinates' property: [(0).added:'Employee/Trainee One', (1).added:'Employee/Trainee Two']
commit 2.0, author: hr.director, 2015-04-16 22:16:50
  changed object: Employee/Bob
    value changed on 'position' property: 'Scrum master' -> 'Team Lead'
    value changed on 'salary' property: '9000' -> '11000'  
```    

It’s easy to implement your own change log formatter (see [example](/documentation/repository-examples/#change-log)).  
   
## Final thoughts

So which tool is better?

As the author of JaVers I can’t be objective when answering this question 
(you can easily guess what is my opinion).
In fact, the goal of this article is to provide a fair comparision of JaVers and Envers
which give you enough information to make a conscious decision.

