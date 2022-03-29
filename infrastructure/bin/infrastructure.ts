#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { BackendStack } from '../lib/backend-stack';


const app = new cdk.App();
new InfrastructureStack(app, 'BonAppetitInfrastructureStack', {
  env: {
    region: "us-east-1",
    account: "817836876404"
  }
});
new BackendStack(app, 'BonAppetitBackendStack', {
  env: {
    region: "us-east-1",
    account: "817836876404"
  }
});