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

        let espPositions: {[espId: string]: number[]} = {};
        let serverData: LiveClientMap = {};
        async function fetchDataFromServer() {
            serverData = await (await fetch("/api/get-live-data")).json();
            espPositions = await (await fetch("/positions.json")).json();
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
        addEventListener("resize", resize);
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
        }
        frame();
    }, []);
    return <canvas ref={canvasRef} id="canvas" className={styles.canvas}></canvas>;
}