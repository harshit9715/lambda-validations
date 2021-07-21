import * as sst from "@serverless-stack/resources";

export default class MyStack1 extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // Create a HTTP API
    const api = new sst.Api(this, "Api_sample", {
      routes: {
        "POST /{id}": {
          handler: 'src/lambda.node',
          bundle: {
            nodeModules: ["@middy/core", "middy-ajv", "ajv"]
          }
        },
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      "ApiEndpoint1": api.url,
    });
  }
}