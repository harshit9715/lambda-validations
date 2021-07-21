// import AWS from "./aws-sdk";

import handler from "./utils/handler-lib";
import dynamodb from './utils/dynamodb-lib';

export const main = handler(async(event) => {
    console.log("Event is:", JSON.stringify(event, null, 2));
    /** @type {jsonObject} */
    let eventBody = JSON.parse(event.body);

    let datetime = new Date().toISOString().split('T');
    let deletionTime = addHoursToDate();
    var putParams = {
        TableName: process.env.TABLE_NAME,
        Item: {
            "Partition": datetime[0],
            "CreationTime": datetime[1],
            "DeletionTime": Math.floor(deletionTime.getTime()/1000),
            "Data": eventBody.data,
            "TestId": eventBody.testId
        }
    };
    /**
     *
     * Db call to put booking information into flightBookingPayments
     *
     */
    return await dynamodb.put(putParams)
        .then(result => {
            console.log("inserted item in the db is ", JSON.stringify(result, null, 2));
            return {
                statusCode: 200,
                body: JSON.stringify({message:"Inserted data successfully"}, null, 2)
            };
        })
        .catch(err => {
            console.error("Error is ", JSON.stringify(err, null, 2));
            return {
                statusCode: 500,
                body: JSON.stringify({ errors: [err.message] }, null, 2)
            };
        });
});

/**
 * Function - Add Hours to Date
 * @param date @type {Date} @default 'new Date()' @description Date object to which hours are added.
 * @param hours @type {integer} @default 6 @description No. of hours to be added.
 * @returns @type {Date} @description @default 'now + 6 hours' Future Date after addition of hours. 
 */
 
function addHoursToDate(date=new Date(), hours=6) {
  return new Date(new Date(date).setHours(date.getHours() + hours));
}