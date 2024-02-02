#!/usr/bin/env node

const http = require("node:http");
const app = require("../app");

// Port
const port = process.env.PORT || "3000";
app.set("port", port);

// Server
const server = http.createServer(app);

// Launch
server.listen(port);

// Error-handling
