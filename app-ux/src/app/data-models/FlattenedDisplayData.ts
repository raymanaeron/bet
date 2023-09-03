export interface FlattenedDisplayData {
    id: string;
    sport_key: string;
    sport_title: string;
    bookmaker_key: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    team_name?: string;
    spread_point?: number;
    spread_price?: number;
    total_point_under?: number;
    total_price_under?: number;
    total_point_over?: number;
    total_price_over?: number;
    money_line?: number;
    market_last_update: string;
  }
  