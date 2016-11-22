const https = require("https"),
      OAuth = require("./auth");

function Api(authParams) {
    if (!(this instanceof Api)) {
	return new Api();
    }
    
    const self = this;
    this.auth = null;

    if (typeof authParams === "object") {
	this.auth = new OAuth(authParams);
    }
    
    const yahooHostname = "query.yahooapis.com",
	  basePathPublic = "/v1/public/yql?format=json&" +
	  "env=store://datatables.org/alltableswithkeys",
	  basePathWithAuth = "/v1/yql?format=json&env=store://datatables.org/alltableswithkeys";
    
    this.quote = function(symbols, cb) {
	if (!Array.isArray(symbols)) {
	    symbols = [symbols];
	}
	const options = generateOptions(generateStockPath(symbols));
	sendRequest(options, function(err, data) {
	    if (err) {
		cb(err);
	    } else if (data.query.results) {
		const results = (Array.isArray(data.query.results.quote)) ?
		      data.query.results.quote :
		      [data.query.results.quote];
		cb(null, results, removeResults(data));
	    } else {
		cb(null, null, removeResults(data));
	    }
	}); 
    }
    
    this.history = function(params, cb) {
	try {
	    params = checkHistoryParams(params);
	    const options = generateOptions(generateHistoryPath(params));
	    sendRequest(options, function(err, data) {
		if (err) {
		    cb(err);
		} else if (data.query.results) {
		    cb(null, data.query.results.quote, removeResults(data));
		} else {
		    cb(null, null, removeResults(data));
		}
	    });
	} catch(e) {
	    cb(e);
 	}
    }

    function generateOptions(queryPath) {
	if (self.auth) {
	    return self.auth.getAuthQueryParams(queryPath);
	} else {
	    const options = {
		method: "GET",
		hostname: yahooHostname,
		path: basePathPublic + "&q=" + encodeURIComponenet(queryPath)
	    };
	    return options;
	}
    }
    
    function generateStockPath(symbols) {
	let output = "select * from yahoo.finance.quotes where symbol in (";
	symbols.forEach(function(symbol, index) {
	    if (index > 0) {
		output += ",";
	    }
	    output += "'" + symbol + "'";
	});
	output += ")";
	return output;
    }
    
    function generateHistoryPath(params) {
	let output = "select * from yahoo.finance.historicaldata where ";
	output += `symbol = "${params.symbol}" and `;
	output += `startDate = "${params.start}" and `;
	output += `endDate = "${params.end}"`;
	return output;
    }
}

function checkHistoryParams(params) {
    const start = formatDate(params.start);
    const end = formatDate(params.end);
    return {
	symbol: params.symbol,
	start: start,
	end: end
    };
}

function formatDate(dateString) {
    let date = "";
    if (dateString) {
	date = new Date(dateString + "UTC");
    } else {
	date = new Date();
    }
    return date.toISOString().slice(0,10);
}

function sendRequest(options, internalCb) {
    const req = https.request(options, function(res) {
	let data = "";
	res.on("data", (d) => {data += d});
	res.on("end", function() {
	    try {
		data = JSON.parse(data);
		if (data.error) {
		    const err = new Error(data.error.description);
		    err.name = "ResponseError";
		    internalCb(err);
		} else {
		    internalCb(null, data);
		}
	    } catch (e) {
		let err = new Error("There was a problem authenticating the request");
		err.name = "AuthenticationError";
		internalCb(err);
	    }
	});
    });
    req.on("error", function(err) {
	internalCb(err);
    });
    req.end();
}

function removeResults(responseObject) {
    delete(responseObject.query.results);
    return responseObject.query;
}

module.exports = Api;
