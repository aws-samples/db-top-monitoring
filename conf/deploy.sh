#!/bin/bash

set -e

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	"DBTop Monitoring Tool"

export AWS_REGION=$(aws configure get region --profile default)
export AWS_REGION=$(gum input --placeholder ${AWS_REGION} --value ${AWS_REGION})

# If AWS_REGION is in Americas I want to use the emoji 🌎 or Europe, Middle East and Africa 🌍 or Asia and Oceania 🌏
# Function to determine region emoji based on AWS region
get_region_emoji() {
    local region=$1
    case $region in
        # Americas
        us-east-1|us-east-2|us-west-1|us-west-2|ca-central-1|sa-east-1|mx-central-1)
            echo "🌎"
            ;;
        # Europe, Middle East and Africa  
        eu-central-1|eu-west-1|eu-west-2|eu-west-3|eu-north-1|eu-south-1|me-south-1|af-south-1)
            echo "🌍"
            ;;
        # Asia and Oceania
        ap-east-1|ap-southeast-1|ap-southeast-2|ap-southeast-3|ap-northeast-1|ap-northeast-2|ap-northeast-3|ap-south-1)
            echo "🌏"
            ;;
        *)
            echo "🗺️"
            ;;
    esac
}

REGION_EMOJI="$(get_region_emoji ${AWS_REGION}) ${AWS_REGION}"

gum spin --spinner dot --title "Deploying DBTop to AWS Region: ${REGION_EMOJI}" -- sleep 2

Elasticache_RBAC_User_Name="info-ping-user"

# Check if user exists
if aws elasticache describe-users --user-id ${Elasticache_RBAC_User_Name} --region ${AWS_REGION} >/dev/null 2>&1; then
    echo "User ${Elasticache_RBAC_User_Name} already exists in region ${REGION_EMOJI}"
else
    [ ! -f password.txt ] && gum input --password > password.txt
    if [ ! -f password.txt ] || [ $(cat password.txt | wc -c) -lt 16 ]; then
        openssl rand -base64 32 > password.txt
    fi

    echo "Creating user ${Elasticache_RBAC_User_Name} in region ${REGION_EMOJI}"
    Elasticache_RBAC_User_File="../logs/elasticache-rbac-user.json"
    aws elasticache create-user \
      --user-id ${Elasticache_RBAC_User_Name} \
      --user-name ${Elasticache_RBAC_User_Name} \
      --engine valkey \
      --authentication-mode Type=password,Passwords=$(cat password.txt) \
      --access-string "on ~* +info +ping" \
      --region ${AWS_REGION} > ${Elasticache_RBAC_User_File}
    cat ${Elasticache_RBAC_User_File} | jq -C .
fi

STACK_NAME="db-top-solution"
STACK_NAME=$(gum input --placeholder ${STACK_NAME} --value ${STACK_NAME})

USER_EMAIL="email@example.com"
USER_EMAIL=$(gum input --placeholder ${USER_EMAIL} --value ${USER_EMAIL})

VPC_PARAM="vpc-abc123456789"
VPC_PARAM=$(gum input --placeholder ${VPC_PARAM} --value ${VPC_PARAM})

# Check if VPC exists in the specified region
if ! aws ec2 describe-vpcs --vpc-ids ${VPC_PARAM} --region ${AWS_REGION} >/dev/null 2>&1; then
    echo "Error: VPC ${VPC_PARAM} does not exist in region ${REGION_EMOJI}"
    # Get list of VPCs and format for gum choice
    VPC_LIST=$(aws ec2 describe-vpcs --region ${AWS_REGION} --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value | [0],CidrBlock]' --output text | awk '{printf "%s (%s) - %s\n", $1, $2, $3}')
    # Let user select VPC using gum choice
    VPC_SELECTION=$(echo "${VPC_LIST}" | gum choose)
    # Extract VPC ID from selection
    VPC_PARAM=$(echo ${VPC_SELECTION} | cut -d' ' -f1)
    echo "Selected VPC: ${VPC_PARAM}"
fi

