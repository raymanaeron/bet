import { Bookmaker } from "./Bookmaker";

export interface Odd {
    id: string
    sport_key: string
    sport_title: string
    commence_time: string
    home_team: string
    away_team: string
    bookmakers: Bookmaker[]
}