module.exports = function(RED) {
    function FlespiServer(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.token = n.token;
    }
    RED.nodes.registerType("flespi-server",FlespiServer);
}