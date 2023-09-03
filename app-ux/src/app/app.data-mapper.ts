// DataUtility.ts
import { FlattenedDisplayData } from './data-models/FlattenedDisplayData';

export class DataUtility {

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