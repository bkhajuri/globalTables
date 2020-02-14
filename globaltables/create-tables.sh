#!/bin/bash

set -e

. ./config.sh

echo "Creating tables in region $PROD_REGION"    
(export AWS_DEFAULT_REGION=$PROD_REGION && ./create-tables-original.sh)

echo "Creating tables in region $DR_REGION"    
(export AWS_DEFAULT_REGION=$DR_REGION && ./create-tables-original.sh)
