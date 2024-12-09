# Email to event - Thunderbird plugin
This Thunderbird plugin enables easy creation of a calendar event based on an email content. Upon user request, dates in the email's subject and body are detected to make event creation easy

This plugin was inspired by how smartphones enable easy event creation of their email client.

## Install bundle

 ```shell
git clone git@github.com:LouisJULIEN/extract-date.git
git clone git@github.com:LouisJULIEN/extract-time.git
 
cd extract-date
npm i
npm run build
npm run bundle

cd ../extract-time
npm i
npm run build
npm run bundle

cd ../thunderbird_plugin_mail_to_event
cp ../extract-date/bundle/extract-date.js dependencies/extract-date.js 
cp ../extract-time/bundle/extract-time.js dependencies/extract-time.js

```