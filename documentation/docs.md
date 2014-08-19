---
layout: main
title: JaVers Documentation
---

# JaVers Domain

Core building blocks of JaVers are:

* parameter
* level


~~~java
    ParamEngineConfig engineConfig = ParamEngineConfigBuilder.paramEngineConfig()
        .withParameterRepositories(/* insert repositories */).build();
    
    ParamEngine engine = ParamEngineFactory.paramEngine(engineConfig);
~~~

