---
layout: docs
title: Documentation — Spring integration
submenu: spring-integration
---

# Spring integration

<h2 name="introduction">Introduction</h2>

One of our main approach is Javers should be easy to use, with this in mind we prepared integration for
applications based on Spring framework. Integration is based on spring-context and spring-aop. As a customer only one thing you
have to do is to annotate a methods that modify your data, everything else is done by Javers Spring Integration.

<h2 name="usage">Usage</h2>

There are few steps you need to go through:

<h3>Enable AspectJ Auto Proxy</h3>

First thing you have to do is enable AspectJ Auto Proxy. Javers add aspects that commit changes after invoking annotated
methods, this is not possible without enabled AspectJ. For to more info go to Spring documentation:

[docs.spring.io](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-aspectj-support)

<h3>Add AuthorProvider bean definition to application context</h3>

Next step is providing implementation of [AuthorProvider](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/AuthorProvider.java) interface:

```
    public interface AuthorProvider {
        String provide();
    }
```

Result of execution thi method will be passed to [JaversCommitAdvice](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/aspect/JaversCommitAdvice.java) and persisted as commit author.

```
    @Bean
    public AuthorProvider authorProvider() {
        return new AuthorProvider() {
            @Override
            public String provide() {
                return SecurityContextHolder.getContext().getAuthentication().getName();
            }
        };
    }
```

<h3>Add JaversPostProcessor to application context</h3>

[JaversPostProcessor](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/JaversPostProcessor.java) is implementation of [BeanPostProcessor](http://docs.spring.io/spring-framework/docs/2.5.6/api/org/springframework/beans/factory/config/BeanPostProcessor.html) and it wraps all declared methods with [JaversCommitAdvice](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/aspect/JaversCommitAdvice.java).
After method proceed advice get all arguments from method and commit them. In case where argument is instance of
[Iterable](http://docs.oracle.com/javase/7/docs/api/java/lang/Iterable.html) then will be iteration over all elements and committing each separately.

```
    @Bean
    public JaversPostProcessor javersPostProcessor() {
        return new JaversPostProcessor(javers(), authorProvider());
    }
```

<h3>Annotate methods</h3>

You can select with methods should be proxied by annotate them [@JaversAuditable](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/JaversAuditable.java).
If you want to select all methods from class just put annotation over the class definition.


```
    class UserRepository {

        @JaversAuditable
        public void save(User user) { ... }

        public void update(User user) { ... }
    }
```

or

```
    @JaversAuditable
    class UserRepository {

        public void save(User user) { ... }

        public void update(User user) { ... }
    }

```
