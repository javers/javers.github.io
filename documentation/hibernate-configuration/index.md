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

`javers-hibernate` provides you a HibernateUnproxyObjectAccessHook class that uses `Object Access Hook` as a way for JaVers to unproxy/initialize your hibernate
object just before processing it by JaVers. 

To enable HibernateUnproxyObjectAccessHook simply bind it to your JaVers instance using `withObjectAccessHook` builder method

```java
JaversBuilder.javers()
.withObjectAccessHook(new HibernateUnproxyObjectAccessHook())
.build()
```

Feel free to provide your own implementation of `Object Access Hook` for better control of your unproxing process. 
