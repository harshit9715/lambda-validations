// ? Bash script to compile schema
// for dir in schema/*; do node ./node_modules/ajv-cli/dist/index.js compile -c ajv-formats -c ajv-formats-draft2019 --strict=true --coerce-types=array --all-errors=true --use-defaults=empty --messages=true -s $dir/'schema.json' -o $dir/'schema.js'; done

export default function handler(lambda, validate) {
    return async function (event, context) {
        let data;

        const valid = await validate({
            body: JSON.parse(event.body || '{}'),
            path: event.pathParameters || {},
            query: event.queryStringParameters || {},
        });
        if (valid) {
            try {
                // Run the Lambda
                data = await lambda(event, context);
            } catch (e) {
                console.log(e);
                data = {
                    body: { error: e.message },
                    statusCode: 500
                };
            }

        } else {
            data = {
                "statusCode": 400,
                "body": validate.errors.map(item => `${item.message} at ${item.instancePath}`)
            };
        }

        // Return HTTP response
        return {
            statusCode: data.statusCode,
            body: JSON.stringify(data.body),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            }
        };
    };
}