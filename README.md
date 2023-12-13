# SeniorProj1-LLVC
Low Latency Voice Call server with nodejs and webrtc

If you simply want to view the final product website, I'll have it running from time to time on: https://12d93698.nip.io/broadcaster/index.html

This tutorial will help you in your journey to try to run this project locally. If you want to run this project on an AWS server like I did, godspeed.

## Setup
Clone the project, I would suggest Visual Studio Code.

### VSCode:
1. Install the Github Pull Request extension if you haven't already
2. In a new window, under start, you should have an option to `Clone Git Repository`
3. Copy the HTTPS link under "< > Code"
  - DO NOT COPY THE LINK IN THE BROWSER BAR
4. Paste it in the popup
5. Follow the directions VSCode gives you

## Installing dependancies
1. Install NodeJS if you haven't already. I think it's also a VSCode extension.
2. In a terminal, try running `node index.js` inside the project folder
  - If it fails outright, you either installed NodeJS improperly or aren't in the correct folder
3. When it gives you a big error, try to see what you need to install. It might be a few tries before you npm install everything.

## Getting certificates
In order to run HTTPS, you need a couple .pem certificates.
You can use whatever you want for this step, but I would suggest using openssl.
The command that worked for me was: `./openssl genrsa -out localhost:8443 1024 -config openssl.cnf`

## Local files
`npm install dotenv` if you haven't already
To run the project with security, I used .gitignore on a folder named local.
This folder is in the main project folder and has a few files in it:
- .env
- cert.pem
- key.pem

.env contents:
```d
PEMpassphrase=##########
PORT=8443
PRIVATE_KEY_PATH=./local/key.pem
CERTIFICATE_PATH=./local/cert.pem
```

Finally, you might be able to run this project locally using `node index.js`. 
If you have any issues, you can contact my consultant [here](https://chat.openai.com)
