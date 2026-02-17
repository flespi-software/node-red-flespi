const axios = require('axios')

module.exports = function(RED) {
    function CreateDevice(config) {
        RED.nodes.createNode(this,config);
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
                                "device_type_id": parseInt(config.devicetype || 0),
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
                            done();
                        },
                        (error) => {
                            this.idents[msg.payload.ident] = true;
                            if (error.response && error.response.data) {
                                if (error.response.data.result && error.response.data.result[0]) {
                                    msg.payload = error.response.data.result[0];
                                    send([msg, null]);
                                }
                                if (error.response.data.errors) {
                                    msg.payload = error.response.data.errors;
                                    send([null, msg]);
                                }
                                done();
                            } else {
                                done(error);
                            }
                        }
                    ).catch((e) => {
                        done(e);
                    })
                } else {
                    done();
                }
            });
            node.on('close', function() {
                node.idents = {};
            });
        }
    }
    RED.nodes.registerType("create-device", CreateDevice);
}
