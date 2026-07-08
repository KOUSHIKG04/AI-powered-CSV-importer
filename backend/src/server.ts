import http from "http";
import application from "./application.js";
import dotenv from "dotenv";

dotenv.config();

const PORTNO = process.env.PORT_NUMBER || 5000;
const server = http.createServer(application);

server.listen(PORTNO, () => {
  console.log(`Server running on port ${PORTNO}`);
});