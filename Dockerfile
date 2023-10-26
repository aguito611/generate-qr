FROM mcr.microsoft.com/azure-functions/node:4-node18 as FINAL

RUN npm i -g yarn typescript 
RUN apt update -y && apt upgrade -y

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

EXPOSE 80
# Configuring New Relic APM for this project
WORKDIR /temp
RUN apt-get install wget -y
RUN wget https://download.newrelic.com/dot_net_agent/previous_releases/9.3.0/newrelic-netcore20-agent_9.3.0.0_amd64.tar.gz
RUN tar xzf newrelic*.tar.gz
RUN rm -rf newrelic*.tar.gz

COPY . /home/site/wwwroot

RUN cd /home/site/wwwroot && \
    npm install && yarn build 