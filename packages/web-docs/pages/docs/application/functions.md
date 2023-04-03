# Functions

Functions are a Takaro object, they are the actual code that is executed when a Hook, Cronjob or Command is triggered. Functions are written in JavaScript and can be created in the Takaro Web UI.

Inside a Function, you will have access to data about the event that triggered it, as well as the ability to interact with the Gameserver. The Function will come pre-loaded with an API client (`lib-apiclient`).

For example, you can send a message to a player when they join a server, or you can teleport a player to a specific location.

// TODO: more in-depth explanation of how to write code for a Function
