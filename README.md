# express-chat-app

<p align="center">
  <img src="https://img.shields.io/badge/made%20by-AgentMax05-orange">
  
  <img src="https://img.shields.io/badge/hosted%20on-maxvek.com%2Fchat-yellow">
 </p>
This is a chat app I've been working on for a while. It uses express and node.js for the backend, MongoDB for storage, and socket.io for communicating between the server and the user. Currently the chat app is hosted on https://maxvek.com/chat. To access the chat you need to make an account by signing up with a username and password at https://maxvek.com/chat/sign-up.html, and then you can log in and chat with other people!

## navigating the app

![chat-app_diagram](https://user-images.githubusercontent.com/64991518/111081823-88a2b180-84db-11eb-9624-0b58658e9ed6.png)
diagram of the chat app

The diagram above shows the layout of the app.

  A. The left sidebar which shows the rooms you are in and the name of the current logged in user at the top.

  B. The top '+' button can be used to create a new room.
  
  C. Displays the name of the current room 
  
  D. The right sidebar displays the users in the current room, and at the bottom has buttons for various settings for the room. 

  E. This is the input where you can type a message and the 'Send' button which sends the message to the room. 
  
  F. An example of a message. Note that messages sent by you will always appear on the left side and be colored blue, while messages sent by other will appear on the right side and be colored grey. 
  
  G. The main display which displays all the messages in the room and who they were sent by.

## using the app

The app works similarly to other chat apps. When you load into the app, you will be taken to the 'general' room. Every user is added to the 'general' room, and this room cannot be deleted or left by any user. To send a message you can type something in the bar at the bottom of the screen (E) and either hit 'Enter' or press the 'Send' button to send the mesage. To move to another room just click on one of the circles on the left bar (A). You will then see the text on the top bar (C) change to the room that you just switched to. To create a new room you can click the button with the '+' (B), and a menu will popup to create the new room. The users in your current room are shown on the right sidebar (D). Users with a green circle next to their name are currently in **that** room, while users with a red circle next to their name are either logged out or are in a different room. Finally, for every room you can add users, remove users, leave the room, and delete the room. All of these options can be found at the bottom of the right sidebar (D).  
