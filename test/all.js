const api = require("../index"),
      assert = require("assert");

const Api = new api();

const symbols = ["GOOG", "AAPL"];

Api.quote(symbols, function(err, data, meta) {
    assert.ifError(err);
    assert.equals(data[0].symbol, "GOOG");
    assert.equals(data[1].symbol, "AAPL");
});


const params = {
    symbol: "GOOG",
    start: "August 30, 2016",
    end: "September 2, 2016"
};

Api.history(params, function(err, data, meta) {
    assert.ifError(err);
    assert.equals(data[0].Symbol, "GOOG");
    assert.equals(data[0].Date, "2016-09-02");
});
/*
Api.history({symbol:'"="', start:"08-30-2016", end:"09-09-2016"},
	     function(err, data, meta) {
		 console.log(err, data, meta);
	     });
*/
