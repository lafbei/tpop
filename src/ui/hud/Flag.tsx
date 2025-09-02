import React from "react";


export const Flag: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
    if (!src) return <div style={{ backgroundColor: "yellow", width: "100px", height: "60px" }} />;
    return <img src={src} alt={alt} className="hud-flag" />;
};