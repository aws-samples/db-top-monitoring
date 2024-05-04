#Load Profile
version="$(curl https://version.code.ds.wwcs.aws.dev/?codeId=dbtop'&'moduleId=update)"
source $HOME/.bash_profile

#Clone Repository
cd /tmp
sudo rm -rf db-top-monitoring
git clone https://github.com/GitHubRepository/db-top-monitoring.git
cd db-top-monitoring
sudo cp -r server frontend /aws/apps

#React Application Installation
cd /aws/apps/frontend/; npm install; npm run build;

#Copy build content to www folder
cp -r /aws/apps/frontend/build/* /aws/apps/frontend/www/

#NodeJS API Core Installation
cd /aws/apps/server/; npm install;

#Re-Start API Services
cat /aws/apps/frontend/public/version.json
echo "Restarting the API Service..."
sleep 10
sudo service api.core restart

