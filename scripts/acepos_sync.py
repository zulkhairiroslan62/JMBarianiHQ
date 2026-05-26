#!/usr/bin/env python3
"""
AcePOS Sales Sync Script
Syncs sales data from AcePOS to JM Bariani HQ system every 30 minutes

Requirements:
    pip install requests python-dotenv

Setup:
    1. Copy this file to: ~/JMBarianiHQ/scripts/acepos_sync.py
    2. Create .env file with:
       ACEPOS_API_KEY=your_acepos_api_key
       ACEPOS_MERCHANT_ID=your_merchant_id
       JMHQ_API_URL=http://localhost:3000/api/acepos/sync
    3. Make executable: chmod +x acepos_sync.py
    4. Setup cron: */30 * * * * /path/to/acepos_sync.py

Usage:
    python3 acepos_sync.py
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using system environment variables.")

# Configuration
ACEPOS_API_KEY = os.getenv('ACEPOS_API_KEY', '')
ACEPOS_MERCHANT_ID = os.getenv('ACEPOS_MERCHANT_ID', '')
ACEPOS_API_URL = os.getenv('ACEPOS_API_URL', 'https://api.acepos.biz/v1')
JMHQ_API_URL = os.getenv('JMHQ_API_URL', 'http://localhost:3000/api/acepos/sync')

# Outlet mapping (AcePOS outlet ID -> JM HQ outlet ID)
OUTLET_MAPPING = {
    'acepos_outlet_1': 'your_jmhq_outlet_id_1',  # Subang Jaya HQ
    'acepos_outlet_2': 'your_jmhq_outlet_id_2',  # Setia Alam
    'acepos_outlet_3': 'your_jmhq_outlet_id_3',  # Wangsa Walk
    'acepos_outlet_4': 'your_jmhq_outlet_id_4',  # IOI City Mall
}

# Log file
LOG_FILE = Path(__file__).parent / 'acepos_sync.log'


def log(message: str, level: str = 'INFO'):
    """Write log message to file and console"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(log_message + '\n')
    except Exception as e:
        print(f"Failed to write log: {e}")


def fetch_acepos_sales(outlet_id: str, from_time: datetime, to_time: datetime) -> List[Dict[str, Any]]:
    """
    Fetch sales data from AcePOS API
    
    NOTE: This is a template function. You need to adjust it based on actual AcePOS API documentation.
    AcePOS API endpoints and response format may differ.
    """
    if not ACEPOS_API_KEY or not ACEPOS_MERCHANT_ID:
        log("AcePOS credentials not configured", "ERROR")
        return []
    
    try:
        # Example API call - adjust based on actual AcePOS API
        headers = {
            'Authorization': f'Bearer {ACEPOS_API_KEY}',
            'Content-Type': 'application/json',
        }
        
        params = {
            'merchant_id': ACEPOS_MERCHANT_ID,
            'outlet_id': outlet_id,
            'from': from_time.isoformat(),
            'to': to_time.isoformat(),
        }
        
        # Adjust endpoint based on actual AcePOS API documentation
        response = requests.get(
            f'{ACEPOS_API_URL}/sales',
            headers=headers,
            params=params,
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Parse response - adjust based on actual AcePOS response format
        sales = []
        for transaction in data.get('transactions', []):
            for item in transaction.get('items', []):
                sales.append({
                    'item_name': item.get('name', ''),
                    'quantity': item.get('quantity', 1),
                    'total': item.get('total', 0),
                    'timestamp': transaction.get('timestamp', datetime.now().isoformat()),
                })
        
        return sales
        
    except requests.exceptions.RequestException as e:
        log(f"Failed to fetch AcePOS data for outlet {outlet_id}: {e}", "ERROR")
        return []
    except Exception as e:
        log(f"Unexpected error fetching AcePOS data: {e}", "ERROR")
        return []


def sync_to_jmhq(outlet_id: str, sales: List[Dict[str, Any]]) -> bool:
    """Send sales data to JM HQ system"""
    if not sales:
        log(f"No sales data to sync for outlet {outlet_id}", "INFO")
        return True
    
    try:
        payload = {
            'outlet_id': outlet_id,
            'sales': sales,
        }
        
        response = requests.post(
            JMHQ_API_URL,
            json=payload,
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        
        log(f"Sync completed for outlet {outlet_id}: {result.get('results', {})}", "INFO")
        return True
        
    except requests.exceptions.RequestException as e:
        log(f"Failed to sync to JM HQ for outlet {outlet_id}: {e}", "ERROR")
        return False
    except Exception as e:
        log(f"Unexpected error syncing to JM HQ: {e}", "ERROR")
        return False


def main():
    """Main sync process"""
    log("=== AcePOS Sync Started ===", "INFO")
    
    # Validate configuration
    if not JMHQ_API_URL:
        log("JMHQ_API_URL not configured", "ERROR")
        sys.exit(1)
    
    # Sync period: last 30 minutes
    to_time = datetime.now()
    from_time = to_time - timedelta(minutes=30)
    
    log(f"Syncing sales from {from_time} to {to_time}", "INFO")
    
    # Process each outlet
    success_count = 0
    failed_count = 0
    
    for acepos_outlet_id, jmhq_outlet_id in OUTLET_MAPPING.items():
        log(f"Processing outlet: {acepos_outlet_id} -> {jmhq_outlet_id}", "INFO")
        
        # Fetch sales from AcePOS
        sales = fetch_acepos_sales(acepos_outlet_id, from_time, to_time)
        
        if sales:
            log(f"Fetched {len(sales)} sales transactions", "INFO")
            
            # Sync to JM HQ
            if sync_to_jmhq(jmhq_outlet_id, sales):
                success_count += 1
            else:
                failed_count += 1
        else:
            log(f"No sales data found for outlet {acepos_outlet_id}", "INFO")
            success_count += 1  # No data is not a failure
    
    log(f"=== Sync Completed: {success_count} success, {failed_count} failed ===", "INFO")
    
    if failed_count > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
