# infrastructure/terraform/main.tf
module "vpc" { source = "terraform-aws-modules/vpc/aws" }
module "eks" { 
  source          = "terraform-aws-modules/eks/aws"
  cluster_version = "1.29"
  # Node groups, IAM OIDC for pod identity
}
resource "aws_ecr_repository" "app" { name = "animal-daycare" }
resource "aws_secretsmanager_secret" "supabase" { ... }