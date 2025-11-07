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

# aws cloudformation create-stack \
#     --stack-name "db-top-solution" \
#     --template-body file://DBTopMonitoringSolution.template \
#     --parameters 
# 		ParameterKey=Username,ParameterValue=email@example.com \
# 		ParameterKey=VPCParam,ParameterValue=vpc-abc123456789 \
# 		ParameterKey=SubnetParam,ParameterValue=subnet-abc123456789 \
# 		ParameterKey=InstanceType,ParameterValue=t4g.large \
# 		ParameterKey=PublicAccess,ParameterValue=true \
# 		ParameterKey=SGInboundAccess,ParameterValue=0.0.0.0/0 \
# 		ParameterKey=GitHubRepository,ParameterValue=aws-samples \
#     --region us-east-1 \
#     --capabilities CAPABILITY_NAMED_IAM
