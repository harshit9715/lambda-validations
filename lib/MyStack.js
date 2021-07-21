import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { covidAppTable, bucket } = props;

    // Create a HTTP API
    const api = new sst.Api(this, "Api", {
      routes: {
        "POST /{id}": {
          handler: 'src/lambda.node',
          bundle: {
            nodeModules: ["ajv"]
          }
        },
        // "POST /contact": {
        //   handler: 'src/saveContact.main',
        //   permissions: [[covidAppTable, "grantReadWriteData"]],
        //   environment: {
        //     TABLE_NAME: covidAppTable.tableName
        //   }
        // },
        "POST /questionnaire": {
          handler: "src/saveQueResponse.handler",
          permissions: [[covidAppTable, "grantReadWriteData"]],
          bundle: {
            nodeModules: ["@hapi/joi"]
          },
          environment: {
            TABLE_NAME: covidAppTable.tableName,
            S3_BUCKET_NAME: bucket.bucketName,
          }
        },
      },
    });

    // CRON
    const FREQUENCY = '1'
    // const rule = new events.Rule(this, 'Rule', {
    //   schedule: events.Schedule.expression(`cron(0 0/${FREQUENCY} * * ? *)`)
    // });
    // rule.addTarget(new targets.LambdaFunction(PushPackage));
    // this.bucket.grantReadWrite()
    new sst.Cron(this, "covidPackageToS3", {
      job: {
        handler: 'src/pushCovidPackage.main',
        permissions: [[covidAppTable, "grantReadData"], [bucket, "grantReadWrite"]],
        environment: {
          TABLE_NAME: covidAppTable.tableName,
          PARTITION_KEY_NAME: 'Partition',
          SORT_KEY_NAME: 'CreationTime',
          BUCKET_NAME: bucket.bucketName,
          LAST_X_HOURS: FREQUENCY
        }
      },
      schedule: `cron(0 0/${FREQUENCY} * * ? *)`
    })

    // Show the endpoint in the output
    this.addOutputs({
      "ApiEndpoint": api.url,
    });
  }
}