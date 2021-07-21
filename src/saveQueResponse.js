"use strict";
/** @module Joi created a joi module object.
 * @type {object}
 */
const Joi = require('@hapi/joi');

/** @module docClient Create the DynamoDB service object
 * @type {object}
 */
import dynamodb from './utils/dynamodb-lib';
/** @param {string} COVID_ANSWERS_TABLENAME Name of the table where answers are going to be stored. */
const tableName = process.env.TABLE_NAME;
/**
 *
 * @listener Event listener - API gateway endpoint trigger
 * @since   1.0.0
 * @access  public
 * @author Harshit.Gupta@atmecs.com
 * @description Function used to save the responses received for the COVID Questionnaire into the DB table against a user(however ensuring that the answers are passed in the valid format).
 * @returns @type {jsonObject} Execution response.
 */
exports.handler = async (event) => {
    console.log('event', JSON.stringify(event, null, 2));
    /** @constant answers @type {JSON} JSON data of a question*/
    const answers = JSON.parse(event.body);

    /**
     * CORS check not required, because of preflight check on this API.
     * simply returning event headers will work.
     */
    /** @type {jsonObject} */
    let corsHeaders = event.headers;
    corsHeaders["Access-Control-Allow-Origin"] = corsHeaders['origin'];
    if (Object.keys(answers).length === 0)
        return {
            statusCode: 400,
            body: JSON.stringify("At least one selection is required!"),
            headers: corsHeaders
        };
    const getParams = {
        TableName: tableName,
        Key: {
            "Partition": 'en-US',
            "CreationTime": 'foo',
        },
    };
    try {
        let questions;
        /**
         * Makes a request to s3 to get the json file containing questions.
         * 
         * @description Async Function call - handles the s3 call functionality.
         * @param {JSON} getObject Includes name of bucket and file.
         * @returns {JSON} Response of the s3 call.
         */
        // await s3.getObject(getParams).promise()
        //     .then(res => { questions = JSON.parse(res.Body.toString()); })
        //     .catch(error => {
        //         console.error('s3 error is:', JSON.stringify(error, null, 2));
        //     });
        const dbData = await dynamodb.get(getParams)

        if (!dbData.questions)
            return {
                statusCode: 500,
                body: JSON.stringify("Internal Server Error"),
                headers: corsHeaders
            }
        /** 
         * @param JoiObject
         * @type {JSON}
         * @description Creating JOI schema dynamically by using question object reference
        */
        let JoiObject = {};
        questions.forEach(que => {
            let obj = Joi.string();
            let item = Joi.array();
            if (que.options) {
                let optionsKeys = Object.keys(que.options);
                obj = obj.valid(...optionsKeys).required();
            }
            JoiObject[[que.id]] = item.items(obj);
        });
        const schema = Joi.object(JoiObject);

        /**
         * Validates answer against question schema using JOI.
         * 
         * @description  Function call - handles the JOI validation functionality.
         * @param {JSON} getObject Includes name of bucket and file.
         * @returns {JSON} Response of the s3 call.
         * @param error @type {JSON or undefined} contains all errors found in validation
         * @param value @type {JSON or undefined} contains result if validation successful. 
         */
        const { error, value } = schema.validate(answers);
        console.log(error, value);
        if (error)
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify(error.message, null, 2)
            };
        else {
            /** @constant answerKeys @type {Array} All question codes that user has answered. */
            let answerKeys = Object.keys(answers);
            /** Mapping all the answers user entered into a dynamodb item */
            questions.filter(que => answerKeys.includes(que.id.toString()))
                .map(que => {
                    answers[[que.id]] = {
                        question: que.default ? que.default : que.text,
                        selectedAnswers: answers[[que.id]]
                    };
                });
            /** @constant params @type {JSON} Db param object. */
            const params = {
                TableName: tableName,
                Item: {
                    "Partition": 'user#'+event.requestContext.authorizer.sub,
                    "CreationTime": new Date(new Date().toUTCString()).toISOString(),
                    "QuestionnaireResponse": answers
                },
            };

            console.log('params', params);

            /**
             * Async Function call - Generates a promise object.
             * @description Function - Dynamodb put method.
             * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
             * @param {String} params - DB params denoting operation and items to be written.
             * @returns {JSON} Database operation response.
             */
            return await dynamodb.put(params)
                .then(() => {
                    return {
                        statusCode: 201,
                        body: JSON.stringify(`Response saved successfully!`),
                        headers: corsHeaders
                    };
                })
                .catch(error => {
                    console.error('dynamodb error is', JSON.stringify(error));
                    if (~~(error.statusCode / 100) === 4)
                        return {
                            statusCode: error.statusCode,
                            body: JSON.stringify(error.message),
                            headers: corsHeaders
                        };
                    else
                        return {
                            statusCode: 500,
                            body: JSON.stringify('Internal server error.'),
                            headers: corsHeaders
                        };
                });
        }
    }
    catch (e) {
        throw new Error(`${e.message}`);
    }
};