# ystocks

A Node.js wrapper for the Yahoo! Finance API.

## Usage

```js
const ystocks = require("ystocks"),
      Api = ystocks();

Api.quote(["GOOG", "AAPL"], function(err, data, meta) {
    if (err) {
        console.log(err);
    } else {
        // do stuff with data
        console.log(data[0].AverageDailyVolume);     // "1394830"
        console.log(meta.count);		     		 // 2
    }
});
```

## API

### Import

After importing the module, you must instatiate an api object:

```js
const ystocks = require("ystocks"),
      Api = ystocks();
```

In the future, authentication will take place at this time. For right now,
however, every instance of the wrapper uses the public API. You can read more
about hourly/daily limits on Yahoo's [YQL Guide](https://developer.yahoo.com/yql/guide/usage_info_limits.html).

### Methods

`ystocks` supports requests on two Yahoo! Finance tables: quote and history.
All methods pass three objects to a callback: an error (null on no error),
the stock data, and metadata about the response. All responses
are JS objects - i.e., they are not JSON and should not be parsed.

#### Api.quote(symbols, callback)

Returns current value information for a given stock or stocks.

`symbols` can either be an array of strings (`["GOOG", "YHOO"]`) or a
single string (`"MSFT"`).

`callback` is passed three parameters: `err`, `data`, and `callback`.

- `err` is null on no error.
- `data` is an array of result objects.
  Note that even if only one symbol is given in the query, the result will
  still be at `data[0]`. If the stock does not exist, the object will still
  exist; however, all properties will be null except for `data.Symbol`.
- `meta` is an object containing Yahoo's info on the request.

```js
Api.quote(["F", "YHOO"], function(err, data, meta) {
    if (err) {
        console.log(err);
    } else {
        console.log(data[0].Symbol);    // "F"
		console.log(data[0].Name);      // "Ford Motor Company Common Stock"
		console.log(data[1].Ask);       // "40.05"
		console.log(data[1].PercentChangeFromYearLow); // "+53.58%"
    }
});

Api.quote(["FOOBAR"], function(err, data, meta) {
    if (err) {
        console.log(err);               // null
    } else {
      	console.log(data[0].Name);		// null
		console.log(meta.count);		// 1
		console.log(meta.created);		// "2016-11-11T02:04:49Z"
    }
});
```

#### Api.history(params, callback)

Returns historical stock data for a given stock over a given date range.

`params` is an object with the following parameters:
- `symbol`: a string representing a single stock symbol
- `start`: the start date of the query. This can be any value recognized by
  javascript's `Date.parse()` method.
- `end`: the end date, as above.

`callback` is passed three parameters: `err`, `data`, and `callback`.
- `err` is null on no error.
- `data` is an array of result objects, or null on no response. The array is
  sorted with the newest result first.
- `meta` is an object containing Yahoo's info on the request. If `err` and
  `data` are both null, `meta` will be non-null.

```js
let params = {
    symbol: "GOOG",
    start: "2009-09-11",
    end: "2010-03-10"
};

Api.history(params, function(err, data, meta) {
    if (err) {
        console.log(err);
    } else if (data) {
        console.log(data[0].Date);        // "2010-03-10"
		console.log(data[0].Adj_Close);   // "287.937542"
    } else {
        console.log("No results!");
    }
});

params = {
    symbol: "FOOBAR",
    start: "2012-08-19",
    end: "2013-09-25"
};

Api.history(params, function(err, data, meta) {
    if (err) {
        console.log(err);
    } else if (data) {
        console.log(data[0].Open);
    } else {
        console.log("No results!");        // "No results!"
    }
});
```

## Installation

```bash
npm install ystocks --save
```

## Attribution

Be sure to check Yahoo's [Attribution Guidelines](https://developer.yahoo.com/attribution).

## License

The MIT License (MIT)

Copyright (c) 2016 Shane Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.