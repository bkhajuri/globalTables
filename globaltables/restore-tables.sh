#!/bin/bash

set -e

table_filter="./dynamotables/adesaworld*.json"
table_files=$( ls $table_filter )

. ./config.sh    

for table_file in $table_files ; do
    table_name=`./jq  --raw-output '.TableName' $table_file`
    echo "Restoring data into table: '${table_name}' at AWS Region: $PROD_REGION from folder: $backup_folder"
    ( cd ./dynamodump && python3 dynamodump.py --dumpPath $backup_folder -m restore --dataOnly -r $PROD_REGION -s ${table_name} -p $AWS_PROFILE & )
done