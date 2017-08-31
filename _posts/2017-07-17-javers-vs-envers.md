---
layout: page
category: Blog
title: JaVers vs Envers
author: Bartosz Walacik
submenu: blog
---

In the Java world, there are two tools for data auditing: [Envers](http://hibernate.org/orm/envers/)
and [JaVers](https://javers.org).
Envers is here for a long time and it’s considered mainstream.
JaVers offers the fresh approach and technology independence.
If you consider which tool will be better for your project, this article is the good starting point.

The article has three sections. First, is a high level comparison.
In second section, I show the simple, demo application for managing organization structure with 
data audit made by both JaVers and Envers.
In third section,
I define a few audit related use cases and I compare how both tools are coping with them.

## High level comparison

There are two big difference between JaVers and Envers:

1. Envers is the Hibernate plugin.
   It has good integration with Hibernate but you can use it only with traditional SQL databases.
   If you choosed NoSQL database or SQL but with other persistence framework like 
   [JOOQ](https://www.jooq.org/) &mdash; Envers is not an option.
   
   On the contrary, JaVers can be used with any kind of database and any kind of 
   persistence framework. For now, JaVers comes with repository implementations for MongoDB and
   popular SQL databases. Other databases (like Cassandra, Elastic) might be added in the future.
   
1. Envers’ audit data model is a copy of application’s data model. As the doc says:
   *For each audited entity, an audit table is created.
   By default, the audit table name is created by adding a `_AUD` suffix to the original name.*
   It can be advantage, you have audit data close to your live data. Envers’ tables look familiar.
   It’s easy query them with SQL.
     
   JaVers uses its own Snapshot model for audit data.
   Snapshots are decoupled from live data,
   JaVers saves them to the single table (`jv_snapshots`) as JSON documents with unified structure.
   Advantages? You can choose where to store audit data.
   By default JaVers uses the same database as application does,
   but you can point another database
   (even of different kind). For example, SQL for application and MongoDB for JaVers
   or centralized JaVers database shared for all applications in your company).
   
    
    