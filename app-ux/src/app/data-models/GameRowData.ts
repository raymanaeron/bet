import { TeamData } from "./TeamData";

export interface GameRowData {
    period: string;
    id: string;
    sport_key: string;
    sport_title: string;
    bookmaker_key: string;
    commence_time: string;
    game: string; // Chiefs vs. Lions
    home_team_data: TeamData;
    away_team_data: TeamData;
}