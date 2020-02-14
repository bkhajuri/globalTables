 curl -XDELETE https://search-adesaworld53-dvdatbppe3iiddqs-1.es.amazonaws.com/.kibana

 curl -XPOST https://search-adesaworld53-dvdatbppe3iiddqsunrywv4k6u.eu-central-1.es.amazonaws.com/_reindex -d '
{
"source": {
"index": "restored_.kibana"
},
"dest": {
"index": ".kibana"
}
}'
