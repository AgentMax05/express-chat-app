<h1 align="center">Express Chat App</h1>

![creator](https://img.shields.io/badge/Created%20By-AgentMax05-orange)(https://github.com/AgentMax05)
  
![hosted](https://img.shields.io/badge/hosted%20on-maxvek.com%2Fchat-yellow)(https://maxvek.com/chat)
  
  
This is a chat app I've been working on for a while. It uses express and node.js for the backend, MongoDB for storage, and socket.io for communicating between the server and the user. Currently the chat app is hosted on https://maxvek.com/chat. To access the chat you need to make an account by signing up with a username and password at https://maxvek.com/chat/sign-up.html, and then you can log in and chat with other people!

<h2 align="center">App interface</h2>

![chat-app_diagram](https://user-images.githubusercontent.com/64991518/111081823-88a2b180-84db-11eb-9624-0b58658e9ed6.png)

Diagram key:
<ol type="A">
  <li><p>The left sidebar which shows the rooms you are in and the name of the current logged in user at the top.</p></li>

  <li><p>The top '+' button can be used to create a new room.</p></li>
  
  <li><p>Displays the name of the current room.</p></li>
  
  <li><p>The right sidebar displays the users in the current room, and at the bottom has buttons for various settings for the room.</p></li>

  <li><p>This is the input where you can type a message and the 'Send' button which sends the message to the room</p></li>
  
  <li><p>An example of a message. Note that messages sent by you will always appear on the left side and be colored blue, while messages sent by other will appear on the right side and be colored grey.</p></li>
  
  <li><p>The main display which displays all the messages in the room and who they were sent by.</p></li>
</ol>

<h2 align="center">Using the app</h2>

<ol type="1">
  <li><p>Sending a message - To send a message, find the input bar at the bottom of the screen (letter E), type in a message, and either press 'Enter' or the 'Send' button to the right of the input to send the message to everyone in the room.</p></li>
  
  <li><p>The 'general' room - The 'general' room is just what it sounds like, the general room. Every user is added to this room, and this room cannot be deleted or left by **any** user.<p></li>
  
  <li><p>Moving to a different room - To switch to a different room, first find the room on the left sidebar (letter A). Then, click on the circle with the room's name, and you will see the text on the top bar (letter C) change to the name of the room you just switched to.</p></li>
  
  <li><p>Creating a new room - To create a new room, click on the circle with the '+' (letter B) in the left sidebar (letter A). A menu will pop up, asking you to enter the name of the room you wish to create, and any users you would like to add to the room. To add a user, just enter their username in the box and press the 'Add User' button to the right of the box. When you are done adding users, click the 'Create Room' button, and a new room will pop up in your left sidebar (letter A).</p></li>
  
  <li><p>Adding a user to a room - Once you are already in a room, you can still add more users to the room. To do this, find the button that says 'Add users to room' at the bottom of the right sidebar (letter D). Once you click this button, a menu will pop up asking for the name of the user you would like to add. Enter in a username and press 'Add user', and a new user will be added to the room.</p></li>
  
   <li><p>Removing a user from a room - To remove a user from a room you are in, click the button that says 'Remove user from room' at the bottom of the right sidebar (letter D). Then, a menu will pop up with all of the users in the room. Select the users you wish to remove by clicking the 'Remove' button next to the users name. Once you have selected all of the users you wish to remove, click the 'Remove Users' button and the users selected will be removed from the room.</p></li>
   
   <li><p>Leaving a room - To leave a room you are in, switch to the room you wish to leave, and click the 'Leave Room' button at the bottom of the right sidebar (letter D). You will be removed from the room, and that room will no longer show up in your left sidebar (letter A).<p></p>
  
  <li><p>Deleting a room - To delete a room you are in, switch to the room you wish to delete, and click the 'Delete Room' button at the bottom of the right sidebar (letter D). That room will then be deleted for all users, and every user will be redirected back to the 'general' room. (NOTE: Deleting a room is permanent, and cannot be undone. All messages in a room will be deleted **FOREVER**.)</p></li>
  
  <li><p>Seeing the users in a room - To see the users in your current room, look at the top of the right sidebar (letter D). There you will find a list of all users in that room, with either a red or a green circle next to their name. A red circle denotes that the user is either currently in a different room or currently logged out. A green circle denotes that a user is currently logged in and looking at your current room.</p></li>
  
</ol>


