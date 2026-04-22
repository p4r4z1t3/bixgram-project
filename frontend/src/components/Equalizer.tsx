import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

const Equalizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isPlaying } = usePlayer();
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const audio = document.querySelector('audio');
        if (!audio || !canvasRef.current) return;

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyzerRef.current = audioCtxRef.current.createAnalyser();
            sourceRef.current = audioCtxRef.current.createMediaElementSource(audio);
            sourceRef.current.connect(analyzerRef.current);
            analyzerRef.current.connect(audioCtxRef.current.destination);
        }

        const analyzer = analyzerRef.current!;
        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#ffffff');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth;
            }
        };

        if (isPlaying) {
            draw();
        } else {
            // Если на паузе — просто рисуем один раз (замирание)
            analyzer.getByteFrequencyData(dataArray);
            draw();
            cancelAnimationFrame(animationRef.current!);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    return (
        <div className="equalizer-container">
            <canvas ref={canvasRef} width={600} height={300} />
            <style>{`
                .equalizer-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                canvas {
                    width: 100%;
                    max-width: 800px;
                    height: 300px;
                }
            `}</style>
        </div>
    );
};

export default Equalizer;
