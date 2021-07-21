import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";
import { Seeder } from 'aws-cdk-dynamodb-seeder';

export default class DynamoDBStack extends sst.Stack {
    
    covidAppTable;

    constructor(scope, id, props) {
        super(scope, id, props);
        const { rnamer } = props;

        const covidAppTable = new dynamodb.Table(this, rnamer("covidApp"), {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand ↪ billing mode
            partitionKey: { name: "Partition", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "CreationTime", type: dynamodb.AttributeType.STRING }
        });

        new Seeder(this, "MySeeder", {
            table: covidAppTable,
            setup: [
                {
                    Partition: 'en-US',
                    CreationTime: 'foo',
                    questions: require("../../src/assets/Questionnaire/en-US.json")
                  },
                  {
                    Partition: 'es-ES',
                    CreationTime: 'foo',
                    questions: require("../../src/assets/Questionnaire/es-ES.json")
                  },
                  {
                    Partition: 'te-IN',
                    CreationTime: 'foo',
                    questions: require("../../src/assets/Questionnaire/te.json")
                  }
            ],
            // teardown: require("./keys-to-delete.json"),
            refreshOnUpdate: true  // runs setup and teardown on every update, default false
        });

        // Output values
        this.addOutputs({
            [rnamer("CovidAppTableName")]: covidAppTable.tableName,
            [rnamer("CovidAppTableArn")]: covidAppTable.tableArn,
        })

        this.covidAppTable = covidAppTable

    }
}