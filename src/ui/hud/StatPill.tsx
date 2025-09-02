import React from "react";


export const StatPill: React.FC<{
    label: string;
    value: number | string;
    title?: string;
}> = ({ label, value, title }) => (
    <div className="hud-pill" title={title}>
    <span className="hud-pill-label">{label}</span>
    <span className="hud-pill-value">{typeof value === "number" ? Math.floor(value) : value}</span>
    </div>
);