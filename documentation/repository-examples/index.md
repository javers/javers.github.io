---
layout: docs
title: Documentation - Repository examples
---

# Repository examples #

<a name="commit-changes"></a>
### Commit changes ###

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
### Read snapshots history ###

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
### Read changes history ###
     
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