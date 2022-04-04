import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns'
import * as ecr from '@aws-cdk/aws-ecr'
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as codepipeline from '@aws-cdk/aws-codepipeline'
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions'


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'BonAppetit-vpc', {
      natGateways: 1,
      maxAzs: 2
    })

    const cluserAdmin = new iam.Role(this, 'BonAppetit-adminrole', {
      assumedBy: new iam.AccountRootPrincipal()
    })

    const cluster = new ecs.Cluster(this, 'BonAppetit-EcsCluster', {
      vpc: vpc
    })

    const taskRole = new iam.Role(this, 'BonAppetit-TaskRole', {
      roleName: 'BonAppetit-TaskRole',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    })

    const executionRolePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    })

    const taskDef = new ecs.FargateTaskDefinition(this, 'BonAppetit-EcsTaskdef', {
      taskRole: taskRole
    })
    taskDef.addToExecutionRolePolicy(executionRolePolicy)

    const container = taskDef.addContainer('BonAppetit-App', {
      image: ecs.ContainerImage.fromRegistry("hello-world"),
      memoryLimitMiB: 256,
      cpu: 256
    }).addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP
    })

    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'BonAppetit-EcsService', {
      cluster: cluster,
      taskDefinition: taskDef,
      publicLoadBalancer: true,
      desiredCount: 1,
      listenerPort: 80
    })

    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 5, minCapacity: 1 })
    scaling.scaleOnCpuUtilization('cpu-scaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    })

    const ecrRepo = new ecr.Repository(this, 'BonAppetit-EcrRepo')

    const gitHubSource = codebuild.Source.gitHub({
      owner: 'robbinswill',
      repo: 'BonAppetit',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('prod')
      ]
    })

    const project = new codebuild.Project(this, 'BonAppetit-CodeBuildProject', {
      projectName: "BonAppetit-CodeBuildProject",
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        privileged: true
      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: `${cluster.clusterName}`
        },
        'ECR_REPO_URI': {
          value: `${ecrRepo.repositoryUri}`
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.1",
        phases: {
          pre_build: {
            commands: [
              'pwd',
              'ls -al',
              'env',
              'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}'
            ]
          },
          build: {
            commands: [
              'pwd',
              'ls -al',
              'cd bonappetit',
              `docker build -t $ECR_REPO_URI:$TAG .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ECR_REPO_URI:$TAG'
            ]
          },
          post_build: {
            commands: [
              'pwd',
              'ls -al',
              'cd ..',
              'pwd',
              'ls -al',
              'echo "In post-build stage"',
              "printf '[{\"name\":\"recipe-app\",\"imageUri\":\"%s\"}]' $ECR_REPO_URI:$TAG > imagedefinitions.json",
              "pwd; ls -al; cat imagedefinitions.json"
            ]
          }
        },
        artifacts: {
          files: [
            'imagedefinitions.json'
          ]
        }
      })
    })

    const sourceOutput = new codepipeline.Artifact()
    const buildOutput = new codepipeline.Artifact()

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'robbinswill',
      repo: 'BonAppetit',
      branch: 'prod',
      oauthToken: cdk.SecretValue.secretsManager("github-oauth-token"),
      output: sourceOutput
    })

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [buildOutput]
    })

    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve'
    })

    const deployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployAction',
      service: fargateService.service,
      imageFile: new codepipeline.ArtifactPath(buildOutput, 'imagedefinitions.json')
    })

    new codepipeline.Pipeline(this, 'BonAppetit-EcsPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction]
        },
        {
          stageName: 'Approve',
          actions: [manualApprovalAction]
        },
        {
          stageName: 'Deploy-to-ECS',
          actions: [deployAction]
        }
      ]
    })

    ecrRepo.grantPullPush(project.role!)
    project.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "ecs:DescribeCluster",
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
        ],
      resources: [`${cluster.clusterArn}`],
    }));

    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });
  }
}
