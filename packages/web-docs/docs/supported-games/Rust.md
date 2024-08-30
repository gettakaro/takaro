# Rust

Takaro connects to your server using the RCON protocol over websocket

## Setting Up RCON Credentials

Before Takaro can connect to your Rust server, you will need to configure RCON (Remote Console) credentials. These credentials allow Takaro to authenticate and interact with your Rust server through the RCON protocol.

- Locate your server configuration file (server.cfg).
- Ensure that the RCON protocol is enabled by setting rcon.web to 1.
- Set the rcon.password to a strong password that will be used by Takaro to authenticate. The rcon password is a startup parameter. Generally, your server host will provide a field where you can easily edit this.
- Set the rcon.port to define on which port the RCON should listen.

```sh
rcon.web 1
rcon.port 28016
```

Note: The RCON password is sensitive, and you should treat it as a password. It is advised to use a combination of
numbers, letters, lowercase, uppercase, as well as symbols.

## Installing additional mods

Takaro requires some functionality that is not available in vanilla Rust. To install these mods, you will need to install the Oxide mod loader.

You can find the mods [on Github](https://github.com/gettakaro/rust-mods).

## Troubleshooting

### OxideRcon

If you are having trouble connecting to your Rust server, you may need to disable the OxideRcon plugin. This plugin is known to cause issues with RCON connections.

## How Takaro Connects to Your Rust Server

Takaro connects to the Rust server using the RCON protocol using web protocols, which allows it to listen for events happening on the server and send commands and receive responses from the server.
