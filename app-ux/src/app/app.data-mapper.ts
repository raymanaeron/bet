// DataUtility.ts
import { FlattenedDisplayData } from './data-models/FlattenedDisplayData';
import { GameRowData } from './data-models/GameRowData';
import { TeamData } from './data-models/TeamData';

export class DataUtility {

  public static flattenGameData(data: any[]): GameRowData[] {
    const result: GameRowData[] = [];

    if (!Array.isArray(data)) {
      console.error("Input data is not an array");
      return result;
    }

    data.forEach(item => {
      item.bookmakers.forEach((bookmaker: any) => {
        const homeTeamData: TeamData = { team_name: item.home_team, market_last_update: "" };
        const awayTeamData: TeamData = { team_name: item.away_team, market_last_update: "" };

        bookmaker.markets.forEach((market: any) => {
          switch (market.key) {
            case 'spreads':
              market.outcomes?.forEach((outcome: any) => {
                const currentTeam = outcome.name === item.home_team ? homeTeamData : awayTeamData;
                currentTeam.market_last_update = market.last_update;

                if (outcome.name !== 'Over' && outcome.name !== 'Under') {
                  currentTeam.spread_point = outcome.point;
                  currentTeam.spread_price = outcome.price;
                }
              });
              break;
            case 'totals':
              market.outcomes?.forEach((outcome: any) => {
                const currentTeam = outcome.name === item.home_team ? homeTeamData : awayTeamData;

                if (outcome.name === 'Under') {
                  currentTeam.total_point_under = outcome.point;
                  currentTeam.total_price_under = outcome.price;
                } else if (outcome.name === 'Over') {
                  currentTeam.total_point_over = outcome.point;
                  currentTeam.total_price_over = outcome.price;
                }
              });
              break;
            case 'h2h':
              market.outcomes?.forEach((outcome: any) => {
                const currentTeam = outcome.name === item.home_team ? homeTeamData : awayTeamData;

                if (outcome.name !== 'Over' && outcome.name !== 'Under') {
                  currentTeam.money_line = outcome.price;
                }
              });
              break;
          }
        });

        result.push({
          id: item.id,
          sport_key: item.sport_key,
          sport_title: item.sport_title,
          bookmaker_key: bookmaker.title,
          game: `${item.home_team} vs. ${item.away_team}`,
          home_team_data: homeTeamData,
          away_team_data: awayTeamData,
        });
      });
    });

    return result;
  }

  public static flattenInputData(data: any[]): FlattenedDisplayData[] {
    const result: FlattenedDisplayData[] = [];

    if (!Array.isArray(data)) {
      console.error("Input data is not an array");
      return result;
    }

    data.forEach(item => {
      if (!Array.isArray(item.bookmakers)) {
        console.error("Item's bookmakers property is not an array");
        return;
      }

      item.bookmakers.forEach((bookmaker: { title: any; markets: any[]; }) => {

        let homeTeamData: FlattenedDisplayData = {
          id: item.id,
          sport_key: item.sport_key,
          sport_title: item.sport_title,
          bookmaker_key: bookmaker.title,
          home_team: item.home_team,
          away_team: item.away_team,
          commence_time: item.commence_time,
          market_last_update: "",
          team_name: item.home_team
        };

        let awayTeamData: FlattenedDisplayData = {
          ...homeTeamData,
          team_name: item.away_team
        };

        if (!Array.isArray(bookmaker.markets)) {
          console.error("Bookmaker's markets property is not an array");
          return;
        }

        bookmaker.markets.forEach((market) => {
          homeTeamData.market_last_update = market.last_update;
          awayTeamData.market_last_update = market.last_update;

          switch (market.key) {
            case 'spreads':
              market.outcomes?.forEach((outcome: { name: string | undefined; point: number | undefined; price: number | undefined; }) => {
                if (outcome.name === homeTeamData.team_name) {
                  homeTeamData.spread_point = outcome.point;
                  homeTeamData.spread_price = outcome.price;
                } else if (outcome.name === awayTeamData.team_name) {
                  awayTeamData.spread_point = outcome.point;
                  awayTeamData.spread_price = outcome.price;
                }
              });
              break;
            case 'totals':
              market.outcomes?.forEach((outcome: { name: string; point: number | undefined; price: number | undefined; }) => {
                if (outcome.name === 'Under') {
                  homeTeamData.total_point_under = outcome.point;
                  homeTeamData.total_price_under = outcome.price;
                  awayTeamData.total_point_under = outcome.point;
                  awayTeamData.total_price_under = outcome.price;
                } else if (outcome.name === 'Over') {
                  homeTeamData.total_point_over = outcome.point;
                  homeTeamData.total_price_over = outcome.price;
                  awayTeamData.total_point_over = outcome.point;
                  awayTeamData.total_price_over = outcome.price;
                }
              });
              break;
            case 'h2h':
              market.outcomes?.forEach((outcome: { name: string; price: number | undefined; }) => {
                if (outcome.name === homeTeamData.team_name) {
                  homeTeamData.money_line = outcome.price;
                } else if (outcome.name === awayTeamData.team_name) {
                  awayTeamData.money_line = outcome.price;
                }
              });
              break;
          }
        });

        result.push(homeTeamData);
        result.push(awayTeamData);
      });
    });

    return result;
  }
}