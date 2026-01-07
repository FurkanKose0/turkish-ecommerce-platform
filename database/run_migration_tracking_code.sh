#!/bin/bash
# Migration script to add tracking_code column to orders table

echo "Running migration: Add tracking_code column to orders table..."

psql -h localhost -p 5432 -U postgres -d eticaret_sql -f database/migration_add_tracking_code.sql

echo "Migration completed!"
