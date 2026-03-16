"use client";

import { Tooltip as ReactTooltip } from "react-tooltip";
import { useEffect, useState } from "react";

export function TooltipProvider() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <ReactTooltip id="main-tooltip" className="!max-w-[250px]" />;
}
