import { TeamData } from "./TeamData";

export interface GameRowData {
    period: string;
    id: string;
    sport_key: string;
    sport_title: string;
    bookmaker_key: string;
    commence_time: string;
    game: string;
    entire_home_team_data?: TeamData;
    entire_away_team_data?: TeamData;
    h1_home_team_data?: TeamData;
    h1_away_team_data?: TeamData;
    q1_home_team_data?: TeamData;
    q1_away_team_data?: TeamData;
    q3_home_team_data?: TeamData;
    q3_away_team_data?: TeamData;
}
