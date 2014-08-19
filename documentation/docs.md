---
layout: main
title: JaVers Documentation
---

# JaVers Domain

Core building blocks of JaVers are:

* parameter
* level
* parameter entry
* function (plugin)


~~~java
    ParamEngineConfig engineConfig = ParamEngineConfigBuilder.paramEngineConfig()
        .withParameterRepositories(/* insert repositories */).build();
    
    ParamEngine engine = ParamEngineFactory.paramEngine(engineConfig);
~~~

