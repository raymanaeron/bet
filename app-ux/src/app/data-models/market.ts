import { Outcome } from "./outcome";

export interface Market {
    key: string
    last_update: string
    outcomes: Outcome[]
}