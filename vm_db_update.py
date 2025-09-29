#!/usr/bin/env python3
import sqlite3
import os

# Connect to the database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print('=== BEFORE DELETION ===')
    cursor.execute('SELECT COUNT(*) FROM trips_trip')
    total_before = cursor.fetchone()[0]
    print(f'Total trips: {total_before}')
    
    print()
    print('=== DELETING UNWANTED TRIPS ===')
    trips_to_delete = [
        'Rajasthan Cultural Heritage Tour',
        'Goa Beach Retreat', 
        'Kashmir Valley Adventure'
    ]
    
    for trip_title in trips_to_delete:
        cursor.execute('DELETE FROM trips_trip WHERE title = ?', (trip_title,))
        if cursor.rowcount > 0:
            print(f'✓ Deleted: {trip_title}')
        else:
            print(f'⚠️  Not found: {trip_title}')
    
    conn.commit()
    
    print()
    print('=== AFTER DELETION ===')
    cursor.execute('SELECT COUNT(*) FROM trips_trip')
    total_after = cursor.fetchone()[0]
    print(f'Total trips remaining: {total_after}')
    print(f'Trips removed: {total_before - total_after}')
    
    print()
    print('=== REMAINING TRIPS ===')
    cursor.execute('SELECT title FROM trips_trip ORDER BY id')
    remaining_trips = cursor.fetchall()
    for i, trip in enumerate(remaining_trips, 1):
        print(f'{i}. {trip[0]}')
    
    conn.close()
    
    if total_after == 8:
        print()
        print('✅ SUCCESS: VM database now has 8 trips (3 removed)!')
    else:
        print()
        print(f'❌ Warning: Expected 8 trips but found {total_after}')
else:
    print('❌ Database file not found!')