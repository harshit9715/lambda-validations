
// 'use strict';

const Ajv = require('ajv');

const schema = {
  "properties": {
    "body": {
      "type": "object",
      "properties": {
        "primaryID": {
          "type": "string",
          // "format": "uuid"
        }
      },
      "additionalProperties": false,
      "required": ["primaryID"]
      // "format": "uuid"
    },
    "query": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          // "format": "uuid"
        }
      },
      "additionalProperties": false,
      "required": ["name"]
    },
    "path": {}
  },
  "additionalProperties": false,
  "required": ["body"]
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

exports.handler = async (event) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!');
    return {
    "statusCode": 200,
    "body": JSON.stringify({
      "hello": 'Lambda is warm!'
      })
    };
  }
  
  try {
   // const ajv = new Ajv();
    const query = event;
    console.log(query)
    // console.log(event);
  //  const validate = ajv.compile(schema);
    const valid = await validate({
      body: JSON.parse(query.body || '{}'),
      path: query.pathParameters || {},
      query: query.queryStringParameters || {},
    });
    console.log(valid);
    if(valid){
     // let exampleObject = new ExampleObject(event);
     // let response = await exampleObject.fetch();
    let response = {
    "statusCode": 200,
    "body": JSON.stringify({
      "hello": "world"
      })
    };
      return  response;
    } else {
      let res = {
    "statusCode": 400,
    "body": JSON.stringify({
      "hello": ajv.errorsText(validate.errors)
      })
    };
    console.log(res);
    return res;
    }
  } catch(error) {
      console.error(error);
      return {
        "statusCode": 400,
        "body": JSON.stringify({
          "hello": "Internal Server Error"
      })
    };
  }
};