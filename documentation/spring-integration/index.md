---
layout: docs
title: Documentation — Spring integration
submenu: spring-integration
---

# Spring integration

<h2 name="introduction">Introduction</h2>

Our main approach at Javers is that our library should be very easy to use - so we made Javers compatible with
Spring Framework. Integration is based on spring-context and spring-aop. Only thing you need to do
is to annotate all Spring repository methods that modify your data with ```@JaversAuditable```. We'll use aspects
to commit your changes in JaversRespository automatically, so you need to have them enabled as well. AWESOME!

<h2 name="usage">Usage</h2>

There are few steps you need to go through:

<h3>Enable AspectJ Auto Proxy</h3>

First thing you will have to do is to enable AspectJ Auto Proxy. Javers adds an aspect that will commit changes automatically after invoking annotated
method - this is not possible if you disabled AspectJ. So please remember to put ```@EnableAspectJAutoProxy``` annotation in your Spring config.
For to more info go to Spring documentation:

[docs.spring.io](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/aop.html#aop-aspectj-support)

<h3>Add AuthorProvider bean definition to application context</h3>

Every repository change should be connected to its executor (i.e. user making change).
You should provide an implementation of [AuthorProvider](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/AuthorProvider.java) interface:
Result of ```provide()``` method will be passed to [JaversCommitAdvice](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/aspect/JaversCommitAdvice.java) and persisted as commit author.

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

[JaversPostProcessor](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/JaversPostProcessor.java) is implementation of [BeanPostProcessor](http://docs.spring.io/spring-framework/docs/2.5.6/api/org/springframework/beans/factory/config/BeanPostProcessor.html) and it wraps all annotated in repository methods with [JaversCommitAdvice](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/aspect/JaversCommitAdvice.java).
After executing Javers annotated repository methods all the arguments should be committed. In case where argument is instance of
[Iterable](http://docs.oracle.com/javase/7/docs/api/java/lang/Iterable.html) Javers will iterate over all elements and commit each separately.

```
    @Bean
    public JaversPostProcessor javersPostProcessor() {
        return new JaversPostProcessor(javers(), authorProvider());
    }
```

<h3>Annotate methods</h3>

You can select which methods should be proxied by simply annotating them with [@JaversAuditable](https://github.com/javers/javers/blob/664a2d2a3f8eec57f5f5647bcd23aea25e3b5f4f/javers-spring/src/main/java/org/javers/spring/JaversAuditable.java).
If you want to annotate all methods from class just put annotation over the class definition.


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
