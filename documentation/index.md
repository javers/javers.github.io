---
layout: main
title: JaVers Documentation
---

This is a Documentation page sketch.

We need following pages:

# Getting Started
* What is JaVers
* Features overview
* Get JaVers
* Quick-start guide

# User Guide
* Configuration
* Model Mapping


Syntax highlight demo:
{% highlight java %}
    ParamEngineConfig engineConfig = ParamEngineConfigBuilder.paramEngineConfig()
        .withParameterRepositories(/* insert repositories */).build();
    
    ParamEngine engine = ParamEngineFactory.paramEngine(engineConfig);
{% endhighlight %}