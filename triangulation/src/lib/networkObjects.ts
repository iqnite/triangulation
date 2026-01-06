import fs from "node:fs";
import url from "node:url";
import path from "node:path";
import { Position } from "./position";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "..", "..", "networks.json");

type NetworkData = {
    pos: Position;
    address: string;
    posAverage: Position;
};

export function readNetworks(): NetworkData[] {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function writeNetworks(data: NetworkData[]) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
