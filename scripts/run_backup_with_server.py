import subprocess
import time
import requests
import os
import sys

def start_django_server():
    """Start Django server in background"""
    print("🚀 Starting Django server...")

    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    os.chdir(backend_dir)

    # Start server as subprocess
    server_process = subprocess.Popen([
        sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    print("⏳ Waiting for server to start...")
    time.sleep(5)  # Wait for server to start

    # Test if server is responding
    try:
        response = requests.get('http://127.0.0.1:8000/api/trips/', timeout=5)
        if response.status_code == 200:
            print("✅ Django server started successfully")
            return server_process
        else:
            print(f"❌ Server started but not responding correctly: {response.status_code}")
            server_process.terminate()
            return None
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        server_process.terminate()
        return None

def run_backup():
    """Run the backup script"""
    print("\n📦 Running trip backup...")
    scripts_dir = os.path.dirname(__file__)
    backup_script = os.path.join(scripts_dir, 'backup_trips_to_firestore.py')

    result = subprocess.run([sys.executable, backup_script], capture_output=True, text=True)

    print("Backup output:")
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)

    return result.returncode == 0

def main():
    print("🔄 Starting Django server and running backup")
    print("=" * 50)

    # Start server
    server_process = start_django_server()
    if not server_process:
        print("❌ Failed to start Django server. Exiting.")
        return

    try:
        # Run backup
        success = run_backup()

        if success:
            print("\n🎉 Backup completed successfully!")
        else:
            print("\n❌ Backup failed!")

    finally:
        # Clean up server
        print("\n🛑 Stopping Django server...")
        server_process.terminate()
        server_process.wait()
        print("✅ Server stopped")

if __name__ == '__main__':
    main()