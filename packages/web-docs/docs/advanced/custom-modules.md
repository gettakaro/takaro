---
sidebar_position: 3
---

# Writing custom modules

While the Takaro Team is committed to providing a comprehensive set of built-in modules,
there may be instances where a particular feature you need is unavailable, or perhaps
there is no existing module for a feature you desire. 

This is focused on advanced users familiar with JavaScript. 
If you need support, or if you believe your feature could enrich our suite of built-in modules,
we encourage you to reach out to our <a href="https://aka.candaele.dev/discord" target="_blank" rel="noopener noreferrer">Discord</a> community.

## Functions

Functions are a Takaro object, they are the actual code that is executed when a Hook, Cronjob or Command is triggered. Functions are written in JavaScript and can be created in the Takaro Web UI.

Inside a Function, you will have access to data about the event that triggered it, as well as the ability to interact with the game server. The Function will come preloaded with an API client (`lib-apiclient`).

For example, you can send a message to a player when they join a server, or you can teleport a player to a specific location.

### Writing functions

All functions will have the same basic skeleton, which looks like this:

```js
import { getTakaro, getData } from '@takaro/helpers';
async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  // TODO: write my function...
}
main();
```

Let's dissect this line by line

`import { getTakaro, getData } from '@takaro/helpers';`

This line imports two helper functions from the @takaro/helpers module. These functions, `getTakaro`and `getData`, provide access to the necessary data and the Takaro instance within the function. The `takaro` object is a wrapper around the API, with this object you can read and write data from/to Takaro. `getData` will provide you with information about the triggered event, for example if you are writing a Command, this object will contain information about the player who executed the command.

```js
async function main() {}
main();
```

These lines of code define a function and immediately calls it. This is necessary because the Takaro Function runtime expects a function to be exported from the file. The function is called `main`, but you can name it whatever you want.

```js
const data = await getData();
const takaro = await getTakaro(data);

// TODO: write my function...
```

These lines of code call the helper functions we imported earlier. `getData` will return an object containing information about the event that triggered the function. `getTakaro` will return a Takaro instance, which you can use to interact with the API.
