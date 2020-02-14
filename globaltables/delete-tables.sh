#!/bin/bash

# set -e

table_filter="./dynamotables/adesaworld*.json"
table_files=$( ls $table_filter )

. ./config.sh    

for table_file in $table_files ; do
    table_name=`./jq  --raw-output '.TableName' $table_file`
    echo "Deleting table: '${table_name}' from region $PROD_REGION"
    /Users/burhani.fakhruddin/aws dynamodb delete-table \
       --table-name $table_name \
       --region $PROD_REGION
    echo "Deleting table: '${table_name}' from region $DR_REGION"
    /Users/burhani.fakhruddin/aws dynamodb delete-table \
       --table-name $table_name \
       --region $DR_REGION
done