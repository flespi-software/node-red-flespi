const axios = require('axios')

module.exports = function(RED) {
    function CreateDevice(config) {
        RED.nodes.createNode(this,config);
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);
        this.idents = {}
        if (this.server) {
            var node = this;
            node.on('input', function(msg, send, done) {
                send = send || function() { node.send.apply(node,arguments) }
                if (typeof msg.payload === 'object' && msg.payload.hasOwnProperty('ident') && node.server.token &&
                !this.idents[msg.payload.ident]) {
                    axios.post(
                        "https://" + (node.server.host || "flespi.io") + "/gw/devices",
                        [
                            {
                                "name": config.name.replace('%ident%', msg.payload.ident),
                                "device_type_id": parseInt(config.devicetype || 0) ,
                                "messages_ttl": parseInt(config.messagesttl || 0),
                                "configuration": {
                                    "ident": msg.payload.ident
                                }
                            }
                        ],
                        {
                            headers: {Authorization: "FlespiToken " + node.server.token.replace('FlespiToken ', '')}
                        }
                    ).then(
                        (response) => {
                            this.idents[msg.payload.ident] = true;
                            if (response.data.result && response.data.result[0]) {
                                msg.payload = response.data.result[0];
                                send([msg, null]);
                            }
                            if (response.data.errors) {
                                msg.payload = response.data.errors;
                                send([null, msg]);
                            }
                        },
                        (error) => {
                            this.idents[msg.payload.ident] = true;
                            if (errors.response.data.result && errors.response.data.result[0]) {
                                msg.payload = errors.response.data.result[0];
                                send([msg, null]);
                            }
                            if (error.response.data.errors) {
                                msg.payload = error.response.data.errors;
                                send([null, msg]);
                            }
                            // done(JSON.stringify(msg));
                        }
                    ).catch ((e) => {
                        // done(JSON.stringify(e))
                    })
                }
            });
        } else {
            // No server config
        }
    }
    RED.nodes.registerType("create-device", CreateDevice, {
        credentials: {
            token: {type:"password"}
        }
    });
}