"use client";

import React, { useRef, useEffect } from 'react';
import styles from "./live.module.css";
import { LiveClientMap } from '../api/post-signal-data/route';

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        /** @type {HTMLCanvasElement} */
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }
        if (canvas.getAttribute("data-init") === "done") {
            return;
        }
        canvas.setAttribute("data-init", "done");

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        let espPositions: { [espId: string]: number[] } = {};
        let serverData: LiveClientMap = {};
        async function fetchDataFromServer() {
            serverData = await (await fetch("/api/get-live-data")).json();
            espPositions = await (await fetch("/positions_relative.json")).json();
            frame();
        }
        setInterval(fetchDataFromServer, 10000);

        function vw(x: number) {
            return x * innerWidth * devicePixelRatio;
        }
        function vh(x: number) {
            return x * innerHeight * devicePixelRatio;
        }
        function resize() {
            if (!canvas || !ctx) {
                return;
            }
            canvas.width = innerWidth * devicePixelRatio;
            canvas.height = innerHeight * devicePixelRatio;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, vw(1), vh(1));
            frame();
        }
        resize();
        window.addEventListener("resize", resize);
        canvas.addEventListener("click", (ev) => {
            console.log(`Relclick Position: X=${(ev.clientX / vw(1)).toFixed(4)}, Y=${(ev.clientY / vh(1)).toFixed(4)}`);
        });
        type Circle = {
            x: number,
            y: number,
            r: number,
            espId: string
        }
        type ReverseClientMap = {
            [
            ssid: string
            ]: Circle[]
        };
        type ExtractedNetwork = {
            x: number,
            y: number,
            ssid: string
        }
        const colors = ["magenta", "red", "cyan", "limegreen", "yellow"];
        function frame() {
            if (!ctx || !canvas) {
                return;
            }
            const reverseMap: ReverseClientMap = {};
            Object.entries(serverData).forEach(entry => {
                const espId = entry[0];
                Object.entries(entry[1]).forEach(networkEnt => {
                    const ssid = networkEnt[0];
                    const dist = networkEnt[1];

                    reverseMap[ssid] ||= [];
                    reverseMap[ssid].push({
                        espId,
                        x: espPositions[espId][0],
                        y: espPositions[espId][1],
                        r: dist
                    })
                })
            });
            const networkPositions: ExtractedNetwork[] = [];

            Object.entries(reverseMap).forEach(entry => {
                const ssid = entry[0];
                const circles = entry[1];
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, vw(1), vh(1));

                ctx.globalCompositeOperation = "lighter";
                circles.forEach(circ => {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.34)";
                    ctx.beginPath();
                    ctx.arc(circ.x * vw(1) + vw(0.5), circ.y * vh(1) + vh(0.5), circ.r * vw(0.1) + 1.5, 0, 2 * Math.PI);
                    ctx.fill();
                });

                const width = Math.floor(vw(1));
                const pixelData = ctx.getImageData(0, 0, vw(1), vh(1)).data;
                let denom = 0;
                let avx = 0;
                let avy = 0;
                for (let i = 0; i < pixelData.length; i+=4) {
                    const r = pixelData[i + 0];
                    const g = pixelData[i + 1];
                    const b = pixelData[i + 2];
                    const a = pixelData[i + 3];
                    const px = Math.floor(i / 4) % width;
                    const py = Math.floor(i / 4 / width);
                    if (r===255 && g===0 && b===0) {
                        avx += px;
                        avy += py;
                        denom++;
                    }
                }
                avx /= denom;
                avy /= denom;
                networkPositions.push({
                    x: avx,
                    y: avy,
                    ssid: ssid
                });
            });
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, vw(1), vh(1));
            const map = document.querySelector("img#map");
            if (map instanceof HTMLImageElement) {
                ctx.drawImage(map, 0, 0, vw(1), vh(1));
            }

            networkPositions.map(x => {
                const sorter = Object(x.ssid);
                sorter.original = x;
                return sorter;
            }).sort().map(x => x.original);

            networkPositions.forEach((net, i) => {
                ctx.beginPath();
                console.log(net.x, net.y);
                const col = colors[i % colors.length];
                ctx.shadowColor = col;
                ctx.fillStyle = col;
                ctx.arc(net.x, net.y, 9 * devicePixelRatio, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 6;
                
                ctx.font = "16px monospace";
                ctx.textAlign = "center";
                ctx.fillText(net.ssid, net.x, net.y + 24);
            });

            console.log("frame rendered!", networkPositions);
        }
        frame();

        //horizontal scale = 193.23671497584544
        //vertical scale = 60.67961165048541
    }, []);
    return <div><canvas ref={canvasRef} id="canvas" className={styles.canvas}></canvas>
        <img id='map' src="map.svg"></img></div>;
}