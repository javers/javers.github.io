---
layout: page
title: Spring integration
category: Documentation
submenu: spring-integration
sidebar-url: docs-sidebar.html
---

We made JaVers easy to use in applications based on the Spring Framework.
There are two modules for Spring integration:

The **`javers-spring`** module provides the following annotations to configure 
the auto-audit aspects:

* [@JaversSpringDataAuditable](#at-javers-spring-data-auditable)
  &mdash; choose it if your persistence layer relies on Spring Data.
  It's the class-level annotation which adds the auto-audit aspect to a Spring Data
  [`CrudRepository`](https://docs.spring.io/spring-data/data-commons/docs/current/api/org/springframework/data/repository/CrudRepository.html).
  This is the easiest and recommended way to auto-audit your domain objects.
  
* [@JaversAuditable](#at-javers-auditable),
  [@JaversAuditableDelete](#at-auditable-delete), and
  [@JaversAuditableConditionalDelete](#at-javers-auditable-conditional-delete) &mdash;
  it's the family of method-level annotations to configure the auto-audit aspect
  for any kind of repository (non Spring Data).
  
The **`javers-spring-jpa`** module (a superset of the `javers-spring` module)
which provides:

* [JPA & Hibernate integration](#jpa-entity-manager-integration) for SQL databases,
* extension for [@JaversSpringDataAuditable](#at-javers-spring-data-auditable) to 
  support Spring Data [`JpaRepository`](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.repositories).

### Dependencies

If you are using [Spring Boot](http://projects.spring.io/spring-boot/),
simply use one of the [JaVers Spring Boot starters](/documentation/spring-boot-integration/). This is
**the recommended way** of integrating JaVers with Spring-based applications.
Our starters give you the right configuration out of the box.

#### Non Spring Boot applications

Take `javers-spring-jpa` if you are using JaVers with 
an SQL database with JPA & Hibernate:

```groovy
compile 'org.javers:javers-spring-jpa:{{site.javers_current_version}}'
```

Take `javers-spring` if you are using JaVers with MongoDB (or any persistence stack other than SQL with JPA & Hibernate):
 
```groovy
compile 'org.javers:javers-spring:{{site.javers_current_version}}'
```

Check
[Maven Central](https://search.maven.org/#artifactdetails|org.javers|javers-spring|{{site.javers_current_version}}|jar)
for other build tools snippets.

<h3 id="javers-instance-as-spring-bean">JaVers instance as a Spring bean</h3>

We recommend integrating Spring-based applications
with Javers using one of the [JaVers Spring Boot starters](/documentation/spring-boot-integration/).

If for some reason, you don't want to use a Javers' starter &mdash;
you can configure all the Javers beans manually
or copy the full Spring configuration examples for [MongoDB](#auto-audit-example-mongo) or
for [JPA & Hibernate](#spring-jpa-example).

You need to have a JaVers instance registered as a Spring bean.
For example, if you’re using MongoDB, setup JaVers as follows:

```java
@Bean
public Javers javers() {
    MongoRepository javersMongoRepository =
            new MongoRepository(mongo().getDatabase("mydatabase"));

    return JaversBuilder.javers()
            .registerJaversRepository(javersMongoRepository)
            .build();
}

@Bean
public MongoClient mongo() {
    return new MongoClient();
}
```

<h2 id="auto-audit-aspect">Auto-audit aspects</h2>

The auto-audit aspects are based on Spring AOP. They can automatically call
proper `javers.commit*(...)` methods whenever your domain objects are saved or deleted.
The aspects are configured with annotations.

There are three auto-audit aspects:

* `JaversSpringDataAuditableRepositoryAspect` for Spring Data 
  [`CrudRepositories`](https://docs.spring.io/spring-data/data-commons/docs/current/api/org/springframework/data/repository/CrudRepository.html)
  configured with the class-level [@JaversSpringDataAuditable](#at-javers-spring-data-auditable)
  annotation. Use it together with Javers
  [`MongoRepository`](/documentation/repository-configuration/#mongodb-configuration).
  
* `JaversSpringDataJpaAuditableRepositoryAspect` for Spring Data
  [`JpaRepositories`](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.repositories)
  (configured also with [@JaversSpringDataAuditable](#at-javers-spring-data-auditable)).
  Use it together with [`JaversSqlRepository`](/documentation/repository-configuration/#sql-databases).
  
* `JaversAuditableAspect` for any kind of repositories (non Spring Data),
  configured with the methd-level family of annotations:
  [@JaversAuditable](#at-javers-auditable),
  [@JaversAuditableDelete](#at-auditable-delete), and
  [@JaversAuditableConditionalDelete](#at-javers-auditable-conditional-delete).

**How the auto-audit aspects work?** <br/>

After an advised method is executed, 
its arguments or results are automatically committed to `JaversRepository`. <br/>
If an argument is an `Iterable`, JaVers iterates over it and commits each object separately.

**How the auto-audit are enabled?** <br/>
The auto-audit aspects will work only if you
[configure them](#auto-audit-aspects-spring-configuration) in your Spring context
or if you use one of the [JaVers Spring Boot starters](/documentation/spring-boot-integration/).

<h3 id="javers-spring-annotations">Annotations</h3>

<h4 id="at-javers-spring-data-auditable">@JaversSpringDataAuditable for Spring Data Repositories</h4>

If you’re using Spring Data, just annotate a repository you want to audit
with the class-level `@JaversSpringDataAuditable`.<br/>

For example:

```java
import org.javers.spring.data.JaversSpringDataAuditable
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
@JaversSpringDataAuditable
interface UserCrudRepository extends CrudRepository<User, String> {
}
```

or

```java
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
@JaversSpringDataAuditable
public interface UserJpaRepository extends JpaRepository<User, String> {
}
```

From now, all objects passed to `save()` and `delete()` methods will be automatically
audited by JaVers &mdash; AWESOME!


<h4 id="at-javers-auditable">@JaversAuditable</h4>

If you're using ordinary Repositories (non Spring Data),
annotate all data-changing methods you want to audit with the method-level `@JaversAuditable`.

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

In fact, you can use this method-level annotation for advising any bean in your application.
It could be a Service, Repository or anything which modifies domain objects.

From now, all objects passed to the annotated methods will be automatically versioned by JaVers.

<h4 id="at-auditable-delete">@JaversAuditableDelete</h4>
TODO

<h4 id="at-javers-auditable-conditional-delete">@JaversAuditableConditionalDelete</h4>
TODO

<h3 id="auto-audit-aspects-spring-configuration">Spring configuration of auto-audit aspects</h3>

If you want to manually configure the auto-audit aspects 
&mdash; here is the list of beans you need:

<ul>
      <li><a href="#javers-spring-data-auditable-repository-aspect">JaversSpringDataAuditableRepositoryAspect</a>
         or <a href="#javers-spring-data-jpa-auditable-repository-aspect">JaversSpringDataJpaAuditableRepositoryAspect</a> 
      </li>
      <li><a href="#javers-auditable-aspect">JaversAuditableAspect</a></li>
      <li><a href="#author-provider-bean">AuthorProvider</a> </li>
      <li><a href="#commit-properties-provider-bean">CommitPropertiesProvider</a> (optionally)</li>
</ul>


Note that the auto-audit aspects are based on Spring `@AspectJ`.<br/>
Remember **to enable** `@AspectJ` support by putting the `@EnableAspectJAutoProxy`
annotation in your Spring configuration.
For more info refer to Spring [@AspectJ documentation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-ataspectj).

<h4 id="javers-spring-data-auditable-repository-aspect">JaversSpringDataAuditableRepositoryAspect bean</h4>

It defines pointcuts on `save*(..)` and `delete*(..)` methods
within `CrudRepositories` annotated with the class-level
[@JaversSpringDataAuditable](#at-javers-spring-data-auditable) annotation.
Choose it if you are **not using** JPA.

```java
@Bean
public JaversSpringDataAuditableRepositoryAspect javersSpringDataAuditableAspect() {
    return new JaversSpringDataAuditableRepositoryAspect(
            javers(), authorProvider(), commitPropertiesProvider());
}
```

<h4 id="javers-spring-data-jpa-auditable-repository-aspect">JaversSpringDataJpaAuditableRepositoryAspect bean</h4>

It extends the main aspect with the pointcuts on `JpaRepository.saveAndFlush()`
and `JpaRepository.deleteInBatch()`.
It's triggered by the same annotation &mdash; [@JaversSpringDataAuditable](#at-javers-spring-data-auditable).
Choose it if you **are using** `JpaRepositories`.

```java
@Bean
public JaversSpringDataJpaAuditableRepositoryAspect javersSpringDataAuditableAspect(Javers javers) {
    return new JaversSpringDataJpaAuditableRepositoryAspect(
            javers, authorProvider(), commitPropertiesProvider());
}
```  

<h4 id="javers-auditable-aspect">JaversAuditableAspect bean</h4>

Register it if you want to add the auto-audit feature for any kind of repository
(not managed by Spring Data).

It defines the pointcuts on methods with these
annotations:
[@JaversAuditable](#at-javers-auditable),
[@JaversAuditableDelete](#at-auditable-delete), or
[@JaversAuditableConditionalDelete](#at-javers-auditable-conditional-delete).

```java
@Bean
public JaversAuditableAspect javersAuditableAspect() {
    return new JaversAuditableAspect(javers(), authorProvider(), commitPropertiesProvider());
}
```

<h4 id="author-provider-bean">AuthorProvider bean</h4>

Every JaVers commit (a data change) should be linked to its author, i.e. the
user who has made the change.
Please don’t confuse JaVers commit (a bunch of data changes)
with SQL commit (finalizing an SQL transaction).

You need to register an implementation of the
[`AuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/AuthorProvider.java) interface,
which should return a current user name. It’s required by all auto-audit aspects.
For example:

```java
    @Bean
    public AuthorProvider authorProvider() {
        return new SpringSecurityAuthorProvider();
    }
```

JaVers comes with [`SpringSecurityAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/SpringSecurityAuthorProvider.java)
&mdash;
suitable if you are using Spring Security.
If you don’t care about commit authors, use
[`MockAuthorProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/MockAuthorProvider.java).

<h4 id="commit-properties-provider-bean">CommitPropertiesProvider bean</h4>
Every JaVers commit may have one or more commit properties, useful for querying
(see [CommitProperty filter example](/documentation/jql-examples/#commit-property-filter)).

In the auto-audit aspects, commit properties are supplied by an implementation of the
[`CommitPropertiesProvider`](https://github.com/javers/javers/blob/master/javers-spring/src/main/java/org/javers/spring/auditable/CommitPropertiesProvider.java) interface,
for example:

```java
    @Bean
    public CommitPropertiesProvider commitPropertiesProvider() {
        return new CommitPropertiesProvider() {
            @Override
            public Map<String, String> provideForCommittedObject(Object domainObject) {
                if (domainObject instanceof DummyEntity) {
                    return Maps.of("dummyEntityId", ((DummyEntity)domainObject).getId() + "");
                }
                return Collections.emptyMap();
            }
        };
    }
```

If you don’t use commit properties, simply skip `commitPropertiesProvider` argument
in the aspect constructor or pass `new EmptyPropertiesProvider()`.

That’s the last bean in your Spring context required to run the auto-audit aspects.


<h2 id="jpa-entity-manager-integration">JPA EntityManager integration</h2>
Transaction management is the important issue for applications backed by SQL databases.
Generally, all SQL statements executed by `JaversSQLRepository`
should be executed in the context of the current application's transaction
(called Persistence Context in JPA terminology).

Read more about [ConnectionProvider](/documentation/repository-configuration/#connection-provider)
and JaVers’ approach to transaction management.

<h3 id="spring-configuration-for-transactional-javers">Spring configuration for JPA</h3>
**First**, you need to register exactly one **transactional** JaVers instance in your Spring context.
Simply use `TransactionalJaversBuilder` instead of standard JaversBuilder.

**Second**, you need to register a transactional ConnectionProvider.
If you’re using JPA with **Hibernate**, choose `JpaHibernateConnectionProvider` implementation
which is Persistence Context aware and plays along with Spring JpaTransactionManager.

**Third**, if you are using Hibernate, you need to deal with lazy-loading proxies.
Hibernate silently wraps them around your Entities loaded from database.
We strongly encourage to get rid of lazy-loading proxies before committing Entities to JaversRepository.
It can be easily obtained with [HibernateUnproxyObjectAccessHook](#hibernate-unproxy-hook). 

See example the full Spring configuration example for [JPA & Hibernate](#spring-jpa-example).

<h3 id="hibernate-unproxy-hook">Hibernate unproxy hook</h3>

JaVers provides `HibernateUnproxyObjectAccessHook` which is a way to unproxy
and initialize your Hibernate Entities just before processing them by JaVers diff & commit algorithms. 

To use HibernateUnproxyObjectAccessHook simply bind it to your JaVers instance using `JaversBuilder.withObjectAccessHook()` method:

```java
TransactionalJaversBuilder
    .javers()
    .withTxManager(txManager)
    .withObjectAccessHook(new HibernateUnproxyObjectAccessHook()).build()
```

Feel free to provide your own implementation of `object-access` hook if you need better control over
the unproxing process.

See below for the full Spring configuration example [for JPA & Hibernate](#spring-jpa-example).

<h2 id="spring-jpa-example">Spring configuration example for JPA & Hibernate</h2>

Please remember, that the easiest and strongly recommended way
of integrating Javers with
a Spring application is using one of our [Spring Boot starters](/documentation/spring-boot-integration/).

If you are not using Spring boot &mdash;
here is a working example of vanilla Spring Application Context
with all JaVers beans, JPA, Hibernate, Spring Data and Spring TransactionManager.

```java
package org.javers.spring.example;

import ...

@Configuration
@ComponentScan(basePackages = "org.javers.spring.repository")
@EnableTransactionManagement
@EnableAspectJAutoProxy
@EnableJpaRepositories({"org.javers.spring.repository"})
public class JaversSpringJpaApplicationConfig {

    //.. JaVers setup ..

    /**
     * Creates JaVers instance with {@link JaversSqlRepository}
     */
    @Bean
    public Javers javers(PlatformTransactionManager txManager) {
        JaversSqlRepository sqlRepository = SqlRepositoryBuilder
                .sqlRepository()
                .withConnectionProvider(jpaConnectionProvider())
                .withDialect(DialectName.H2)
                .build();

        return TransactionalJaversBuilder
                .javers()
                .withTxManager(txManager)
                .withObjectAccessHook(new HibernateUnproxyObjectAccessHook())
                .registerJaversRepository(sqlRepository)
                .build();
    }

    /**
     * Enables auto-audit aspect for ordinary repositories.<br/>
     *
     * Use {@link org.javers.spring.annotation.JaversAuditable}
     * to mark data writing methods that you want to audit.
     */
    @Bean
    public JaversAuditableAspect javersAuditable(Javers javers) {
        return new JaversAuditableAspect(javers, authorProvider(), commitPropertiesProvider());
    }

    /**
     * Enables auto-audit aspect for Spring Data repositories. <br/>
     *
     * Use {@link org.javers.spring.annotation.JaversSpringDataAuditable}
     * to annotate CrudRepository, PagingAndSortingRepository or JpaRepository
     * you want to audit.
     */
    @Bean
    public JaversSpringDataJpaAuditableRepositoryAspect javersSpringDataAspect(Javers javers) {
        return new JaversSpringDataJpaAuditableRepositoryAspect(javers, authorProvider(),
            commitPropertiesProvider());
    }

    /**
     * Required by auto-audit aspect. <br/><br/>
     *
     * Creates {@link SpringSecurityAuthorProvider} instance,
     * suitable when using Spring Security
     */
    @Bean
    public AuthorProvider authorProvider() {
        return new SpringSecurityAuthorProvider();
    }

    /**
     * Optional for auto-audit aspect. <br/>
     * @see CommitPropertiesProvider
     */
    @Bean
    public CommitPropertiesProvider commitPropertiesProvider() {
        return new CommitPropertiesProvider() {
            @Override
            public Map<String, String> provideForCommittedObject(Object domainObject) {
                if (domainObject instanceof DummyObject) {
                    return Maps.of("dummyObject.name", ((DummyObject)domainObject).getName());
                }
                return Collections.emptyMap();
            }
        };
    }

    /**
     * Integrates {@link JaversSqlRepository} with Spring {@link JpaTransactionManager}
     */
    @Bean
    public ConnectionProvider jpaConnectionProvider() {
        return new JpaHibernateConnectionProvider();
    }
    //.. EOF JaVers setup ..


    //.. Spring-JPA-Hibernate setup ..
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource());
        em.setPackagesToScan("org.javers.spring.model");

        JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        em.setJpaProperties(additionalProperties());

        return em;
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf){
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(emf);

        return transactionManager;
    }

    @Bean
    public PersistenceExceptionTranslationPostProcessor exceptionTranslation(){
        return new PersistenceExceptionTranslationPostProcessor();
    }

    @Bean
    public DataSource dataSource(){
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1");
        return dataSource;
    }

    Properties additionalProperties() {
        Properties properties = new Properties();
        properties.setProperty("hibernate.hbm2ddl.auto", "create");
        properties.setProperty("hibernate.connection.autocommit", "false");
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        return properties;
    }
    //.. EOF Spring-JPA-Hibernate setup ..
}
```

<h2 id="auto-audit-example-mongo">Spring configuration example for MongoDB</h2>

Please remember, that the easiest and strongly recommended way
of integrating Javers with
a Spring application is using one of our [Spring Boot starters](/documentation/spring-boot-integration/). 

If you are not using Spring boot &mdash;
here is a working example of vanilla Spring Application Context
with a JaVers instance, JaVers auto-audit aspects, and Spring Data MongoDB.

[`JaversSpringMongoApplicationConfigExample.java`](https://github.com/javers/javers/blob/master/javers-spring-mongo/src/test/java/org/javers/spring/mongodb/example/JaversSpringMongoApplicationConfigExample.java):

```java
package org.javers.spring.mongodb.example;

import ...

@Configuration
@ComponentScan(basePackages = "org.javers.spring.repository")
@EnableMongoRepositories({"org.javers.spring.repository"})
@EnableAspectJAutoProxy
public class JaversSpringMongoApplicationConfigExample {
  private static final String DATABASE_NAME = "mydatabase";

  @Autowired
  Optional<MongoTransactionManager> mongoTransactionManager;

  /**
   * Creates JaVers instance backed by {@link MongoRepository}
   */
  @Bean
  public Javers javers() {
    JaversMongoTransactionTemplate transactionTemplate = javersMongoTransactionTemplate();

    MongoRepository mongoRepository = new MongoRepository(
            mongo(),
            5000,
            MONGO_DB,
            transactionTemplate);

    return new TransactionalMongoJaversBuilder(transactionTemplate)
            .registerJaversRepository(mongoRepository)
            .build();
  }

  /**
   * If you are using multi-document ACID transactions
   * introduced in MongoDB 4.0 -- you can configure
   * Javers' MongoRepository to participate in your application's transactions
   * managed by MongoTransactionManager.
   */
  private JaversMongoTransactionTemplate javersMongoTransactionTemplate() {
    return mongoTransactionManager
            .map(it -> (JaversMongoTransactionTemplate)new SpringJaversMongoTransactionTemplate(it))
            .orElseGet(() -> NoTransactionTemplate.instance());
  }

  /**
   * You can configure Javers' MongoRepository to use
   * your application's primary database or a dedicated database.
   */
  @Bean
  public MongoDatabase mongo() {
    return MongoClients.create().getDatabase(DATABASE_NAME);
  }

  /**
   * Required by Spring Data Mongo
   */
  @Bean
  public MongoTemplate mongoTemplate() {
    return new MongoTemplate(MongoClients.create(), DATABASE_NAME);
  }

  /**
   * Enables auto-audit aspect for ordinary repositories.<br/>
   *
   * Use {@link JaversAuditable}
   * to mark repository methods that you want to audit.
   */
  @Bean
  public JaversAuditableAspect javersAuditableAspect() {
    return new JaversAuditableAspect(javers(), authorProvider(), commitPropertiesProvider());
  }

  /**
   * Enables auto-audit aspect for Spring Data repositories. <br/>
   *
   * Use {@link JaversSpringDataAuditable}
   * to annotate CrudRepositories you want to audit.
   */
  @Bean
  public JaversSpringDataAuditableRepositoryAspect javersSpringDataAuditableAspect() {
    return new JaversSpringDataAuditableRepositoryAspect(javers(), authorProvider(),
            commitPropertiesProvider());
  }

  /**
   * <b>INCUBATING - Javers Async API has incubating status.</b>
   * <br/><br/>
   *
   * Enables asynchronous auto-audit aspect for ordinary repositories.<br/>
   *
   * Use {@link JaversAuditableAsync}
   * to mark repository methods that you want to audit.
   */
  @Bean
  public JaversAuditableAspectAsync javersAuditableAspectAsync() {
    return new JaversAuditableAspectAsync(javers(), authorProvider(), commitPropertiesProvider(), javersAsyncAuditExecutor());
  }

  /**
   * <b>INCUBATING - Javers Async API has incubating status.</b>
   * <br/><br/>
   */
  @Bean
  public ExecutorService javersAsyncAuditExecutor() {
    ThreadFactory threadFactory = new ThreadFactoryBuilder()
            .setNameFormat("JaversAuditableAsync-%d")
            .build();
    return Executors.newFixedThreadPool(2, threadFactory);
  }

  /**
   * Required by auto-audit aspect. <br/><br/>
   *
   * Creates {@link SpringSecurityAuthorProvider} instance,
   * suitable when using Spring Security
   */
  @Bean
  public AuthorProvider authorProvider() {
    return new SpringSecurityAuthorProvider();
  }

  /**
   * Optional for auto-audit aspect. <br/>
   * @see CommitPropertiesProvider
   */
  @Bean
  public CommitPropertiesProvider commitPropertiesProvider() {
    return new CommitPropertiesProvider() {
      @Override
      public Map<String, String> provideForCommittedObject(Object domainObject) {
        return Maps.of("key", "ok");
      }
    };
  }
}
```
