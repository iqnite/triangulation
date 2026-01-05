import { NetworkTarget } from "@/lib/peripherals";

export const networkObjects = new Map<string, NetworkTarget>()
export async function POST(request: Request) {
    const body = await request.json();
    
    console.log(JSON.stringify(body));

    if (
        (!body.networkRssis) ||
        (!body.id)
    ) {
        const response = new Response(null, {
            status: 400, statusText: "Your network request sucks", headers: {
                "Reply": "Bad-Job"
            }
        });
        return response;
    }

    body.networkRssis.forEach((netw) => {
        if (!networkObjects.has(netw["ssid"])) {
            networkObjects.set(netw["ssid"], new NetworkTarget(netw["ssid"]));
        }

        const netTarget = networkObjects.get(netw.ssid);
        if (!netTarget) {
            throw new Error("Network targets should exist!");
        }
        netTarget.addSignalData(netw.ssid, netw.signalData);
    });

    

    const response = new Response(null, {
        status: 200, statusText: "OK", headers: {
            "Reply": "Good-Job"
        }
    });
    return response;
}
/*

{
networkRssis: [
{
ssid: string,
rssi: -10,
}
],
id: string
}
*/