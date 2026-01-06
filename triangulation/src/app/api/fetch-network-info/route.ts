import { NetworkTarget } from "@/lib/peripherals";
import { networkObjects } from "../post-signal-data/route";

type NetworkInfo = {
    ssid: string,
    rssi: number
}

export async function GET(request: Request) {
    const reply = JSON.stringify(networkObjects.map(net => {
        return {
            ssid: net.address,
            pos: {x: net.posAverage.x, y: net.posAverage.y}
        }
    }));

    const response = new Response(reply, {
        status: 200, statusText: "OK", headers: {
            "DataType": "text/json"
        }
    });
    return response;
}