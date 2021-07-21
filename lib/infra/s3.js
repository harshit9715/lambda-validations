import * as s3 from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

export default class S3Stack extends sst.Stack {
  // Public reference to the S3 bucket
  bucket;

  constructor(scope, id, props) {
    super(scope, id, props);
    const {rnamer} = props
    this.bucket = new s3.Bucket(this, "CovidPackageBucket", {
      // Allow client side access to the bucket from a different domain
      cors: [
        {
          maxAge: 3000,
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        },
      ],
    });

    // Export values
    this.addOutputs({
      [rnamer("bucketName")]: this.bucket.bucketName,
      [rnamer("bucketArn")]: this.bucket.bucketArn,
    })
  }
}