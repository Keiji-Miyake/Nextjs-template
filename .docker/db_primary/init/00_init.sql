CREATE USER replicator WITH REPLICATION;
SELECT PG_CREATE_PHYSICAL_REPLICATION_SLOT('replication_slot');