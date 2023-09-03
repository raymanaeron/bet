import { Market } from "./market";

export interface Bookmaker {
    key: string
    title: string
    last_update: string
    markets: Market[]
}