/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
const q = require('querystring');
const url = require('url');
const sortBy = require('sort-by');

var messages = [{
  username: 'shawndrost',
  text: 'trololo',
  roomname: '4chan'
}, {
  username: 'lino',
  text: 'I run this cat',
  roomname: '4chan'
}, {
  username: 'diane',
  text: 'This is dianes message',
  roomname: '4chan'
}, {
  username: 'john',
  text: 'they my name is john',
  roomname: '4chan'
},{
  username: 'shawndrost',
  text: 'trololo (lobby)',
  roomname: 'lobby'
}, {
  username: 'lino',
  text: 'I run this cat (lobby)',
  roomname: 'lobby'
}, {
  username: 'diane',
  text: 'This is dianes message (lobby)',
  roomname: 'lobby'
}, {
  username: 'john',
  text: 'they my name is john (lobby)',
  roomname: 'lobby'
}].map(function(item, i){
  item.objectId = i;
  item.createdAt = Date.now();
  return item
});

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  // var statusCode = 200;

  // See the note below about CORS headers.
  // var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';

  // // .writeHead() writes to the request line and headers of the response,
  // // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // // Make sure to always call response.end() - Node may not send
  // // anything back to the client until you do. The string you pass to
  // // response.end() will be the body of the response - i.e. what shows
  // // up in the browser.
  // //
  // // Calling .end "flushes" the response's internal buffer, forcing
  // // node to actually send all the data over to the client.
  // response.end('Hello, World!');

  var headers = defaultCorsHeaders;

  headers['Content-Type'] = 'text/plain';
  
  if ( /\/classes\/messages/ig.test( request.url ) ) {

    handleChat(request, response, headers, function(statusCode, headers, data){

      response.writeHead( statusCode, headers );
      response.end( data )

    });

  } else {
    handleError( response, headers );
  }
  

};

var handleChat = function(req, res, headers, cb) {
  var data = '';
  var statusCode = 200;
  let messagesToSend = messages.concat();
  
  headers['Content-Type'] = 'application/json';

  if (req.method === 'GET') {
    
    query = q.parse( url.parse(req.url).query );
    console.log(query)


    if( Object.prototype.hasOwnProperty.call( query, 'order') ){
      messagesToSend.sort( sortBy( query.order ) )
    }
    
    data = JSON.stringify( { results: messagesToSend} );

  } else if (req.method === 'POST') {

    var body = '';

    req.on('data', function( postData ){
      body += postData;
      // check for overload
      if(body.length > 1e6) {
        body = "";
        res.writeHead(413, {'Content-Type': 'text/plain'}).end();
        req.connection.destroy();
      }

    });

    req.on('end', function(){

      body = JSON.parse( body );

      body.createAt = Date.now();
      body.objectId = messagesToSend.length;

      // append to real message array
      messages.push( body );
      messagesToSend.push( body )
      // needed because of async code
      cb( 201 , headers, JSON.stringify(messagesToSend) );
    });

    // stop exec for rest of function
    return;
    
  } else if (req.method === 'OPTIONS') {

    headers['Content-Type'] = 'text/plain'
    headers['Allow'] = 'GET, POST, PUT, DELETE, OPTIONS';
    data = 'good to go';

  } else {
    handleError( res, headers );
  }

  cb( statusCode, headers, data );

}

var handleError = function(res, headers) {
  res.writeHead(404, headers);
  res.end('Route does not exist');
}


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};


exports.requestHandler = requestHandler;
