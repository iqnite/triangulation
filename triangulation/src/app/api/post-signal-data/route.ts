import { NetworkTarget } from "@/lib/peripherals";

type NetworkInfo = {
    ssid: string,
    rssi: number
}

export const networkObjects: Array<NetworkTarget> = [];

export async function POST(request: Request) {
    const body = await request.json();
    
    console.log(JSON.stringify(body));

    if (
        (!body.networkRssis) ||
        (!body.device)
    ) {
        const response = new Response(null, {
            status: 400, statusText: "Your network request sucks", headers: {
                "Reply": "Bad-Job"
            }
        });
        return response;
    }

    body.networkRssis.forEach((netw: NetworkInfo) => {
        let oldTarget = networkObjects.find((t) => t.address === netw.ssid);
        if (!oldTarget) {
            oldTarget = new NetworkTarget(netw.ssid);
            networkObjects.push(oldTarget);
        }
        oldTarget.addSignalData(body.device, netw.rssi);
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