import { Geist, Instrument_Serif } from "next/font/google";

// The page's one voice, and the serif it leans into for the odd emphasised word and the big numerals.
export const geist = Geist({ subsets: ["latin"], weight: ["400"] });
export const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--serif" });
