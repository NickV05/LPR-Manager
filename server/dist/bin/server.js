"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const http_1 = __importDefault(require("http"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)("server:server");
require("dotenv").config();
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port))
        return val;
    if (port >= 0)
        return port;
    return false;
}
const port = normalizePort(process.env.PORT || "3000");
app_1.default.set("port", port);
const server = http_1.default.createServer(app_1.default);
server.listen(port, (err) => {
    if (err) {
        console.error("Error in server setup:", err);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});
server.on("error", (error) => {
    if (error.syscall !== "listen")
        throw error;
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on("listening", () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr === null || addr === void 0 ? void 0 : addr.port}`;
    debug(`Listening on ${bind}`);
});
//# sourceMappingURL=server.js.map