//////////////////////////////////////////////////////////////////////////////////

git, build.phonegap.com
    tranvan456@gmail.com
    Toilaren6do

git config --list
git config --global user.name "tranvan110"
git config --global user.email tranvan456@gmail.com

heroku
    tranvan456@gmail.com
    @Toilaren1

heroku login -i
heroku apps:info -a chatbox-pi
heroku ps -a chatbox-pi
heroku ps:restart web -a chatbox-pi
heroku ps:stop web -a chatbox-pi
heroku ps:scale web=1 -a chatbox-pi
heroku open -a chatbox-pi
heroku logs --tail -a chatbox-pi

//////////////////////////////////////////////////////////////////////////////////

07. User git:
    git clone https://github.com/tranvan110/CrossApp.git
    cd CrossApp
    git init

    git remote -v
    git remote remove origin
    git remote add origin https://github.com/tranvan110/CrossApp.git
    git add .
    git commit -am "initial commit"
    git status
    git push -f origin master

//////////////////////////////////////////////////////////////////////////////////

08. User heroku:
    cd server
    git init
    
    git remote add origin https://github.com/tranvan110/esp8266-server.git
    git add .
    git commit -am "initial commit"
    git pull origin master
    git push -f origin master

    git remote -v
    git remote remove heroku
    git remote add heroku https://git.heroku.com/esp8266-server.git
    git remote add heroku https://git.heroku.com/web8266-server.git
    heroku git:remote -a esp8266-server
    heroku git:remote -a web8266-server
    git pull heroku master
    git push -f heroku master

//////////////////////////////////////////////////////////////////////////////////
01: User nodejs:
    npm init
    npm install ws
    npm install express

    npm install request
    npm install socket.io
    npm install ip
    
    npm install ejs
    npm install body-parser
    
    npm uninstall ip
    npm uninstall sass

    npm install -g sass
    npm install -g selenium-webdriver

Run nodejs project: node index.js