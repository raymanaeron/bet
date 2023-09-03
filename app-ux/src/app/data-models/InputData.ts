// InputData.ts
export interface InputData {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: {
      key: string;
      title: string;
      last_update: string;
      markets: {
        key: string;
        last_update: string;
        outcomes: {
          name: string;
          price: number;
          point?: number;
        }[];
      }[];
    }[];
  }
  