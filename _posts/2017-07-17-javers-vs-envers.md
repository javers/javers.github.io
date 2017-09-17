---
layout: page
category: Blog
title: JaVers vs Envers
author: Bartosz Walacik
submenu: blog
---

In the Java world, there are two tools for data auditing: [Envers](http://hibernate.org/orm/envers/)
and [JaVers](https://javers.org).
Envers is here for a long time and it’s considered mainstream.
JaVers offers the fresh approach and technology independence.
If you consider which tool will be better for your project, this article is the good starting point.

The article has three sections. First, is a high level comparison.
In second section, I show the simple, demo application for managing organization structure with 
data audit made by both JaVers and Envers.
In third section, I define a few audit related use cases and I compare how both tools are coping with them.

## High level comparison

There are two big difference between JaVers and Envers:

1. **Envers** is the Hibernate plugin.
   It has good integration with Hibernate but you can use it only with traditional SQL databases.
   If you choosed NoSQL database or SQL but with other persistence framework like 
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

### Database

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

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/employee_aud.png" alt="revinfo table" width="807px"/>

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
`@JaversSpringDataAuditable` annotation putted on Spring Data repositories.
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
JaVers will create three tables: `jv_commit`, `jv_global_id` and `jv_snapshot`
(there is also the fourth table &mdash; `jv_commit_property`, but our application doesn’t touch it).

##### `select * from jv_commit`

<img style="margin-bottom:10px" src="/blog/javers-vs-envers/jv_commit_table.png" alt="revinfo table" width="457px"/>


## Use cases    