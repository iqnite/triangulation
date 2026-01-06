"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { NetworkInfo } from "@/app/api/fetch-network-info/route"

export default function Home() {
  const [networks, setNetworks] = useState<NetworkInfo[]>([])

  useEffect(() => {
    if (!networks.length) fetch('/api/fetch-network-info')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: NetworkInfo[]) => {
        setNetworks(data);
        console.log(data)
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  });

  //useEffect(() => {
  //  setPoints([
  //    {x: 0, y: 0},
  //    {x: 200, y: 200}
  //  ])
  //}, [])
  //
  function printMousePosition(event: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setNetworks([...networks, { ssid: "Custom Point", pos: { x, y } }]);
    console.log(`Clicked at: (${x}, ${y})`);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          {networks.map((point, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: point.pos.x,
                top: point.pos.y,
                width: 10,
                height: 10,
                transform: "translate(-50%, -50%)",
                backgroundColor: "red",
                borderRadius: "50%",
              }}
              title={point.ssid}
            />
          ))}
          <Image
            src="/map.svg"
            alt="Map of Reaktor"
            loading="eager"
            width={1821}
            height={1069}
            onClick={printMousePosition}
          />
        </div>
      </main>
    </div>
  );
}
