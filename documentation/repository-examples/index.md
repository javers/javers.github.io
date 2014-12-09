---
layout: docs
title: Documentation - Repository examples
---

# Repository examples #

<a name="commit-changes"></a>
### Commit changes

Whenever your domain object changes you have to persist details about the change. You can do this with a call ```commit``` method on Javers 
instance:


```java           
        import org.javers.core.Javers;
        import javax.persistence.Id;
        import java.net.UnknownHostException;
                    
        public static void main(String[] args) throws UnknownHostException {
                Javers javers; //provide javers with registered repository
                String author = "Pawel";
        
                MyEntity myEntity = new MyEntity(1, "Some test value");
        
                //initial commit
                javers.commit(author, myEntity);
                
                //change something and commit again
                myEntity.setValue("Another test value");
                javers.commit(author, myEntity);
            }
        
            private static class MyEntity {
        
                @Id
                private int id;
                private String value;
        
                private MyEntity(int id, String value) {
                    this.id = id;
                    this.value = value;
                }
        
                public void setValue(String value) {
                    this.value = value;
                }
            } 
```
             
<a name="read-snapshots-history"></a>
### Read snapshots history

Having some commits executed you can read the list of persisted snapshots from the repository. 
In order to read snapshots you have to provide:
    <ul>
        <li>entity id</li>
        <li>entity class</li>
        <li>maximum number of snapshots to download</li>
    </ul>    
    
Javers read snapshots in the reversed chronological order. For example if you set the limit to 10 Javers returns the list of 10 latest 
snapshots.
   

```java        
        public static void main(String[] args) {
            Javers javers = JaversBuilder.javers().build();
            MyEntity entity = new MyEntity(1, "some value");
            javers.commit("author", entity);
            entity.setValue("another value");
            javers.commit("author", entity);

            //get state history
            List<CdoSnapshot> stateHistory = javers.getStateHistory(1, MyEntity.class, 100);
            System.out.println("Snapshots count: " + stateHistory.size());

            //snapshot after initial commit
            CdoSnapshot v1 = stateHistory.get(1);
            System.out.println("Property value after first commit: " + v1.getPropertyValue("value"));

            //second snapshot
            CdoSnapshot v2 = stateHistory.get(0);
            System.out.println("Property value after second commit: " + v2.getPropertyValue("value"));
        }

    private static class MyEntity {

        @Id
        private int id;
        private String value;

        private MyEntity(int id, String value) {
            this.id = id;
            this.value = value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }
```    
    
output:
    
    Changes count: 2
    Property value after first commit: some value
    Property value after second commit: another value
    
<a name="read-changes-history"></a>
### Read changes history
     
If you want to read changes for a given entity, Javers can calculate diffs from persisted snapshots.
In order read changes you have to provide:
     <ul>
         <li>entity id</li>
         <li>entity class</li>
         <li>maximum number of snapshots to download</li>
     </ul>    
Javers read changes in reverse chronological order, so for example if you set limit to 10 Javers returns 10 newest changes.


```java
    public static void main(String[] args) {
            Javers javers = JaversBuilder.javers().build();
            MyEntity entity = new MyEntity(1, "some value");

            //initial commit
            javers.commit("author", entity);

            //some change
            entity.setValue("another value");

            //commit after change
            javers.commit("author", entity);

            //get state history
            List<Change> stateHistory = javers.getChangeHistory(1, MyEntity.class, 100);
            System.out.println("Changes count: " + stateHistory.size());

            //snapshot after initial commit
            ValueChange change = (ValueChange) stateHistory.get(0);
            System.out.println("Property value before change: " + change.getLeft());
            System.out.println("Property value after change: " + change.getRight());
        }


        private static class MyEntity {

            @Id
            private int id;
            private String value;

            private MyEntity(int id, String value) {
                this.id = id;
                this.value = value;
            }

            public void setValue(String value) {
                this.value = value;
            }
        }
```        
        
output:

        Changes count: 1
        Property value before change: some value
        Property value after change: another value

<a name="json-type-adapter"></a>
###JSON TypeAdapter for ObjectId

