
# Steps to Globalize existing tables

__ATTENTION: DO NOT RUN ANY OF THESE STEPS WHEN THE ADESA GLOBAL SYSTEM IS IN PRODUCTION. THIS IS A ONE TIME OPERATION TO CONVERT EXISTING DYNAMODB TABLES INTO GLOBAL TABLES BEFORE PRODUCTION TIME.__

## Setup

```bash
  cd globaltables/
  chmod +x *.sh
  chmod +x jq
  cd dynamodump/
  npm install -r requirements.txt
  cd ..
```

Make sure the AWS Regions for Prod and DR regions are properly set in ```config.sh```

```bash
# Prod region
export PROD_REGION="eu-west-1"
# DR region
export DR_REGION="eu-central-1"
```

Also, export the AWS_PROFILE to point to your Prod profile:

```bash
   export AWS_PROFILE=(your-prod-profile)
```

## Backup Prod tables

```bash
  ./backup-tables.sh
```

## Delete Prod and DR tables

```bash
  ./delete-tables.sh
```

## Recreate Prod and DR tables

```bash
  ./create-tables.sh
```

## Globalize Tables

```bash
  ./globalize-tables.sh
```

## Restore Data to Prod Tables (Replication to DR is automatic)

```bash
  ./restore-tables.sh
```


