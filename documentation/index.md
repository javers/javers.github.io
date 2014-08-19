---
layout: main
title: JaVers Documentation
---

# JaVers Domain

Core building blocks of JaVers are:

* parameter
* level

{% highlight java %}
    ParamEngineConfig engineConfig = ParamEngineConfigBuilder.paramEngineConfig()
        .withParameterRepositories(/* insert repositories */).build();
    
    ParamEngine engine = ParamEngineFactory.paramEngine(engineConfig);
{% endhighlight %}