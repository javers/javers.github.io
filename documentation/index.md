---
layout: docs
title: Documentation — Introduction
submenu: introduction
---

# Overview

<h2 id="what-is-javers">What is JaVers</h2>
JaVers is a lightweight java library for **auditing** changes in your data.

We all use Version Control Systems for source code,
so why not use a specialized framework to provide an audit trail of your Java objects (entities, POJO, data objects)?

<h2 id="story">Story of JaVers</h2>

When developing an application, we usually concentrate on the current state of the domain objects.
So we simply instantiate them, apply some changes and eventually, delete them, not paying much attention to their previous states.

The challenge arises when a new requirement is discovered.

> As a User, I want to know who changed this status, <br/>
> when the change was performed and what the previous status was.

The problem is that both *version* and *change* notions are not easily expressible either in
Java language or in the mainstream databases (although NoSQL document databases have an advantage here over relational databases).

This is the niche that JaVers fills. In JaVers, *version* and *change* are **first class citizens**.

<h2 id="basic-facts-about-javers">Basic facts about JaVers</h2>

* It’s lightweight and versatile. We don’t make any assumptions about your data model, bean container or underlying data storage.
* Configuration is easy. Since we use JSON for object serialization, we don’t want you to provide detailed ORM-like mapping. JaVers only needs to know some high-level facts about your data model.
* JaVers is meant to keep its data versioning records (snapshots) in the application’s primary database, along with main data.
* We use some basic notions following Eric Evans DDD terminology like Entity or Value Objects, pretty much how JPA does. We believe that this is the right way to describe data.
* JaVers is written in Java7 and can be run on JDK 7 or higher.

<h2 id="licence">Licence</h2>
JaVers is released under
<a title="Apache License Version 2.0" href="http://opensource.org/licenses/Apache-2.0">Apache License
Version 2.0</a>.
