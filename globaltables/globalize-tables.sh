#!/bin/bash

set -e

table_filter="./dynamotables/adesaworld*.json"
table_files=$( ls $table_filter )

. ./config.sh    

for table_file in $table_files ; do
    table_name=`./jq  --raw-output '.TableName' $table_file`
    echo "Globalizing table: '${table_name}'"
    
    /Users/burhani.fakhruddin/aws dynamodb create-global-table \
       --global-table-name $table_name \
       --replication-group RegionName=$PROD_REGION RegionName=$DR_REGION \
       --region $PROD_REGION
done
