#!/usr/bin/env python3
"""
VM Health Monitor
Monitors the VM backend and provides status updates
"""

import requests
import time
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VMHealthMonitor:
    def __init__(self):
        self.vm_url = "http://68.233.115.38:8000"
        self.api_endpoint = f"{self.vm_url}/api/trips/"
        self.health_endpoint = f"{self.vm_url}/health/"
        self.status_file = "vm_status.json"
        
    def check_vm_health(self):
        """Check VM health and return status"""
        try:
            # Test basic connectivity
            response = requests.get(self.api_endpoint, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trips_count = len(data.get('results', []) if isinstance(data, dict) else data)
                
                status = {
                    "timestamp": datetime.now().isoformat(),
                    "status": "healthy",
                    "response_time": response.elapsed.total_seconds(),
                    "trips_count": trips_count,
                    "status_code": response.status_code
                }
                logger.info(f"✅ VM is healthy - {trips_count} trips available")
                return status
            else:
                logger.warning(f"⚠️ VM responded with status {response.status_code}")
                return {
                    "timestamp": datetime.now().isoformat(),
                    "status": "degraded",
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds()
                }
                
        except requests.exceptions.ConnectTimeout:
            logger.error("❌ VM connection timed out")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "timeout",
                "error": "Connection timeout"
            }
        except requests.exceptions.ConnectionError:
            logger.error("❌ VM connection failed")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "down",
                "error": "Connection refused"
            }
        except Exception as e:
            logger.error(f"❌ VM health check failed: {e}")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e)
            }
    
    def save_status(self, status):
        """Save status to file"""
        try:
            with open(self.status_file, 'w') as f:
                json.dump(status, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save status: {e}")
    
    def get_last_status(self):
        """Get last saved status"""
        try:
            with open(self.status_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Failed to load status: {e}")
            return None
    
    def monitor_once(self):
        """Run a single health check"""
        status = self.check_vm_health()
        self.save_status(status)
        return status
    
    def monitor_continuous(self, interval=30):
        """Monitor continuously"""
        logger.info(f"Starting continuous monitoring (interval: {interval}s)")
        
        while True:
            try:
                status = self.monitor_once()
                time.sleep(interval)
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Monitor error: {e}")
                time.sleep(interval)

def main():
    monitor = VMHealthMonitor()
    
    # Run single check
    print("🔍 Checking VM health...")
    status = monitor.monitor_once()
    
    print(f"\n📊 VM Status Report")
    print("=" * 50)
    print(f"Status: {status['status']}")
    print(f"Timestamp: {status['timestamp']}")
    
    if status['status'] == 'healthy':
        print(f"✅ VM is healthy")
        print(f"Response time: {status.get('response_time', 'N/A')}s")
        print(f"Trips available: {status.get('trips_count', 'N/A')}")
    else:
        print(f"❌ VM has issues")
        if 'error' in status:
            print(f"Error: {status['error']}")
    
    print(f"\n💡 Recommendations:")
    if status['status'] == 'down':
        print("- VM appears to be down - check VM status")
        print("- Verify VM is running and accessible")
        print("- Check network connectivity")
        print("- Frontend will automatically use fallback data")
    elif status['status'] == 'timeout':
        print("- VM is slow to respond - check VM performance")
        print("- Consider restarting VM services")
    elif status['status'] == 'healthy':
        print("- VM is working normally")
        print("- No action needed")

if __name__ == "__main__":
    main()