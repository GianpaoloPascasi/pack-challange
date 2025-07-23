/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pack-challange",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("PackVpc", { bastion: true });
    const cluster = new sst.aws.Cluster("PackCluster", { vpc });

    const database = new sst.aws.Postgres("PackPSQLDb", {
      vpc,
      dev: {
        username: "user",
        password: "password",
        database: "files",
        port: 5432
      },
      database: "files",
    });

    new sst.aws.Service("PackWeb", {
      cluster,
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3000/http" }],
      },
      dev: {
        command: "npm run start:dev",
      },
      link: [database],
    }, {
      dependsOn: [database]
    });
  },
});
