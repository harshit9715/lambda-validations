import AWS from "./utils/aws-sdk";
import dynamodb from './utils/dynamodb-lib';
const s3 = new AWS.S3();

// env vars
const TableName = process.env.TABLE_NAME,
    partitionKeyName = process.env.PARTITION_KEY_NAME,
    sortKeyName = process.env.SORT_KEY_NAME,
    BucketName = process.env.BUCKET_NAME,
    LAST_X_HOURS = process.env.LAST_X_HOURS;

export const main = async () => {
    // get all records from last 3 hours.
    let partitionKeyValue = new Date().toISOString().split('T')[0],
        pastDate = addHoursToDate(-LAST_X_HOURS).toISOString(),
        sortKeyValue = pastDate.split('T')[1],
        condition = "#pk=:pk and #sk>=:skv",
        expVals = { ":pk": partitionKeyValue, ":skv": sortKeyValue };

    let params = {
        TableName,
        KeyConditionExpression: condition,
        ExpressionAttributeNames: { "#pk": partitionKeyName, "#sk": sortKeyName, "#Data": "Data" },
        ExpressionAttributeValues: expVals,
        ProjectionExpression: "#Data",
    };
    let data = await getAllData(params);
    console.log(JSON.stringify(data));
    let s3params = {
        Body: JSON.stringify(data),
        Bucket: BucketName,
        Key: `${pastDate.split('T')[0]}/${Math.floor(Number(sortKeyValue.split(':')[0])/LAST_X_HOURS)}.json` // `${pastDate.split('T')[0]}/${Number(sortKeyValue.split(':')[0])/24*8}.json`
    };
    await s3.putObject(s3params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log("success", data);           // successful response
    }).promise();

};


// GET all the requested data from the dynamodb.
// with pagination if needed.
const getAllData = async (params) => {
    const _getAllData = async (params, startKey) => {
        if (startKey) {
            params.ExclusiveStartKey = startKey;
        }
        return dynamodb.query(params);
    };
    let lastEvaluatedKey = null;
    let rows = [];
    do {
        const result = await _getAllData(params, lastEvaluatedKey);
        rows = rows.concat(result.Items);
        lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    return rows;
};


/**
 * Function - Add Hours to Date
 * @param hours @type {integer} @default 6 @description No. of hours to be added.
 * @param date @type {Date} @default 'new Date()' @description Date object to which hours are added.
 * @returns @type {Date} @description @default 'now + 6 hours' Future Date after addition of hours. 
 */

function addHoursToDate(hours = 6, date = new Date()) {
    return new Date(new Date(date).setHours(date.getHours() + hours));
}