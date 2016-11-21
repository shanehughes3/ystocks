const https = require("https"),
      requestHostname = "api.login.yahoo.com",
      requestBasePath = "/oauth/v2/get_request_token";

function OAuth(authParams) {

    sendRequest();

    function sendRequest() {
	const req = https.request(buildRequestOptionsObject(), function(res) {
	    let data = "";
	    res.on("data", (d) => {data += d});
	    res.on("end", function() {
		console.log(data); //////
	    });
	});
	req.on("error", (e) => console.log(e));
	req.end();
    }

    function buildRequestOptionsObject() {
	const output = {
	    hostname: requestHostname,
	    path: requestBasePath + buildRequestQueryString(),
	    method: "GET"
	};
	return output;
    }

    function buildRequestQueryString() {
	let output = "?oauth_timestamp=" + Date.now();
	output += "\&oauth_nonce=" + generateNonce();
	output += "\&oauth_consumer_key=" + authParams.key;
	output += "\&oauth_signature_method=plaintext";
	output += "\&oauth_signature=" + authParams.secret + "%26";
	output += "\&oauth_version=1.0";
	output += "\&oauth_callback=oob";
	return output;
    } 

    function generateNonce() {
	const nonceLength = 32;
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
	      "abcdefghijklmnopqrstuvwxyz";
	let nonce = "";
	for (let i = 0; i < nonceLength; i++) {
	    const randIndex = Math.floor(Math.random() * chars.length);
	    nonce += chars[randIndex];
	}
	return nonce;
    }
}

module.exports = OAuth;
