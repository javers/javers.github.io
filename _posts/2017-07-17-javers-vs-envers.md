---
layout: page
category: Blog
title: JaVers vs Envers
author: Bartosz Walacik
submenu: blog
---

In Java world, there are two tools for auditing data: Envers and JaVers.
Envers is here for a long time and it’s considered mainstream.
JaVers offers the fresh approach and technology independence.
If you consider which tool is a better choice for your project, this article is a good starting point.
The whole story turns around a demo application with some real life use cases. 
All examples are meant to be easily run on your machine.
 
The article has three sections. First, is a high level feature comparison.
In second, I show a simple application for managing organization structure with 
data audit made by both JaVers and Envers.
In third section,
I define a few audit related use cases and I compare how both tools implement them.