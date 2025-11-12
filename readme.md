**For the presentation**

I will manage all of this and demo it between two devices. I will host the server and provide the ip

However if you would like to try it out before, follow the steps below  

**To run the project**

Open up comand prompt and navigate to the directory

run "npm i" to install the badwords.js package

Run "npm start" to start the server. 

On local machine, it is avalible at [http://localhost:3000/](http://localhost:3000/)

**To connect on another device**

Follow the steps to start the server

Then in a new comand prompt window, type 'ipconfig', scroll to the bottom and take note of the ipv4 address

on another device connected to the same network, enter the ip adress followed by "":3000" into a web browser and search

* **NOTE**: Some browsers mess with the audio input. MS edge and chrome tend to be the most reliable


**Declarations**
* p5.speech.js is an existing library i used to recognise AND synthesize voices. The copy i used is avalible in the libraries folder, i have not modified this at all
* bad-words.js is also an existing library i imported from npm. I have not modified this in any way
* GenAI was used to aid heavily in segments of the project out of scope of the subject. Comments have been left in the relevant areas explaining how and why it was used
* GenAI was also used at times to debug or help structure segments of the code, however this was done sparingly and always while understanding the changes 