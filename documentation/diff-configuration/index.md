---
layout: page
category: Documentation
title: Diff Configuration
submenu: diff-configuration
sidebar-url: docs-sidebar.html
---

JaVers’ diff algorithm has a pluggable construction.
It consists of the core comparators suite and optionally, [custom comparators](#custom-comparators).

You can fine-tune how the whole algorithm works by registering custom comparators
for certain types (custom comparators overrides core comparators).

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

There are cases where JaVers’ diff algorithm isn’t appropriate,
and you need to implement your own comparing strategy for certain types.
 
**Custom Property Comparators** come to the rescue.
You can register them for any type (class or interface) to bypass the JaVers’ type system and diff algorithm. 
 
JaVers maps a class with a custom comparator to *Custom Type*,
which means:
*I don’t care what it is, all I know is that it should be compared using this custom comparator*.

All you have to do is implement the
[`CustomPropertyComparator`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/CustomPropertyComparator.java)
interface:

```java
public interface CustomPropertyComparator<T, C extends PropertyChange> {
    /**
     * Called by JaVers to calculate property-to-property diff.
     */
    Optional<C> compare(T left, T right, PropertyChangeMetadata metadata, Property property);

    /**
     * Called by JaVers to calculate collection-to-collection diff.
     */
    boolean equals(T a, T b);
}
```

and register your custom comparator instance in JaversBuilder:

```java
JaversBuilder.javers().registerCustomComparator(new MyClassComparator(), MyClass.class).build()
```

See the full [example of CustomPropertyComparator](/documentation/diff-examples/#custom-comparators-example) in our examples chapter.

**Custom comparators for Values**<br/>

The natural way of providing comparing strategy for [Value](/documentation/domain-configuration/#ValueType) classes is
overriding the standard `Object.equals(Object)` method.

If you don’t control the source code of a given Value class,
you can still change its comparing strategy by registering a custom comparator.

A [`CustomValueComparator`](https://github.com/javers/javers/blob/master/javers-core/src/main/java/org/javers/core/diff/custom/CustomValueComparator.java)
implements the single `boolean equals(a, b)` method:

```java
@FunctionalInterface
public interface CustomValueComparator<T> {
    boolean equals(T left, T right);
}
```

and it can be super-easily registered in JaversBuilder, for example:

```java
Javers javers = JaversBuilder.javers()
        .registerValue(BigDecimal.class, (a, b) -> a.intValue() == b.intValue()).build();

``` 

Given `equals()` method is used by JaVers to calculate both collection-to-collection diff
and property-to-property diff.
Note that for Value types, property-to-property diff is always a `ValueChange`.

Unlike `CustomPropertyComparator`
which offers great flexibility, 
`CustomValueComparator` is just a way to provide other `equals()` implementation for given Value class. 




