---
layout: docs
title: Documentation — Javers Internals
submenu: javers-internals
---

# Javers Internals

<h2 name="type-mapper">TypeMapper and the type inferring algorithm</h2>
JaVers use lazy approach to type mapping so types are resolved only for classes spotted in runtime.

To show You how it works, assume that JaVers is calculating diff on two graphs of objects
and currently two Person.class instances are compared.

ObjectGraphBuilder asks TypeMapper about JaversType of Person.class. TypeMapper does the following:

* If Person.class was spotted before in the graphs, TypeMapper has exact mapping for it and just returns already known JaversType
* If this is a first question about Person.class, TypeMapper checks if it was registered in JaversBuilder
  as one of Entity, ValueObject or Value. If so, answer is easy
* Then TypeMapper tries to find so called *Prototype&mdash;nearest* class or interface that is already mapped and is assignable from Person.class.
  So as You can see, it’s easy to map whole bunch of classes with a common superclass or interface with one call to JaversBuilder.
  Just register high level concepts (classes or interfaces at the top of the inheritance hierarchy)
* When Prototype is not found, JaVers tries to infer Type by looking for <code>@Id</code> annotations at property level
  (only the annotation class name is important, package is not checked, 
  so you can use well known javax.persistence.Id or custom annotation).
  If @Id is found, class would be mapped as an Entity, otherwise as a ValueObject.

Tu summarize, when JaVers knows nothing about your class, it will be mapped as ValueObject.