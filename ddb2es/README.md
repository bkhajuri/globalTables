
## Intro

This Lambda function will typically run on the DR site (Frankfurt) and will consume streams coming from PROD (Ireland) into DynamoDB table __adesaworld_inventorybackup__ and apply the stream changes (adds/updates/deletes) to the ElasticSearch cluster in DR. 

In the event of a disaster DR becomes production and the Lambda function now operates in the opposite direction, ie, being in Prod and consuming streams coming from DR. The Lambda will ignore stream events coming from the same region as the Lambda to prevent writing to same-region ElasticSearch cluster twice.

## Instructions

* Create an IAM role for the Lambda function if one does not exist. The role should allow Lambda to access resouces such as the DynamoDB __adesaworld_inventorybackup__ table and the ElasticSearch cluster.
* Deploy the Lambda in the desired region (eg, DR or Prod) - make sure region-specific parameters are configured properly.
* Create a DynamoDB trigger for table __adesaworld_inventorybackup__ and target the Lambda function

## Errors

If the Lambda function ever fails during execution, DynamoDB stream consumption will stop (this enforces that events must be consumed in order) until the function is back to a healthy state.

