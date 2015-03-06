---
layout: docs
title: Documentation — Spring integration
submenu: spring-integration
---

# Spring integration



Our main approach at JaVers is that our library should be very easy to use — so we made JaVers compatible with
Spring Framework.

`javers-spring` module provides the following features:

* integration with [JpaTransactionManager](http://docs.spring.io/autorepo/docs/spring-framework/4.0.7.RELEASE/javadoc-api/org/springframework/orm/jpa/JpaTransactionManager.html)
  for SQL databases,
* annotations for Repository auto-commit (both SQL and NoSQL).

<h2 id="jpa-transaction-manager-integration">JpaTransactionManager integration</h2>
Transaction management is the important issue for applications backed by SQL databases.

Generally, JaVers philosophy is to use application's transactions
and never to call `commit` or `rollback` on his own.
So all SQL statements executed by `JaversSQLRepository`
should be executed in the context of the current application's transaction
(called Persistence Context in JPA terminology).

If you are using JPA and Hibernate, setup your JaversSQLRepository
with `JpaHibernateConnectionProvider` which is Persistence Context aware
and plays along with JpaTransactionManager.

<h2 id="repository-auto-commit">Repository auto-commit</h2>

Repository auto-commit is based on `Spring AOP` and frees you from calling `javers.commit()` in your Repositories.

If you are using Spring Data, annotate your CRUD Repositories with `@JaversSpringDataAuditable`.
For ordinary Repositories, use `@JaversAuditable` annotation to mark all data modifying methods.

JaVers use aspects to commit your changes to JaversRespository automatically, AWESOME!

...///

<h2 id="spring-int-configuration">Configuration</h2>

There are few steps you need to go through.

First add `javers-spring` module to your classpath:

```groovy
compile 'org.javers:javers-spring:{{site.javers_current_version}}'
```

Check Maven Central pages:
[javers-spring-data](http://search.maven.org/#artifactdetails|org.javers|javers-spring-data|{{site.javers_current_version}}|jar),
[javers-spring](http://search.maven.org/#artifactdetails|org.javers|javers-spring|{{site.javers_current_version}}|jar),
 for snippets to other build tools.

<h3 id="enable-aspectj-support">Enable @AspectJ support</h3>

First thing you have to do is to enable Spring `@AspectJ` support.
JaVers registers an aspect that commits changes automatically, after invoking annotated
method — this is not possible when @AspectJ support is disabled.
So please remember to put `@EnableAspectJAutoProxy` annotation in your Spring config.

For to more info refer to Spring [@AspectJ documentation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-ataspectj):

<h3 id="register-javers-instance">Register JaVers instance</h3>
You need to have exactly one JaVers instance in your Application Context.
This instance will be used to commit changes.

```
    @Bean
    public Javers javers() {
        return JaversBuilder.javers().build();
    }
```

<h3 id="register-javers-post-processor">Register JaversPostProcessor bean</h3>

`JaversPostProcessor` is the implementation of Spring
[BeanPostProcessor](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/config/BeanPostProcessor.html)
and it wraps all bean methods (typically Repository methods) annotated with `@JaversAuditable`.

After executing of an annotated method, all its **arguments** are committed.
In case where an argument is an instance of [Iterable](http://docs.oracle.com/javase/7/docs/api/java/lang/Iterable.html),
JaVers iterates over it and commits each element separately.

<h2 id="register-author-provider">AuthorProvider</h2>

Every commit (data change) should be connected to its author (i.e. user who made a change).
You should provide an implementation of the `AuthorProvider` interface:

```java
package org.javers.spring;

/**
 * Implementation has to be thread-safe and has to provide
 * an author (typically a user login), bounded to current transaction.
 */
public interface AuthorProvider {
    String provide();
}
```

Result of `provide()` method is passed to `javers.commit()`
and persisted as a commit author.
Remember that AuthorProvider has to be thread-safe and connected to current user session.

See example below for Spring Security implementation.

<h2 id="full-configuration-example">Full configuration example</h2>

```java
package org.javers.spring.integration;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.spring.AuthorProvider;
import org.javers.spring.JaversPostProcessor;
import org.springframework.context.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@ComponentScan
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class ExampleApplicationConfig {

    @Bean
    public AuthorProvider authorProvider() {
        return new SpringSecurityAuthorProvider();
    }

    @Bean
    public JaversPostProcessor javersPostProcessor() {
        return new JaversPostProcessor(javers(), authorProvider());
    }

    @Bean
    public Javers javers() {
        return JaversBuilder.javers().build();
    }

    private static class SpringSecurityAuthorProvider implements AuthorProvider {
        @Override
        public String provide() {
            Authentication auth =  SecurityContextHolder.getContext().getAuthentication();

            if (auth == null) {
                return "unauthenticated";
            }

            return auth.getName();
        }
    }
}
```

<h3 id="javers-auditable-ann">Annotate Repository methods with @JaversAuditable</h3>

You can select which Repository methods should be audited by simply annotating them with `@JaversAuditable`.
If you want to annotate all methods from a class, just put the annotation over the class definition.


```java
    class UserRepository {

        @JaversAuditable
        public void save(User user) { ... }

        public void update(User user) { ... }
    }
```

or

```java
    @JaversAuditable
    class UserRepository {

        public void save(User user) { ... }

        public void update(User user) { ... }
    }
```

From now, all object passed to annotated methods will be automatically versioned by JaVers.

<h3 id="spring-data-integration">Spring Data integration</h3>
If you are using `Spring Data`, your configuration would be even more simple.
Just add `@JaversSpringDataAuditable` annotation to your Spring Data Repositories,
for example:

```java
    package org.javers.spring.data.integration.testdata

    import org.javers.spring.data.JaversSpringDataAuditable
    import org.springframework.data.repository.CrudRepository
    import org.springframework.stereotype.Repository

    @Repository
    @JaversSpringDataAuditable
    interface UserRepository extends CrudRepository<User, String> {
    }
```

From now, all object passed to `save()` and `delete()` methods will be automatically versioned by JaVers.