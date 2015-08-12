---
layout: docs
title: Documentation — Spring integration
submenu: spring-integration
---

# Spring integration

Our main idea at JaVers is that our library should be very easy to use.
So we made JaVers compatible with Spring Framework.

`javers-spring` module provides the following features:

* [annotations](#auto-audit-aspect) for Repository auto-audit (both SQL and NoSQL),
* [integration](#jpa-transaction-manager-integration) with Spring JpaTransactionManager for SQL databases.

## Usage

First add `javers-spring` module to your classpath:

```groovy
compile 'org.javers:javers-spring:{{site.javers_current_version}}'
```
Check
[Maven Central](http://search.maven.org/#artifactdetails|org.javers|javers-spring|{{site.javers_current_version}}|jar)
 for snippets to other build tools.

<h2 id="auto-audit-aspect">Auto-audit aspect</h2>
The JaVers auto-audit aspect is based on Spring AOP and frees you
from calling `javers` methods in your data-changing Repositories.

If you’re using Spring Data, annotate your CRUD Repositories with `@JaversSpringDataAuditable`.
For ordinary Repositories, use `@JaversAuditable` annotation to mark all data-changing methods.

JaVers can audit your data changes automatically — AWESOME!

Below you can see which beans you need to register to use the auto-audit feature.

### JaVers instance as a Spring bean

You need to register exactly one JaVers instance in your Application Context.
For example, if you’re using MongoDB, setup JaVers as follows:

```java
    @Bean
    public Javers javers() {
        MongoRepository javersMongoRepository = new MongoRepository(mongoDB());

        return JaversBuilder.javers()
                .registerJaversRepository(javersMongoRepository)
                .build();
    }

    @Bean
    public MongoDatabase mongoDB() {
        return new Fongo("test").getDatabase("test");
    }
```

### Enable @AspectJ support

JaVers registers an aspect which manages the auto-audit feature.
Put `@EnableAspectJAutoProxy` annotation in your Spring configuration.
This enables Spring `@AspectJ` support.

For more info refer to Spring
[@AspectJ documentation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-ataspectj).

### Register JaversAuditableRepositoryAspect

Register `JaversAuditableRepositoryAspect`, which provides the auto-audit feature.
It defines two pointcuts:

* All `save(..)` and `delete(..)` methods within Spring Data `CrudRepository`
  with class-level `@JaversSpringDataAuditable` annotation.
* Any method annotated with `@JaversAuditable`.

After an advised method is executed, all of its **arguments**
are automatically saved to JaversRepository.

In the case where an argument is the `Iterable` instance,
JaVers iterates over it and saves each element separately.

### Register AuthorProvider bean

Every JaVers commit (data change) should be connected to its author, i.e. the
user who made the change.
Please don’t confuse JaVers commit (a bunch of data changes)
with the SQL commit command (finalizing an SQL transaction).

You need to register an implementation of the `AuthorProvider` interface,
which returns a current user login.

Here’s the contract:

```java
package org.javers.spring.auditable;

/**
 * Implementation has to be thread-safe and has to provide
 * an author (typically a user login), bounded to current user session.
 */
public interface AuthorProvider {
    String provide();
}
```

### Annotate your Spring Data Repositories

If you’re using Spring Data, just annotate every Repository you want to audit
with class-level `@JaversSpringDataAuditable`, for example:

```java
    import org.javers.spring.data.JaversSpringDataAuditable
    import org.springframework.data.repository.CrudRepository
    import org.springframework.stereotype.Repository

    @Repository
    @JaversSpringDataAuditable
    interface UserRepository extends CrudRepository<User, String> {
    }
```

From now, all objects passed to `save()` and `delete()` methods will be automatically versioned by JaVers.

### Annotate your ordinary Repositories

If you're using ordinary Repositories (non Spring Data),
annotate all data-changing methods you want to audit with `@JaversAuditable`.

For example:

```java
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

See below for the complete example of the Application Context.

<h3 id="auto-audit-example">Auto-audit example with MongoDB</h3>

Here is a working example of Spring Application Context
with JaVers instance, JaVers auto-audit aspect and Spring Data MongoDB.

```java
package org.javers.spring.example;

import ...

@Configuration
@ComponentScan(basePackages = "org.javers.spring.repository.mongo")
@EnableAspectJAutoProxy
@EnableMongoRepositories(basePackages = "org.javers.spring.repository.mongo")
public class JaversSpringMongoApplicationConfig {

    /**
     * Creates JaVers instance backed by {@link MongoRepository}
     */
    @Bean
    public Javers javers() {
        MongoRepository javersMongoRepository = new MongoRepository(mongoDB());

        return JaversBuilder.javers()
                .registerJaversRepository(javersMongoRepository)
                .build();
    }

    /**
     * MongoDB setup
     */
    @Bean
    public MongoDatabase mongoDB() {
        return new Fongo("test").getDatabase("test");
    }

    /**
     * Enables Repository auto-audit aspect. <br/>
     *
     * Use {@link org.javers.spring.annotation.JaversSpringDataAuditable}
     * to annotate Spring Data Repositories
     * or {@link org.javers.spring.annotation.JaversAuditable} for ordinary Repositories.
     */
    @Bean
    public JaversAuditableRepositoryAspect javersAuditableRepositoryAspect() {
        return new JaversAuditableRepositoryAspect(javers(), authorProvider());
    }

    /**
     * Required by Repository auto-audit aspect. <br/><br/>
     *
     * Returns mock implementation for testing.
     * <br/>
     * Provide real implementation,
     * when using Spring Security you can use
     * {@link org.javers.spring.auditable.SpringSecurityAuthorProvider}.
     */
    @Bean
    public AuthorProvider authorProvider() {
        return new AuthorProvider() {
            @Override
            public String provide() {
                return "unknown";
            }
        };
    }
}
```

<h2 id="jpa-entity-manager-integration">JPA EntityManager integration</h2>
Transaction management is the important issue for applications backed by SQL databases.
Generally, all SQL statements executed by `JaversSQLRepository`
should be executed in the context of the current application's transaction
(called Persistence Context in JPA terminology).

Read more about [ConnectionProvider](/documentation/repository-configuration/#connection-provider)
and JaVers’ approach to transaction management.

<h3 id="spring-configuration-for-transactional-javers">Spring configuration for SQL</h3>
**First**, you need to register exactly one **transactional** JaVers instance in your Application Context.
Simply use `TransactionalJaversBuilder` instead of standard JaversBuilder.

**Second**, you need to register a transactional ConnectionProvider.
If you’re using JPA with **Hibernate**, choose `JpaHibernateConnectionProvider` implementation
which is Persistence Context aware and plays along with Spring JpaTransactionManager.

**Third**, if you are using Hibernate, you need to deal with lazy-loading proxies.
Hibernate silently wraps them around your Entities loaded from database.
We strongly encourage to get rid of lazy-loading proxies before committing Entities to JaversRepository.
It can be easily obtained with [HibernateUnproxyObjectAccessHook](#hibernate-unproxy-hook). 

See below for the complete example of the Spring configuration.

<h3 id="spring-jpa-example">Spring JPA Hibernate example</h3>

Here is a working example of Spring Application Context
with all JaVers beans, JPA, Hibernate, Spring Data and Spring TransactionManager.

```java
package org.javers.spring.example;

import ...

@Configuration
@ComponentScan(basePackages = "org.javers.spring.repository.jpa")
@EnableTransactionManagement
@EnableAspectJAutoProxy
@EnableJpaRepositories(basePackages = "org.javers.spring.repository.jpa")
public class JaversSpringJpaApplicationConfig {

    //.. JaVers setup ..

    /**
     * Creates JaVers instance with {@link JaversSqlRepository}
     */
    @Bean
    public Javers javers() {
        JaversSqlRepository sqlRepository = SqlRepositoryBuilder
                .sqlRepository()
                .withConnectionProvider(jpaConnectionProvider())
                .withDialect(DialectName.H2)
                .build();

        return TransactionalJaversBuilder
                .javers()
                .withObjectAccessHook(new HibernateUnproxyObjectAccessHook())
                .registerJaversRepository(sqlRepository)
                .build();
    }

    /**
     * Enables Repository auto-audit aspect. <br/>
     *
     * Use {@link org.javers.spring.annotation.JaversSpringDataAuditable}
     * to annotate Spring Data Repositories
     * or {@link org.javers.spring.annotation.JaversAuditable} for ordinary Repositories.
     */
    @Bean
    public JaversAuditableRepositoryAspect javersAuditableRepositoryAspect() {
        return new JaversAuditableRepositoryAspect(javers(), authorProvider());
    }

    /**
     * Required by Repository auto-audit aspect. <br/><br/>
     *
     * Returns mock implementation for testing.
     * <br/>
     * Provide real implementation,
     * when using Spring Security you can use
     * {@link org.javers.spring.auditable.SpringSecurityAuthorProvider}.
     */
    @Bean
    public AuthorProvider authorProvider() {
        return new AuthorProvider() {
            @Override
            public String provide() {
                return "unknown";
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

<h3 id="hibernate-unproxy-hook">Hibernate unproxy hook</h3>

JaVers provides `HibernateUnproxyObjectAccessHook` which is a way to unproxy
and initialize your Hibernate Entities just before processing them by JaVers diff & commit algorithms. 

To use HibernateUnproxyObjectAccessHook simply bind it to your JaVers instance using `JaversBuilder.withObjectAccessHook()` method:

```java
TransactionalJaversBuilder
    .javers().withObjectAccessHook(new HibernateUnproxyObjectAccessHook()).build()
```

Feel free to provide your own implementation of `object-access` hook if you need better control over unproxing process. 