"use client";

import { Tooltip as ReactTooltip } from "react-tooltip";

export function TooltipProvider() {
    return <ReactTooltip id="main-tooltip" className="!max-w-[250px]" />;
}
