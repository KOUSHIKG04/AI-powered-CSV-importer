import http from "http";
import application from "@/application";
import dotenv from "dotenv";

dotenv.config();

const PORTNO = process.env.PORT_NUMBER || 8001;
const server = http.createServer(application);

server.listen(PORTNO, () => {
  console.log(`Server running on port ${PORTNO}`);
});