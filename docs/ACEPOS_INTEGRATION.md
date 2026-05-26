# AcePOS Integration Setup Guide

## Overview
This integration syncs sales data from AcePOS (acepos.biz) to JM Bariani HQ system every 30 minutes using a Python script.

## Architecture
```
AcePOS API → Python Script (every 30 min) → JM HQ API → Database
```

## Prerequisites
- Python 3.8+
- pip (Python package manager)
- AcePOS API credentials (API key, Merchant ID)
- JM HQ system running (localhost:3000 or production URL)

## Installation Steps

### 1. Install Python Dependencies
```bash
cd ~/JMBarianiHQ
pip install requests python-dotenv
```

### 2. Get Your Outlet IDs
Run this command to get your JM HQ outlet IDs:
```bash
cd ~/JMBarianiHQ
npx prisma studio
```
Or check the database directly. You'll need these IDs for the mapping.

### 3. Configure Environment Variables
Create a `.env` file in the scripts directory:
```bash
cd ~/JMBarianiHQ/scripts
nano .env
```

Add the following configuration:
```env
# AcePOS API Credentials
ACEPOS_API_KEY=your_acepos_api_key_here
ACEPOS_MERCHANT_ID=your_merchant_id_here
ACEPOS_API_URL=https://api.acepos.biz/v1

# JM HQ API URL
JMHQ_API_URL=http://localhost:3000/api/acepos/sync
# For production: JMHQ_API_URL=https://your-domain.com/api/acepos/sync
```

### 4. Update Outlet Mapping
Edit `scripts/acepos_sync.py` and update the `OUTLET_MAPPING` dictionary (around line 45):

```python
OUTLET_MAPPING = {
    'acepos_outlet_1': 'clxxxxx1',  # Subang Jaya HQ
    'acepos_outlet_2': 'clxxxxx2',  # Setia Alam
    'acepos_outlet_3': 'clxxxxx3',  # Wangsa Walk
    'acepos_outlet_4': 'clxxxxx4',  # IOI City Mall
}
```

Replace:
- `acepos_outlet_1`, etc. with your actual AcePOS outlet IDs
- `clxxxxx1`, etc. with your actual JM HQ outlet IDs (from step 2)

### 5. Test the Script Manually
```bash
cd ~/JMBarianiHQ/scripts
python3 acepos_sync.py
```

Check the log file:
```bash
cat acepos_sync.log
```

### 6. Setup Cron Job (Auto-sync every 30 minutes)
```bash
crontab -e
```

Add this line:
```cron
*/30 * * * * cd /home/zulkhairi/JMBarianiHQ/scripts && /usr/bin/python3 acepos_sync.py >> acepos_sync.log 2>&1
```

Save and exit. The script will now run automatically every 30 minutes.

## API Endpoints

### POST /api/acepos/sync
Receives sales data from AcePOS sync script.

**Request Body:**
```json
{
  "outlet_id": "clxxxxx1",
  "sales": [
    {
      "item_name": "Nasi Bariani Ayam",
      "quantity": 2,
      "total": 30.00,
      "timestamp": "2026-05-26T10:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Sync completed",
  "outlet": "Subang Jaya (HQ)",
  "results": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

### GET /api/acepos/sync?outlet_id=clxxxxx1
Check sync status and today's sales.

**Response:**
```json
{
  "outlet_id": "clxxxxx1",
  "today_sales_count": 145,
  "today_revenue": 4250.50,
  "last_sync": "2026-05-26T10:30:00Z"
}
```

## Customizing AcePOS API Integration

The `fetch_acepos_sales()` function in `acepos_sync.py` is a **template**. You need to adjust it based on actual AcePOS API documentation:

1. Check AcePOS API docs for correct endpoints
2. Update authentication headers
3. Adjust request parameters
4. Parse response format correctly

**Example adjustment:**
```python
# If AcePOS uses different authentication
headers = {
    'X-API-Key': ACEPOS_API_KEY,  # Instead of Bearer token
    'X-Merchant-ID': ACEPOS_MERCHANT_ID,
}

# If AcePOS has different endpoint structure
response = requests.get(
    f'{ACEPOS_API_URL}/merchants/{ACEPOS_MERCHANT_ID}/outlets/{outlet_id}/transactions',
    headers=headers,
    params={'from': from_time, 'to': to_time}
)
```

## Troubleshooting

### Script fails with "AcePOS credentials not configured"
- Check `.env` file exists in `scripts/` directory
- Verify `ACEPOS_API_KEY` and `ACEPOS_MERCHANT_ID` are set

### Script fails with "Outlet not found"
- Verify outlet IDs in `OUTLET_MAPPING` match your database
- Run `npx prisma studio` to check outlet IDs

### No sales data syncing
- Check AcePOS API credentials are correct
- Verify AcePOS API endpoint URL is correct
- Check `acepos_sync.log` for error messages
- Test AcePOS API manually with curl

### Menu items not matching
- Ensure menu item names in JM HQ match AcePOS exactly
- The script uses fuzzy matching (contains) but exact names work best

## Monitoring

### Check sync logs
```bash
tail -f ~/JMBarianiHQ/scripts/acepos_sync.log
```

### Check cron job status
```bash
crontab -l
```

### Test API endpoint manually
```bash
curl -X POST http://localhost:3000/api/acepos/sync \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_id": "your_outlet_id",
    "sales": [
      {
        "item_name": "Nasi Bariani Ayam",
        "quantity": 1,
        "total": 15.00,
        "timestamp": "2026-05-26T10:00:00Z"
      }
    ]
  }'
```

## Security Notes

- Keep `.env` file secure (never commit to git)
- Use HTTPS for production API URLs
- Rotate API keys regularly
- Monitor sync logs for suspicious activity

## Support

For issues with:
- **AcePOS API**: Contact AcePOS support (acepos.biz)
- **JM HQ System**: Check application logs or contact system admin
- **Python Script**: Check `acepos_sync.log` for detailed error messages
