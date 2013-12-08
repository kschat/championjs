
var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    config = require('./config');


function main(argv) {
    new HttpServer({
        'GET': createServlet(StaticServlet),
        'HEAD': createServlet(StaticServlet)
    }).start(Number(argv[2]) || config.serverPort);
}

function escapeHtml(value) {
    return value.toString().
        replace('<', '&lt;').
        replace('>', '&gt;').
        replace('"', '&quot;');
}

function createServlet(Class) {
    var servlet = new Class();
    return servlet.handleRequest.bind(servlet);
}

function HttpServer(handlers) {
    this.handlers = handlers;
    this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function (port) {
    this.port = port;
    this.server.listen(port);
    console.log('Http Server running at http://localhost:' + port + '/');
};

HttpServer.prototype.parseUrl_ = function (urlString) {
    var parsed = url.parse(urlString);

    parsed.pathname = url.resolve('/', parsed.pathname);

    return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function (req, res) {

    req.url = this.parseUrl_(req.url);

    var handler = this.handlers[req.method];
    if (!handler) {
        res.writeHead(501);
        res.end();
    } else {
        handler.call(this, req, res);
    }
};

/**
 * Handles static content.
 */
function StaticServlet() {
}

StaticServlet.MimeMap = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml',
    'json': 'application/json',
    'js': 'text/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'svg': 'image/svg+xml'
};

StaticServlet.prototype.handleRequest = function (req, res) {
    var self = this;
    var root = '../';

    var path = (root + req.url.pathname).replace('//', '/').replace(/%(..)/g, function (match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });


    if (path == root) {
        return self.sendFile_(req, res, config.indexPath);
    }

    return self.sendFile_(req, res, path);
}


StaticServlet.prototype.sendFile_ = function (req, res, path) {
    var self = this;
    var file = fs.createReadStream(path);

    res.writeHead(200, {
        'Content-Type': StaticServlet.
            MimeMap[path.split(/[. ]+/).pop()] || 'text/plain'
    });
    if (req.method === 'HEAD') {
        res.end();
    } else {

        file.on('data', res.write.bind(res));
        file.on('close', function () {
            res.end();
        });

        file.on('error', function (error) {
            return self.sendFile_(req, res, config.indexPath);
        })
    }
};


// Must be last,
main(process.argv);