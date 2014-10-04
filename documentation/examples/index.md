---
layout: docs
title: Documentation - Examples
---

# Examples #

## Diff ##

<a name="compare-entities"></a>
### Compare Entities ###

To find diff between two entities you don't have to register entity class in Javers building process. Javers  automatically discover type of 
object. If Javers find @Id annotation in proper place then it will be recognize as Entity, in other way it will be recognized as 
ValueObject.

The object has to be the same class and has to be object of custom class (you can't compare standard Java objects)


```java
    private static class User {

        @Id
        private int id;
        private String name;

        public User(int id, String name) {
            this.id = id;
            this.name = name;
        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }

    public static void main(String[] args) {
        Javers javers = JaversBuilder
                            .javers()
                            .registerEntities(User.class)
                            .build();

        User johny = new User(25, "Johny");
        User tommy = new User(25, "Tommy");

        Diff diff = javers.compare(johny, tommy);
        List<Change> changes = diff.getChanges();
        ValueChange change = (ValueChange) changes.get(0);

        System.out.println("Changes size: " + changes.size());
        System.out.println("Entity id: " + change.getAffectedCdoId().getCdoId());
        System.out.println("Property changed: "  + change.getProperty());
        System.out.println("Property value before changed: " + change.getLeft());
        System.out.println("Property value after changed: "  + change.getRight());
    }
```    

Output of running this program is:

        Changes size: 1
        Entity id: 25
        Property: User.name
        Property value before change: Johny
        Property value after change: Tommy

<a name="compare-valueobjects"></a>
### Compare Value Objects ###

If you don't put @Id annotation in the class definition Javers recognize object as Value Object. Javers compare property by property and 
returns ```ValueObject``` changes:


```java
     public static void main(String[] args) {
        Javers javers = JaversBuilder
                            .javers()
                            .build();

        User johny = new User(25, "Johny");
        User tommy = new User(26, "Charlie");

        Diff diff = javers.compare(johny, tommy);
        List<Change> changes = diff.getChanges();
        ValueChange change1 = (ValueChange) changes.get(0);
        ValueChange change2 = (ValueChange) changes.get(1);

        System.out.println("Changes size: " + changes.size());
        System.out.println("Changed property: " + change1.getProperty());
        System.out.println("Value before change: " + change1.getLeft());
        System.out.println("Value after change: " + change1.getRight());
        System.out.println("Changed property: " + change2.getProperty());
        System.out.println("Value before change: " + change2.getLeft());
        System.out.println("Value after change: " + change2.getRight());
    }
```    

Output:

        Changes size: 2
        Changed property: User.id
        Value before change: 25
        Value after change: 26
        Changed property: User.name
        Value before change: Johny
        Value after change: Charlie
        
## Audit ##
   
<a name="commit-changes"></a>
### Commit changes ###

When your domain object has changed you probably want to persist details about this change. You can do this by call ```commit``` method on 
Javers instance:


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
### Read snapshots history ###

After taking some commits you can read persisted snapshots from repository. 
To read snapshots you have to provide:
    <ul>
        <li>entity id</li>
        <li>entity class</li>
        <li>maximum number of snapshots to download</li>
    </ul>    
    
Javers read snapshots in reverse chronological order, so for example if you set limit to 10 Javers returns 10 newest snapshots.
   

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
### Read changes history ###
     
If you want to read changes of given entity Javers can calculate diffs from persisted snapshots.
To read changes you have to provide:
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