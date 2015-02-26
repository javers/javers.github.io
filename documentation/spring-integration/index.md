---
layout: docs
title: Documentation — Spring integration
submenu: spring-integration
---

# Spring integration

<h2 name="introduction">Introduction</h2>

Our main approach at JaVers is that our library should be very easy to use — so we made JaVers compatible with
Spring Framework. Integration is based on `Spring AOP` and frees you from calling `javers.commit()` in Repository methods.

Only thing you need to do
is to annotate all Repository methods that modify your data with `@JaversAuditable`.
We use aspects to commit your changes to JaversRespository automatically, AWESOME!

<h2 name="usage">Usage</h2>

There are few steps you need to go through:

<h3>Enable @AspectJ support</h3>

First thing you have to do is to enable Spring `@AspectJ` support.
JaVers registers an aspect that commits changes automatically, after invoking annotated
method — this is not possible when @AspectJ support is disabled.
So please remember to put `@EnableAspectJAutoProxy` annotation in your Spring config.

For to more info refer to Spring [@AspectJ documentation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-ataspectj):

<h3>Register AuthorProvider bean</h3>

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

<h3>Register JaversPostProcessor bean</h3>

`JaversPostProcessor` is the implementation of Spring
[BeanPostProcessor](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/config/BeanPostProcessor.html)
and it wraps all bean methods (typically Repository methods) annotated with `@JaversAuditable`.

After executing of an annotated method, all its **arguments** are committed.
In case where an argument is an instance of [Iterable](http://docs.oracle.com/javase/7/docs/api/java/lang/Iterable.html),
JaVers iterates over it and commits each element separately.

Full configuration example:

```java
package org.javers.spring.integration;

import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.spring.AuthorProvider;
import org.javers.spring.JaversPostProcessor;
import org.springframework.context.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * @author bartosz walacik
 */
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

<h3>Annotate Repository methods</h3>

You can select which methods should be decorated by simply annotating them with `@JaversAuditable`.
If you want to annotate all methods from a class, just put annotation over the class definition.


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