SUBNET_PARAM="subnet-abc123456789"
SUBNET_PARAM=$(gum input --placeholder ${SUBNET_PARAM} --value ${SUBNET_PARAM})

# Check if subnet exists and is public
check_subnet_public() {
    local subnet_id=$1
    local vpc_id=$2
    local region=$3
    
    # Check if subnet exists and get route table info
    if ! aws ec2 describe-subnets --subnet-ids ${subnet_id} --region ${region} >/dev/null 2>&1; then
        return 1
    fi

    # Check if subnet has route to internet gateway or NAT gateway
    local route_tables=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=${vpc_id}" "Name=association.subnet-id,Values=${subnet_id}" --region ${region} --query 'RouteTables[*].Routes[?DestinationCidrBlock==`0.0.0.0/0`].[GatewayId,NatGatewayId]' --output text)
    
    if [[ -n "${route_tables}" ]]; then
        return 0
    fi
    return 1
}

# Check if provided subnet is valid and public
if ! check_subnet_public ${SUBNET_PARAM} ${VPC_PARAM} ${AWS_REGION}; then
    echo "Error: Subnet ${SUBNET_PARAM} is not public or does not exist in VPC ${VPC_PARAM} region ${REGION_EMOJI}"
    
    # Get list of public subnets with NAT gateway
    SUBNET_LIST=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=${VPC_PARAM}" \
        --region ${AWS_REGION} \
        --query 'Subnets[*].[SubnetId,Tags[?Key==`Name`].Value | [0],CidrBlock]' \
        --output text | while read subnet_id name cidr; do
            if check_subnet_public ${subnet_id} ${VPC_PARAM} ${AWS_REGION}; then
                echo "${subnet_id} (${name:-Unnamed}) - ${cidr}"
            fi
        done)

    # Let user select subnet using gum choice
    SUBNET_SELECTION=$(echo "${SUBNET_LIST}" | gum choose)
    # Extract subnet ID from selection
    SUBNET_PARAM=$(echo ${SUBNET_SELECTION} | cut -d' ' -f1)
    echo "Selected Subnet: ${SUBNET_PARAM}"
fi

INSTANCE_TYPE="t4g.large"
INSTANCE_TYPE=$(gum input --placeholder ${INSTANCE_TYPE} --value ${INSTANCE_TYPE})

# Get allowed instance types from CloudFormation template
ALLOWED_INSTANCES=$(cat DBTopMonitoringSolution.yaml | yq -r '.Parameters.InstanceType.AllowedValues[]')

# Check if provided instance type is in allowed list
if ! echo "${ALLOWED_INSTANCES}" | grep -q "^${INSTANCE_TYPE}$"; then
    echo "Error: Instance type ${INSTANCE_TYPE} is not allowed"
    # Let user select from allowed instances using gum choice
    INSTANCE_TYPE=$(echo "${ALLOWED_INSTANCES}" | gum choose)
    echo "Selected Instance Type: ${INSTANCE_TYPE}"
fi

PUBLIC_ACCESS="true"
SG_INBOUND_ACCESS="0.0.0.0/0"
GITHUB_REPOSITORY="aws-samples"

aws cloudformation create-stack \
    --stack-name "${STACK_NAME}" \
    --template-body file://DBTopMonitoringSolution.yaml \
    --parameters \
		ParameterKey=Username,ParameterValue=${USER_EMAIL} \
		ParameterKey=VPCParam,ParameterValue=${VPC_PARAM} \
		ParameterKey=SubnetParam,ParameterValue=${SUBNET_PARAM} \
		ParameterKey=InstanceType,ParameterValue=${INSTANCE_TYPE} \
		ParameterKey=PublicAccess,ParameterValue=${PUBLIC_ACCESS} \
		ParameterKey=SGInboundAccess,ParameterValue=${SG_INBOUND_ACCESS} \
		ParameterKey=GitHubRepository,ParameterValue=${GITHUB_REPOSITORY} \
    --region ${AWS_REGION} \
    --capabilities CAPABILITY_NAMED_IAM
