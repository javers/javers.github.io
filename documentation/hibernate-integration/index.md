---
layout: docs
title: JaVers Documentation — JaVers Hibernate Configuration
submenu: hibernate-configuration
---

# JaVers Hibernate

First add `javers-hibernate` module to your classpath:

```groovy
compile 'org.javers:javers-hibernate:{{site.javers_current_version}}'
```
Check
[Maven Central](http://search.maven.org/#artifactdetails|org.javers|javers-hibernate|{{site.javers_current_version}}|jar)
 for snippets to other build tools.

<h3 id="hibernate-unproxy-hook">Hibernate unproxy hook</h3>

JaVers provides `HibernateUnproxyObjectAccessHook` which is a way to unproxy
and initialize your Hibernate entities just before processing them by JaVers diff algorithm. 

To use HibernateUnproxyObjectAccessHook simply bind it to your JaVers instance using `withObjectAccessHook()` builder method:

```java
JaversBuilder.javers().withObjectAccessHook(new HibernateUnproxyObjectAccessHook()).build()
```

Feel free to provide your own implementation of `object-access` hook if you need better control of unproxing process. 
