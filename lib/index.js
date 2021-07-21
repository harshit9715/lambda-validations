import MyStack1 from "./MyStack1";
// import MyStack from "./MyStack";
// import DbStack from "./infra/db"
// import s3Stack from "./infra/s3"
export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs12.x"
  });

  const rnamer = rname => app.logicalPrefixedName(rname);

  // const {covidAppTable} = new DbStack(app, "db-stack", {rnamer});
  // const {bucket} = new s3Stack(app, "s3-stack", {rnamer});
  // new MyStack(app, "my-stack", {covidAppTable,bucket, rnamer});
  new MyStack1(app, "my-stack", {rnamer});

  // Add more stacks
}
