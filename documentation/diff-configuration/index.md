---
layout: page
category: Documentation
title: Diff Configuration
submenu: diff-configuration
sidebar-url: docs-sidebar.html
---

Javers’ diff algorithm has a pluggable construction.
Each Java type is mapped to exact one [Javers type](/documentation/domain-configuration/#javers-types).
Each Javers type is mapped to exact one *comparator*.

In most cases, you will rely on Javers’ core comparators.
Optionally, you can register [Custom comparators](#custom-comparators)
for Value types and Custom Types.

For [comparing Lists](#list-algorithms), JaVers has three core comparators:
 **Simple** (default), **Levenshtein** distance, and **Set**. Pick one.

<h2 id="list-algorithms">List comparing algorithms</h2>
Generally, we recommend using **Levenshtein**, because it’s the smartest one.
But use it with caution, it could be slow for long lists,
say more then 300 elements.

The main advantage of **Simple** algorithm is speed, it has linear computation complexity.
The main disadvantage is the verbose output.

Choose the **Set** algorithm if you don’t care about the items ordering. 
JaVers will convert all Lists to Sets before comparision.
This algorithm produces the most concise output (only `ValueAdded` and `ValueRemoved`).   

You can switch to Levenshtein or Set in JaversBuilder:

```java
    Javers javers = JaversBuilder.javers()
        .withListCompareAlgorithm(ListCompareAlgorithm.LEVENSHTEIN_DISTANCE)
        .build();
```

or

```java
    Javers javers = JaversBuilder.javers()
        .withListCompareAlgorithm(ListCompareAlgorithm.AS_SET)
        .build();
```

<h3 id="simple-vs-levenshtein">Simple vs Levenshtein algorithm</h3>

Simple algorithm generates changes for shifted elements (in case when elements are inserted or removed in the middle of a list).
On the contrary, Levenshtein algorithm calculates short and clear change list even in case when elements are shifted.
It doesn’t care about index changes for shifted elements.

For example, when we remove one element from a list:

```java
javers.compare(['a','b','c','d','e'],
               ['a','c','d','e'])
```

the change list will be different, depending on chosen algorithm:

<table class="table" width="100%" style='word-wrap: break-word; font-family: monospace;'>
    <tr>
        <th>
        Output from Simple algorithm
        </th>
        <th>
            Output from Levenshtein algorithm
        </th>
    </tr>
    <tr>
        <td>
            (1). 'b'>>'c' <br />
            (2). 'c'>>'d' <br />
            (3). 'd'>>'e' <br />
            (4). removed:'e'
        </td>
        <td>
            (1). removed: 'b'
        </td>
    </tr>
</table>

But when both lists have the same size:

```java
javers.compare(['a','b','c','d'],
               ['a','g','e','i'])
```

the change list will the same:

<table class="table" width="100%" style='word-wrap: break-word; font-family: monospace;'>
    <tr>
        <th>
        Simple algorithm
        </th>
        <th>
            Levenshtein algorithm
        </th>
    </tr>
    <tr>
        <td>
            (1). 'b'>>'g' <br />
            (2). 'c'>>'e' <br />
            (3). 'd'>>'i' <br />
        </td>
        <td>
            (1). 'b'>>'g' <br />
            (2). 'c'>>'e' <br />
            (3). 'd'>>'i' <br />
        </td>
    </tr>
</table>

<h3 id="more-about-levenshtein">More about Levenshtein distance</h3>
The idea is based on the [Levenshtein edit distance](http://en.wikipedia.org/wiki/Levenshtein_distance)
algorithm, usually used for comparing Strings.
That is answering the question what changes should be done to go from one String to another?

Since a list of characters (i.e. String) is equal to a list of objects up to isomorphism
we can use the same algorithm for finding the Levenshtein edit distance for list of objects.

The algorithm is based on computing the shortest path in a DAG. It takes both `O(nm)` space
and time. Further work should improve it to take `O(n)` space and `O(nm)` time (n and m being
the length of both compared lists).

<h2 id="custom-comparators">Custom Comparators</h2>

There are cases where Javers’ diff algorithm isn’t appropriate,
and you need to implement your own *comparator* for certain types.

There are two types of Custom comparators: for Value types,
you can register
a [`CustomValueComparator`]({{ site.github_core_main_url }}org/javers/core/diff/custom/CustomValueComparator.java)
and for Custom types, you register 
a [`CustomPropertyComparator`]({{ site.github_core_main_url }}org/javers/core/diff/custom/CustomPropertyComparator.java)
.

### Custom Value Comparators

The natural way of providing a comparing strategy for [Value](/documentation/domain-configuration/#ValueType)
classes is overriding the standard `Object.equals(Object)` method.

If you don’t control the source code of a given Value class,
you can still change its comparing strategy by registering
a [`CustomValueComparator`]({{ site.github_core_main_url }}org/javers/core/diff/custom/CustomValueComparator.java).

It has two methods:

```java
public interface CustomValueComparator<T> {
    boolean equals(T a, T b);
    
    String toString(T value);
}
```

and it can be easily registered in JaversBuilder, 
for example:

```java
JaversBuilder.javers()
    .registerValue(BigDecimal.class, new BigDecimalComparatorWithFixedEquals())
    .build();
```

or with lambdas:

```java
Javers javers = JaversBuilder.javers()
    .registerValue(BigDecimal.class, (a, b) -> a.compareTo(b) == 0,
                                          a -> a.stripTrailingZeros().toString())
    .build();
```

Then, given `equals()` function is used instead of `Object.equals()` to compare Values 
and given `toString()` function is used instead of `Object.hashCode()`
when Values are compared in hashing contexts.
  
See the [full example](/documentation/diff-examples/#custom-value-comparator-example) 
of Custom Value comparator in our examples chapter.

### Custom Property Comparators
     
Unlike Custom Value comparators which are just a way to provide external `equals()`
implementation for Value classes, 
Custom Property comparators offer great flexibility.

You can register them for any type (class or interface) to bypass the Javers’ type system and diff algorithm.
  
Javers maps a class with a Custom Property comparator to *Custom Type*,
which means:<br/>
*I don’t care what it is, all I know is that it should be compared using this comparator*.

**Yet, Custom Types are not easy to manage, use it as a last resort,<br/>
only for corner cases like comparing custom Collection types.**
     
To register a Custom Type, all you have to do is implement the
[`CustomPropertyComparator`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/CustomPropertyComparator.java)
interface:

```java
public interface CustomPropertyComparator<T, C extends PropertyChange>
    extends CustomValueComparator<T> 
{
    Optional<C> compare(T left, T right, PropertyChangeMetadata metadata, Property property);
}
```

and register it in JaversBuilder, for example:

```java
Javers javers = JaversBuilder.javers()
    .registerCustomType(MyClass.class, new MyClassComparator())
    .build();
```

See the [full example](/documentation/diff-examples/#custom-property-comparator-example) 
of Custom Property comparator.
