import { writeLive, writeNetworks } from "@/lib/networkObjects";
import { NetworkTarget } from "@/lib/peripherals";

export type NetworkInfo = {
    ssid: string;
    rssi: number;
};
export type DeviceData = {
    device: string;
    networks: NetworkInfo[];
};

export type LiveClientMap = {
    [
        espId: string
    ]: {
        [
            ssid: string
        ]: number
    }
};

export const incomingData: Array<DeviceData> = [];
export const liveClientMap: LiveClientMap = {};

export async function POST(request: Request) {
    const body = (await request.json()) as {
        device: string;
        networks: NetworkInfo[];
    };

    if (!body.networks || !body.device) {
        return new Response("400 Bad Request", { status: 400 });
    }

    liveClientMap[body.device] = {};
    body.networks.forEach(net => {
        liveClientMap[body.device][net.ssid] = NetworkTarget.rssiToDistance(net.rssi);
    });
    writeLive(liveClientMap);

    const deviceId = body.device;

    if (incomingData.some((d) => d.device == deviceId)) {
        console.log("Conflict: Device data already exists");
        return new Response("409 Conflict", { status: 409 });
    } else {
        incomingData.push(body);
        if (incomingData.length >= 3) {
            const networkObjects: NetworkTarget[] = [];
            console.log("Starting data completion");
            for (const d of incomingData) {
                console.log(`-- Processing data from device: ${d.device} --`);
                // add to networkobjects, and update sensors if already exist
                for (const n of d.networks) {
                    const existingNetwork = networkObjects.find(
                        (no) => no.address == n.ssid
                    );
                    if (existingNetwork) {
                        existingNetwork.addSignalData(d.device, n.rssi);
                        console.log(
                            `Updated existing network: ${n.ssid} with data from device: ${d.device}, total datapoints: ${existingNetwork.datapoints.size}`
                        );
                    } else {
                        networkObjects.push(
                            new NetworkTarget(n.ssid).addSignalData(
                                d.device,
                                n.rssi
                            )
                        );
                        console.log(
                            `Added new network: ${n.ssid} with data from device: ${d.device}`
                        );
                    }
                }
            }
            console.log("Data processing complete", networkObjects[0].pos);
            incomingData.splice(0, incomingData.length);
            writeNetworks(
                networkObjects
                    .filter((no) => no.pos.x != 0)
                    .map((no) => ({
                        address: no.address,
                        pos: no.pos,
                        posAverage: no.posAverage,
                    }))
            );
        }
    }

    return new Response(null, { status: 200 });
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
