import { Position } from "./position";
import { readFileSync } from "fs";
//const PERIPHERAL_ID_WHITELIST: Array<string> = ["A", "B", "C"];
//PERIPHERAL_ID_WHITELIST.push(...(process.env.PERI_WHITELIST || "").trim().split(",").map(x => x.trim()));

interface JsonPositions {
    [address: string]: number[];
}
interface ParsedPositions {
    [address: string]: Position;
}

const PERIPHERAL_POSITIONS_JSON: JsonPositions = JSON.parse(readFileSync("public/positions.json", {encoding: "utf8"}));
const PERIPHERAL_POSITIONS: ParsedPositions = Object.fromEntries(
    Object.entries(PERIPHERAL_POSITIONS_JSON)
    .map((ent)=>{
        return [ent[0], new Position(ent[1][0], ent[1][1])];
    })
);
console.log(PERIPHERAL_POSITIONS);
//signal strength currently a distance
//signal strength should be a negative rssi integer
export class NetworkTarget {
    datapoints: Map<string, number>;
    pos: Position;
    address: string;
    posAverage: Position;
    constructor(address: string) {
        this.address = address;
        this.datapoints = new Map();
        this.pos = new Position(0, 0);
        this.posAverage = new Position(0, 0);
    }
    triangulate() {
        if (!this.checkIfEnoughDatapoints()) {
            return new Position(0, 0);
        }
        const fallback = new Position(0, 0);

        const keys = [...this.datapoints.keys()].slice(0, 3);

        const d1 = (this.datapoints.get(keys[0]) ?? 0);
        const p1 = PERIPHERAL_POSITIONS[keys[0]] ?? fallback;

        const d2 = (this.datapoints.get(keys[1]) ?? 0);
        const p2 = PERIPHERAL_POSITIONS[keys[1]] ?? fallback;

        const d3 = (this.datapoints.get(keys[2]) ?? 0);
        const p3 = PERIPHERAL_POSITIONS[keys[2]] ?? fallback;

        const xcoef1 = 2*p1.x - 2*p2.x;
        const ycoef1 = 2*p1.y - 2*p2.y;
        const xcoef2 = 2*p1.x - 2*p3.x;
        const ycoef2 = 2*p1.y - 2*p3.y;

        const eq1_answer = d2**2 - d1**2 + 
            (p2.x**2 - p1.x**2 + p2.y**2 - p1.y**2);
        
        const eq2_answer = d3**2 - d1**2 + 
            (p3.x**2 - p1.x**2 + p3.y**2 - p1.y**2);
    
        const A_1 = xcoef1;
        const B_1 = ycoef1;
        const C_1 = eq1_answer;  
        
        const A_2 = xcoef2;
        const B_2 = ycoef2;
        const C_2 = eq2_answer;

        // y = (C_1-A_1x)/B_1
        // A_2x + B_2((C_1-A_1x)/B_1) = C_2

        // A_2*B_1*x + B_2*C_1 - B_2*A_1*x = C_2*B_1
        // (A_2*B_1 - B_2*A_1)*x = C_2*B_1 - B_2*C_1
        const x = ( C_2*B_1 - B_2*C_1 ) /
                  ( A_2*B_1 - B_2*A_1 );
        const y = (C_1 - A_1*x) / B_1;
        console.log(`Triangulation succeeded on SSID: ${this.address}`);
        return new Position(x, y);
    }
    addSignalData(peripheralId: string, signalStrength: number) {
        console.log(`Distance to ${this.address} from ${peripheralId} is ${this.rssiToDistance(signalStrength)}m (RSSI=${signalStrength})`)
        this.datapoints.set(peripheralId, this.rssiToDistance(signalStrength) * 20);
        this.pos = this.triangulate();
        this.posAverage = this.posAverage.lerp(this.pos, 0.15);
    }
    checkIfEnoughDatapoints() {
        return [...this.datapoints.keys()].length >= 3;
    }
    rssiToDistance(rssi: number): number {
        const txPower = -51; // RSSI at 1 meter
        return Math.pow(10, (txPower - rssi) / (10 * 2));
    }
}

// esp32 = EC:94:* (small, black board)
// esp8266 = D8:F1:* (large breadboard)
// CYD = 10:06:* (cheap yellow display)