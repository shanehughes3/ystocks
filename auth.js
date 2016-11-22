const https = require("https"),
      qs = require("querystring"),
      crypto = require("crypto"),
      requestHostname = "query.yahooapis.com",
      requestBasePath = "/v1/yql",
      requestBaseQuery = "?env=store://datatables.org/alltableswithkeys" +
      "&format=json";

function OAuth(authParams) {

    this.getAuthQueryParams = function(yqlQuery) {
	return buildRequestOptionsObject(yqlQuery);
    }

    function buildRequestOptionsObject(yqlQuery) {
	const output = {
	    hostname: requestHostname,
	    path: requestBasePath +
		buildRequestQueryString(yqlQuery),
	    method: "GET"
	};
	return output;
    }

    function buildRequestQueryString(yqlQuery) {
	let baseQuery = buildRequestQueryMinusSignature(yqlQuery);
	const signature = generateSignature(baseQuery);
	return `${baseQuery}&oauth_signature=${signature}`;
    }

    function buildRequestQueryMinusSignature(yqlQuery) {
	let output = "?env=" + encode("store://datatables.org/alltableswithkeys");
	output += "&format=json";
	output += "&oauth_callback=oob";
	output += "&oauth_consumer_key=" + authParams.key;
	output += "&oauth_nonce=" + generateNonce();
	output += "&oauth_signature_method=HMAC-SHA1";
	output += "&oauth_timestamp=" + Math.floor(Date.now() / 1000);
	output += "&oauth_version=1.0";
	output += "&q=" + encode(yqlQuery);
	return output;
    }

    function generateSignature(baseQuery) {
	let baseString = "GET&";
	baseString += encode("https://" + requestHostname + requestBasePath);
	baseString += "&" + encode(baseQuery.slice(1));
	const passphrase = encode(authParams.secret) + "&";
	const signature = crypto.createHmac("sha1", passphrase)
	    .update(baseString)
	    .digest("base64");
	return encode(signature);
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

function encode(str) {
    // encodes per RFC 3986
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
	return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

module.exports = OAuth;
