const nodeStatic = require("node-static");

const file = new nodeStatic.Server(".");
const PORT = 8080;

console.info(`Running at http://localhost:${PORT}`);

require("http")
  .createServer(function (request, response) {
    request
      .addListener("end", function () {
        file.serve(request, response);
      })
      .resume();
  })
  .listen(PORT);
