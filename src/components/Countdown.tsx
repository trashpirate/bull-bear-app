import { useState, useEffect } from "react";

function Countdown({ endTime }) {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endTime));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endTime));
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, [endTime]);

    function calculateTimeLeft(endTime) {

        const now: any = new Date();
        const end: any = new Date(endTime);

        const diff = end - now;

        if (diff <= 0) return "Time's up!";
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return <span>{timeLeft}</span>;
}

export default Countdown;
