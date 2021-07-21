import * as awssdk from "aws-sdk";
import xray from "aws-xray-sdk";

// Do not enable tracing for 'invoke local'
const aws = process.env.IS_LOCAL ? awssdk : xray.captureAWS(awssdk);

export default aws;