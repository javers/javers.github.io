---
layout: docs
title: Documentation - Introduction
---

# Introduction

## What is JaVers
JaVers is a lightweight java library for **auditing** changes in your data.

We all use Version Control Systems for source code,
why not to use specialized framework to provide an audit trail of your Java objects (entities, POJO, data objects)?

## Story
When developing an application, we usually concentrate on the current state of domain objects.
So we simply instantiate them, apply some changes and eventually, delete them, not paying much attention to previous states.

The challenge arises when a new requirement is discovered:

> As a User, I want to know who changed this status, <br/>
> when the change was performed and what was the previous status.

The problem is, that both *version* and *change* notions are not easily expressible neither in the
Java language nor in the mainstream databases (although NoSQL document databases have advantage here over relational ones).

This is the niche JaVers fulfills. In JaVers, *version* and *change* are **first class citizens**.

## Basic facts about JaVers
* It's lightweight and versatile. We don't take any assumptions about your data model, bean container or underlying data storage.
* Configuration is easy. Since we use JSON for objects serialization, we don't want you to provide detailed ORM-like mapping. JaVers needs to know only some high-level facts about your data model.
* JaVers is meant to keep its data versioning records (snapshots) in application primary database alongside with main data.
* We use some basic notions following Eric Evans DDD terminology like Entity or Value Objects, pretty much the same like JPA does. We believe that this is right way of describing data.
* JaVers is written in Java7 it can be run on JDK 6 or higher.