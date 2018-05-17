# Virtual Paradise Bot SDK Bindings for Node.js

## Install
Run the following in your project folder to install from npm:
```shell
$ npm install --save node-vpsdk
```

## Usage
```javascript
const vpsdk = require("node-vpsdk");

main().catch(error => {
    console.log("error!", error);
});

async function main() {
    const client = new vpsdk.Instance();
    client.on("chat", onChat);
    client.on("avatarAdd", onAvatarAdd);

    await client.connect("universe.virtualparadise.org", 57000);
    await client.login("your username", "your password", "nodejs-test-bot");
    await client.enter("Blizzard"); // change to your preferred world

    // Announce our avatar position so we can receive avatar and chat events
    client.setAvatar([10, 0, 10], 0, 0, 0);

    function onChat(data) {
        console.log(data.name, ": ", data.message);
        if (data.message.startsWith("_")) {
            client.say(data.message.substr(1));
        }
    }

    function onAvatarAdd(data) {
        console.log(data.name, "entered");
    }
}
```

## TODO
- World list
- Get user attributes
- Object add/change/delete/load methods and events
- Object click (method and event)
- Object bump begin/end (methods and events)
- Terrain
- Teleport event
- World settings
- ..more?
