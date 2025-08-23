"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DcaDashboard() {
    const [budget, setBudget] = useState(1000);
    const [perInterval, setPerInterval] = useState(100);
    const [interval, setIntervalValue] = useState(86400);
    const [periods, setPeriods] = useState(10);
    const [nextExecution, setNextExecution] = useState(Date.now() + interval * 1000);
    const [remaining, setRemaining] = useState(budget);

    // Countdown logic
    const [countdown, setCountdown] = useState(interval);

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = Math.max(0, Math.floor((nextExecution - Date.now()) / 1000));
            setCountdown(diff);
        }, 1000);
        return () => clearInterval(timer);
    }, [nextExecution]);

    // Fake chart data
    const chartData = Array.from({ length: periods }, (_, i) => ({
        name: `T${i + 1}`,
        spent: perInterval * (i + 1),
        remaining: Math.max(0, budget - perInterval * (i + 1)),
    }));

    const handleEncryptSubmit = async () => {
        // TODO: Wire to your actual FHEVM encryption + contract ABI
        console.log("Encrypting & submitting:", { budget, perInterval, interval, periods });
    };

    return (
        <div className="p-6 grid gap-6">
            <Card className="shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>🔐 FHEVM DCA Bot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Total Budget (USDC)</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label>Amount per Interval (USDC)</label>
                            <input
                                type="number"
                                value={perInterval}
                                onChange={(e) => setPerInterval(Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label>Interval (seconds)</label>
                            <input
                                type="number"
                                value={interval}
                                onChange={(e) => setIntervalValue(Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                            <p className="text-xs text-gray-500">
                                86400 = Daily, 3600 = Hourly
                            </p>
                        </div>
                        <div>
                            <label>Total Periods</label>
                            <input
                                type="number"
                                value={periods}
                                onChange={(e) => setPeriods(Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    <div className="text-sm">
                        ⏳ Next execution in: <span className="font-bold">{countdown}s</span>
                    </div>

                    <Button onClick={handleEncryptSubmit} className="w-full">
                        🔐 Encrypt & Submit Intent
                    </Button>
                </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>📊 Budget Tracking</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="spent" stroke="#8884d8" />
                            <Line type="monotone" dataKey="remaining" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