*JsonTypeAdapter* allows you to customize how JaVers
serialize your [Value types](/documentation/configuration#ValueType) to JSON.
That is especially important for complex Id types like
[<tt>org.bson.types.ObjectId</tt>](http://api.mongodb.org/java/2.0/org/bson/types/ObjectId.html) class,
often used as *Id-property* for objects persisted in MongoDB.

Consider following domain *Entity*:

```java
package org.javers.core.cases.morphia;

import org.bson.types.ObjectId;
... // omitted

@Entity
public class MongoStoredEntity {
    @Id
    private ObjectId _id;

    private String name;
    ... // omitted
}
```


Without custom *JsonTypeAdapter*, ObjectId is serialized using its 4 internal fields
as follows:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    <span class='s2'>"cdoId": {
      "_time": 1417358422,
      "_machine": 1904935013,
      "_inc": 1615625682,
      "_new": true
    }</span>
  }
</pre>

In this example we show, how to turn this verbose JSON into something neat like this:

<pre>
  "globalId": {
    "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
    <span class='s2'>"cdoId": "54789e5cfb2ca07e65130e7c"</span>
    },
</pre>

**The case**<br/>
Our goal is to improve JSON serialization of <tt>ObjectId</tt>
used as Id in domain *Entity* &mdash; <tt>MongoStoredEntity</tt>.

**Configuration** <br/>
First we need to implement the JSON *TypeAdapter*.
In this case, we recommend extending
[`BasicStringTypeAdapter`]({{ site.javadoc_url }}index.html?org/javers/core/json/BasicStringTypeAdapter.html) abstract class.

<tt>ObjectIdTypeAdapter.class :</tt>

```java
package org.javers.core.examples.adapter;

import org.bson.types.ObjectId;
import org.javers.core.json.BasicStringTypeAdapter;

public class ObjectIdTypeAdapter extends BasicStringTypeAdapter {

    @Override
    public String serialize(Object sourceValue) {
        return sourceValue.toString();
    }

    @Override
    public Object deserialize(String serializedValue) {
        return new ObjectId(serializedValue);
    }

    @Override
    public Class getValueType() {
        return ObjectId.class;
    }
}
```

Then, our *TypeAdapter* should be registered in *JaversBuilder*:

    JaversBuilder.javers().registerValueTypeAdapter(new ObjectIdTypeAdapter())

That's it! Runnable example is shown below.

<tt>[JsonTypeAdapterExample.class](http://github.com/javers/javers/blob/master/javers-core/src/test/java/org/javers/core/examples/JsonTypeAdapterExample.java)</tt>:

```java
package org.javers.core.examples;

import org.bson.types.ObjectId;
import org.fest.assertions.api.Assertions;
import org.javers.core.Javers;
import org.javers.core.JaversBuilder;
import org.javers.core.cases.morphia.MongoStoredEntity;
import org.javers.core.diff.Diff;
import org.javers.core.examples.adapter.ObjectIdTypeAdapter;
import org.junit.Test;

public class JsonTypeAdapterExample {

    @Test
    public void shouldSerializeValueToJsonWithTypeAdapter() {
        //given
        Javers javers = JaversBuilder.javers()
                .registerValueTypeAdapter(new ObjectIdTypeAdapter())
                .build();

        //when
        ObjectId id = ObjectId.get();
        MongoStoredEntity entity1 = new MongoStoredEntity(id, "alg1", "1.0", "name");
        MongoStoredEntity entity2 = new MongoStoredEntity(id, "alg1", "1.0", "another");
        Diff diff = javers.compare(entity1, entity2);

        //then
        String json = javers.toJson(diff);
        Assertions.assertThat(json).contains(id.toString());

        System.out.println(json);
    }
}
```

Output of running this program is:

<pre>
{
  "changes": [
    {
      "changeType": "ValueChange",
      "globalId": {
        "entity": "org.javers.core.cases.morphia.MongoStoredEntity",
        <span class='s2'>"cdoId": "54876f694b9d4135b0b179ec"</span>
      },
      "property": "_name",
      "left": "name",
      "right": "another"
    }
  ]
}
</pre>