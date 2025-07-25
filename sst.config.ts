/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pack-challange",
      removal: "retain",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    const vpc = new sst.aws.Vpc("PackVpc", { bastion: true });
    const cluster = new sst.aws.Cluster("PackCluster", { vpc });

    const database = new sst.aws.Postgres("PackPSQLDb", {
      vpc,
      dev: {
        username: "user",
        password: "password",
        database: "files",
        port: 5432,
      },
      database: "files",
    });

    const bucket = new sst.aws.Bucket("PackMultimediaBucket");

    new sst.aws.Service(
      "PackWeb",
      {
        cluster,
        loadBalancer: {
          ports: [{ listen: "80/http", forward: "3000/http" }],
        },
        dev: {
          command: "npm run start:dev",
        },
        link: [database, bucket],
        environment: {
          BCRYPT_ROUNDS: "12",
          JWT_SECRET: "not-production-stuff-to-do-prefer-a-signing-certificate",
        },
      },
      {
        dependsOn: [database, bucket],
      },
    );
  },
});
