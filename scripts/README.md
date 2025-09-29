# Trip Backup to Firestore

This folder contains scripts to backup your trips data from the Django backend to Firestore for safety.

## Setup Instructions

1. **Download Firebase Service Account Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Rename it to `serviceAccountKey.json`
   - Place it in this `scripts/` folder

2. **Run the Backup Script:**
   ```bash
   cd scripts
   python backup_trips_to_firestore.py
   ```

## What the Script Does

- Fetches all trips from your local Django backend (http://127.0.0.1:8000/api/trips/)
- Uploads them to Firestore in a `trips` collection
- Adds backup metadata (timestamp, source)
- Provides verification of successful upload

## Next Steps After Backup

1. Fix the VM backend issues
2. Once VM is working, you can either:
   - Keep using Firestore as backup
   - Restore trips from Firestore to VM if needed
   - Use Firestore as primary data source temporarily

## Troubleshooting

- Make sure your local Django backend is running: `python manage.py runserver 127.0.0.1:8000`
- Ensure `serviceAccountKey.json` is in the correct location
- Check Firebase project permissions allow Firestore access