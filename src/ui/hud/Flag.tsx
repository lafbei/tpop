import React from "react";


export const Flag: React.FC<{ src?: string; alt?: string; player?: string }> = ({ player }) => {
    let color = 'gray';
    switch (player) {
        case "red":
            color = "red";
            break;
        case "blue":
            color = "blue";
            break;
        case "green":
            color = "green";
            break;
        case "yellow":
            color = "yellow";
            break;
        case "purple":
            color = "purple";
            break;
        case "white":
            color = "white";
            break;
        // Add more cases as needed
    }
    return <div style={{ backgroundColor: color, width: "50px", height: "30px" }} />;
};