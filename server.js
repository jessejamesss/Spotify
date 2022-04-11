const http = require('http');

const server = http.createServer((req, res) => {
    console.log('request made');
    if (req.url == '/') {
        res.write('My first server!');
        res.end();
    }
});


server.listen(3000, 'localhost', () => {
    console.log('listening for requests on port 3000');
});
