const axios = require('axios')

module.exports = function(RED) {
    function StreamDevice(config) {
        RED.nodes.createNode(this,config);
        this.server = RED.nodes.getNode(config.server);

        if (this.server) {
            var node = this;
            node.on('input', function(msg, send, done) {
                send = send || function() { node.send.apply(node,arguments) }
                if (typeof msg.payload === 'object' && msg.payload.hasOwnProperty('id') && node.server.token) {
                    axios.post(
                        "https://" + (node.server.host || "flespi.io") + "/gw/streams/" + config.streamid + "/devices/" + msg.payload.id,
                        null,
                        {
                            headers: {Authorization: "FlespiToken " + node.server.token.replace('FlespiToken ', '')}
                        }
                    ).then(
                        (response) => {
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
        }
    }
    RED.nodes.registerType("stream-device", StreamDevice);
}
