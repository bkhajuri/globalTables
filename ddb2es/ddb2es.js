/*
Burhani Fakhruddin
 */

'use strict';

const AWS = require('aws-sdk');
const credentials = new AWS.EnvironmentCredentials('AWS');
const path = require('path');

/************************************
*  DR environment
*************************************/
const sourceDDBRegion = "eu-west-1"
var esDomain = {
    region: process.env.AWS_REGION,
    endpoint: 'https://search-adesaworld53-a5wnfhh4jb6fzoxykqmef6z4xi.eu-central-1.es.amazonaws.com',
    index: 'vehicles',
    doctype: 'vehicle'
};

// ElasticSearch endpoint
const endpoint = new AWS.Endpoint(esDomain.endpoint);

function error(err, callback) {
    var errorMessage = process.env.AWS_LAMBDA_FUNCTION_NAME + " Error: " + err;
    console.log(errorMessage);
    callback(errorMessage);
}

function log(message) {
    console.log(message);
}

function buildESRequest(method, path, body) {
    var req = new AWS.HttpRequest(endpoint);
    req.method = method;
    req.path = path;
    req.region = esDomain.region;
    req.headers['presigned-expires'] = false;
    req.headers['host'] = endpoint.host;
    req.headers['content-type'] = "application/json";
    if (body !== undefined) {
        req.body = body;
    }
    var signer = new AWS.Signers.V4(req, 'es');  // es: service code
    signer.addAuthorization(credentials, new Date());
    log("ES request: " + JSON.stringify(req));
    return req;
}

function writeToES(id, doc, callback) {
    var req = buildESRequest('POST', path.join('/', esDomain.index, esDomain.doctype, id), doc);
    var send = new AWS.HttpClient();
    send.handleRequest(req, null, function (httpResp) {
        var respBody = '';
        httpResp.on('error', function (err) {
            error("Could not write record to ES: " + doc + " - " + err, callback);
        });
        httpResp.on('data', function (chunk) {
            respBody += chunk;
        });
        httpResp.on('end', function (chunk) {
            log('Record successfully written to ES: ' + respBody);
        });
    }, function (err) {
        error("Could not write record to ES: " + doc + " - " + err, callback);
    });
}

function deleteFromES(id, callback) {
    var req = buildESRequest('DELETE', path.join('/', esDomain.index, esDomain.doctype, id));
    var send = new AWS.HttpClient();
    send.handleRequest(req, null, function (httpResp) {
        var respBody = '';
        httpResp.on('error', function (err) {
            error("Could not delete record from ES: (Id=" + id + ") - " + err, callback);
        });
        httpResp.on('data', function (chunk) {
            respBody += chunk;
        });
        httpResp.on('end', function (chunk) {
            log('Record successfully deleted from  ES: (Id=' + id + ')');
        });
    }, function (err) {
        error("Could not delete record from ES: (Id=" + id + ") - " + err, callback);
    });
}

function importDDBDataToES(records, callback) {
    records.forEach((event) => {
        log('Received DynamoDB Stream event: ' + JSON.stringify(event.dynamodb));
        // We only process stream events that Add/Update items
        if (event.dynamodb.NewImage !== undefined) {
            let ddbRecord = AWS.DynamoDB.Converter.unmarshall(event.dynamodb.NewImage);
            // Is the stream event coming from a region we care about (in DR that's Prod and vice-versa)
            if (ddbRecord["aws:rep:updateregion"] === sourceDDBRegion) {
                const eventName = ddbRecord.action.toUpperCase();
                if (eventName === 'CREATE' || eventName === 'UPDATE') {
                    log("Adding record to ES: " + ddbRecord.vehicle);
                    writeToES(ddbRecord.stockId, ddbRecord.vehicle, callback);
                }
                else if (eventName === 'DELETE') {
                    log("Removing record from ES: (stockId=" + ddbRecord.stockId + ")");
                    deleteFromES(ddbRecord.stockId, callback);
                }
                else {
                    error("Invalid DDB Stream event name: " + event.eventName + ". Expected values are: 'create', 'delete', or 'update'.", callback);
                }
            }
        }
        // skip stream events that delete items
        else {
            log("Skipping deletion event: " + event);
        }
    });
    callback(null, `Successfully processed ${records.length} record(s).`);
}


exports.handler = (event, context, callback) => {
    try {
        log("Running Lambda: " + process.env.AWS_LAMBDA_FUNCTION_NAME);
        log("Event: " + JSON.stringify((event)));
        log("Context: " + JSON.stringify((context)));
        log("Process.env: " + JSON.stringify((process.env)));
        if (event.Records !== undefined) {
            importDDBDataToES(event.Records, callback);
        }else {
            callback(null, "No DynamoDB Stream events received. Nothing to do.");
        }
    }
    catch(e) {
        error(e);
    }
};
