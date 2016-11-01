const https = require("https");

function Api() {
    if (!(this instanceof Api)) {
	return new Api();
    }
    
    const yahooHostname = "query.yahooapis.com",
	  basePath = "/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys";
    
    this.quote = function(symbols, cb) {
	if (!Array.isArray(symbols)) {
	    symbols = [symbols];
	}
	const options = {
	    hostname: yahooHostname,
	    path: generateStockPath(symbols),
	    method: "GET"
	};
	sendRequest(options, function(err, data) {
	    if (err) {
		cb(err);
	    } else if (data.query.results) {
		const results = (Array.isArray(data.query.results.quote)) ?
		      data.query.results.quote :
		      [data.query.results.quote];
		cb(null, results, removeResults(data));
	    } else {
		console.log("here");
		cb(null, data);
	    }
	}); 
    }
    
    this.history = function(params, cb) {
	try {
	    params = checkHistoryParams(params);

	    const options = {
		hostname: yahooHostname,
		path: generateHistoryPath(params),
		method: "GET"
	    };
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
    
    function generateStockPath(symbols) {
	output = basePath;
	output += "&q=select * from yahoo.finance.quotes where symbol in (";
	symbols.forEach(function(symbol, index) {
	    if (index > 0) {
		output += ",";
	    }
	    output += "'" + symbol + "'";
	});
	output += ")";
	return encodeURI(output);
    }
    
    function generateHistoryPath(params) {
	output = basePath;
	output += "&q=select * from yahoo.finance.historicaldata where ";
	output += `symbol = "${params.symbol}" and `;
	output += `startDate = "${params.start}" and `;
	output += `endDate = "${params.end}"`;
	return encodeURI(output);
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
    const date = new Date(dateString + "UTC");
    return date.toISOString().slice(0,10);
}

function sendRequest(options, internalCb) {
    const req = https.request(options, function(res) {
	let data = "";
	res.on("data", (d) => {data += d});
	res.on("end", function() {
	    data = JSON.parse(data);
	    if (data.error) {
		const err = new Error(data.error.description);
		err.name = "ResponseError";
		internalCb(err);
	    } else {
		internalCb(null, data);
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
    return responseObject;
}

module.exports = Api;
