import fs from "node:fs";
import url from "node:url";
import path from "node:path";
import { Position } from "./position";
import { LiveClientMap } from "@/app/api/post-signal-data/route";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const networkFilePath = path.join(__dirname, "..", "..", "networks.json");
const liveFilePath = path.join(__dirname, "..", "..", "live.json");

type NetworkData = {
    pos: Position;
    address: string;
    posAverage: Position;
};

export function readNetworks(): NetworkData[] {
    return JSON.parse(fs.readFileSync(networkFilePath, "utf-8"));
}

export function writeNetworks(data: NetworkData[]) {
    fs.writeFileSync(networkFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readLive(): LiveClientMap {
    return JSON.parse(fs.readFileSync(liveFilePath, "utf-8"));
}

export function writeLive(data: LiveClientMap) {
    fs.writeFileSync(liveFilePath, JSON.stringify(data, null, 2), "utf-8");
}
