module.exports = function(RED) {
    function FlespiServer(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        // migrate token from defaults (v1.0.0) to credentials
        if (!this.credentials.token && n.token) {
            this.credentials.token = n.token;
            RED.nodes.addCredentials(n.id, this.credentials);
        }
        this.token = this.credentials.token;
    }
    RED.nodes.registerType("flespi-server", FlespiServer, {
        credentials: {
            token: {type:"password"}
        }
    });
}
