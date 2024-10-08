---
title: Install Teleports
sidebar_position: 4
---

# How to add teleports module to your game server

This guide walks you through the process of integrating the Teleports module into your game servers. You'll learn how to set up teleport permissions for different player roles, create custom teleport roles for enhanced privileges, and manage teleport-related features effectively.


<iframe
  className="aspect-video w-full"
  src="https://www.youtube.com/embed/uTBEkVOh_RU"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  width="100%"
  height="500px"
  allowFullScreen
/>

## Install the module to your game server

### Step 1: Navigate to game servers

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrki4hl00e8356vnaco8xn0-annotated.png)

### Step 2: Select the game server you want the module to be installed on

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrf44cb002d356vzrgud1i3-annotated.png)

### Step 3: Navigate to Modules of the selected game server

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyr6qier0009356vyv6luu30-annotated.png)

### Step 4: Click the install button

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrkmfi000eb356vgb4jcsjl-annotated.png)

### Step 5: This opens the module config

You will see a list of settings that you can configure. You will also find the list of commands that are part of this module. $tplist - Lists all your set locations.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfgxmx0030356vcsdn6949-annotated.png)

### Step 6: $teleportwaypoint command

The module will install aliases for this command corresponding to the waypoint names. The $teleportwaypoint command is a base command that won't be used directly. Instead, the module will create custom commands for each waypoint name you set up. This allows players to teleport to specific locations easily.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfh0ch0031356veuthxwdw-annotated.png)

### Step 7: Select the amount of currency one teleport command costs

$teleport command teleports you to one of your set locations.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrkn7bf00ee356vec8w2jac-annotated.png)

### Step 8: $setwaypoint creates a new waypoint

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfh2zj0032356vxpdnfcao-annotated.png)

### Step 9: $settp sets a location to teleport to

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfh6ci0033356v20yp6mlv-annotated.png)

### Step 10: $setpublic sets a teleport to be public, allowing other players to teleport to it

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfflru002w356vejuvlnyy-annotated.png)

### Step 11: $setprivate sets a teleport to be private, only the teleport owner can teleport to it

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfhf6t0034356v8zo9l6ei-annotated.png)

### Step 12: $listwaypoints lists all waypoints

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrffrkd002y356vehfrrtgl-annotated.png)

### Step 13: $deletewaypoint deletes a waypoint

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfhzvi0037356vdm1sez5x-annotated.png)

### Step 14: Click Install module button when you are finished with the config

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrkndxi00ef356vjx98hsqg-annotated.png)

## Assign the permission to the right role

### Step 15: Now you need to assign the permission to the right role

Now that you've installed the Teleports module, the next step is to set up the appropriate permissions. Navigate to the "Roles" section in the global navigation to begin assigning teleport-related permissions to player roles.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrenji3001q356vs5b8uta8-annotated.png)

### Step 16: Now you need to assign the permission to the right role

You can decide to add this permission to the standard Player role, or you can create a new role dedicated for teleports. In this guide, we are going to do both. We will first start with the Player role. The Player role is the role that all players will have when they join your game server.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrejj8w0011356vg8t94k5p-annotated.png)

### Step 17: Teleports Module Permissions Overview

Create Public Teleports: Allows players to create teleport points accessible to others. Use Teleports: Enables players to use existing teleport points. Manage Waypoints: Permits creating, modifying, and deleting personal or shared waypoints.

To activate a permission:

Toggle the switch to the right (on position). Set a cost in the "Amount" field if desired (leave blank or 0 for free use).

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyre55ge000x356vqh7cq87h-annotated.png)

### Step 18: Click Save changes button

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrknird00eg356vsmu74np2-annotated.png)

### Step 19: Add a custom role for Teleports

Creating a dedicated teleport role allows for more flexible permission management. This is useful when you want to give enhanced teleport capabilities to certain players without changing permissions for all users.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrknlij00eh356v8bmmu32u-annotated.png)

### Step 20: Give your new role a recognizable name

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrew0c9001v356v6qdqb47a-annotated.png)

### Step 21: Configure teleport permissions for the new role

You'll see the same options as in Step 17: Create Public Teleports Use Teleports Manage Waypoints

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyreielj0010356vdutepys1-annotated.png)

## Assign the role to the right player

### Step 22: Go to Players to assign the right role

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrknq0d00ei356vbuve02c5-annotated.png)

### Step 23: Navigate to the player you want to assign the special role to

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrepqj1001u356v5fepto4w-annotated.png)

### Step 24: Click Assign role button

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrf8n5a002e356vmyn5b9ee-annotated.png)

### Step 25: Select the right role

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrknuo400ej356vbbjkv8uh-annotated.png)

### Step 26: Choose extra teleports from the list

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrf8wcs002f356vacwkzk01-annotated.png)

### Step 27: Choose your preferred game server

Choose to activate the teleport role on individual game servers or globally across all servers, allowing flexible permission management based on your game's structure and needs.

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrfj6jk0039356vwo9846tm-annotated.png)

### Step 28: Click Save changes button

You made it to the end!

![](https://layerpath-recording-prod.s3-accelerate.amazonaws.com/clyr0pthc0008ju0cpgk6zvy7/clyr4po6b0065l90ch2iwjbq3/clyrflhpm003a356vkuy7ch54-annotated.png)
