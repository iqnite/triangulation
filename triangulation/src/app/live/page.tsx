"use client";

import React, { useRef, useEffect } from 'react';
import styles from "./live.module.css";

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
        }
        resize();
        addEventListener("resize", resize);
        
        function frame() {
            
        }
        ctx.fillStyle = 'red';
        ctx.fillRect(10, 10, 100, 100);
    }, []);
    return <canvas ref={canvasRef} id="canvas" className={styles.canvas}></canvas>;
}