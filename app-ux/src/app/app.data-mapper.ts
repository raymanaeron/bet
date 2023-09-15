// app.data-mapper.ts
import { GameRowData } from './data-models/GameRowData';
import { TeamData } from './data-models/TeamData';

export class DataUtility {

  public static flattenGameData(data: any[]): GameRowData[] {
    var result: GameRowData[] = [];

    if (!Array.isArray(data)) {
      console.error("Input data is not an array");
      return result;
    }

    data.forEach(item => {
      item.bookmakers.forEach((bookmaker: any) => {
        var period_name = "";
        const homeTeamData: TeamData = { team_name: item.home_team, market_last_update: "" };
        const awayTeamData: TeamData = { team_name: item.away_team, market_last_update: "" };

        bookmaker.markets.forEach((market: any) => {

          if (market.key.startsWith('spreads') || market.key.startsWith('h2h')) {

            let targetHomeTeamData: TeamData;
            let targetAwayTeamData: TeamData;

            switch (market.key) {
              case "spreads_h1":
              case "h2h_h1":
                targetHomeTeamData = {};
                targetAwayTeamData = {};
                period_name = "H1";
                break;
              case "spreads_q1":
              case "h2h_q1":
                targetHomeTeamData = {};
                targetAwayTeamData = {};
                period_name = "Q1";
                break;
              case "spreads_q3":
              case "h2h_q3":
                targetHomeTeamData = {};
                targetAwayTeamData = {};
                period_name = "Q3";
                break;
              default:
                targetHomeTeamData = homeTeamData;
                targetAwayTeamData = awayTeamData;
                period_name = "ENTIRE";
                break;
            }

            market.outcomes?.forEach((outcome: any) => {
              const currentTeam = outcome.name === item.home_team ? targetHomeTeamData : targetAwayTeamData;
              currentTeam.market_last_update = market.last_update;

              if (outcome.name !== 'Over' && outcome.name !== 'Under') {
                if (market.key.startsWith('spreads')) {
                  currentTeam.spread_point = outcome.point;
                  currentTeam.spread_price = outcome.price;
                } else if (market.key.startsWith('h2h')) {
                  currentTeam.money_line = outcome.price;
                }
              }
            });

            if (period_name === "H1") {
              result.push({
                period: period_name,
                id: item.id,
                sport_key: item.sport_key,
                sport_title: item.sport_title,
                bookmaker_key: bookmaker.title === "William Hill (US)" ? "Caesars" : bookmaker.title,
                commence_time: item.commence_time,
                game: `${item.home_team} vs. ${item.away_team}`,
                h1_home_team_data: targetHomeTeamData,
                h1_away_team_data: targetAwayTeamData,
              });
            } else if (period_name === "Q1") {
              result.push({
                period: period_name,
                id: item.id,
                sport_key: item.sport_key,
                sport_title: item.sport_title,
                bookmaker_key: bookmaker.title === "William Hill (US)" ? "Caesars" : bookmaker.title,
                commence_time: item.commence_time,
                game: `${item.home_team} vs. ${item.away_team}`,
                q1_home_team_data: targetHomeTeamData,
                q1_away_team_data: targetAwayTeamData,
              });
            } else if (period_name === "Q3") {
              result.push({
                period: period_name,
                id: item.id,
                sport_key: item.sport_key,
                sport_title: item.sport_title,
                bookmaker_key: bookmaker.title === "William Hill (US)" ? "Caesars" : bookmaker.title,
                commence_time: item.commence_time,
                game: `${item.home_team} vs. ${item.away_team}`,
                q3_home_team_data: targetHomeTeamData,
                q3_away_team_data: targetAwayTeamData,
              });
            } else {
              result.push({
                period: period_name,
                id: item.id,
                sport_key: item.sport_key,
                sport_title: item.sport_title,
                bookmaker_key: bookmaker.title === "William Hill (US)" ? "Caesars" : bookmaker.title,
                commence_time: item.commence_time,
                game: `${item.home_team} vs. ${item.away_team}`,
                entire_home_team_data: targetHomeTeamData,
                entire_away_team_data: targetAwayTeamData,
              });
            }
          }

          if (market.key.startsWith('totals')) {
            period_name = "ENTIRE";
            market.outcomes?.forEach((outcome: any, index: number) => {
              // Using index to determine the current team: 0 is away and 1 is home
              const currentTeam = index === 0 ? awayTeamData : homeTeamData;

              if (outcome.name === 'Under') {
                currentTeam.total_point_under = outcome.point;
                currentTeam.total_price_under = outcome.price;
              } else if (outcome.name === 'Over') {
                currentTeam.total_point_over = outcome.point;
                currentTeam.total_price_over = outcome.price;
              }
            });

            result.push({
              period: period_name,
              id: item.id,
              sport_key: item.sport_key,
              sport_title: item.sport_title,
              bookmaker_key: bookmaker.title === "William Hill (US)" ? "Caesars" : bookmaker.title,
              commence_time: item.commence_time,
              game: `${item.home_team} vs. ${item.away_team}`,
              entire_home_team_data: homeTeamData,
              entire_away_team_data: awayTeamData,
            })
          }

        });
      });
    });

    result.sort((a, b) => {
      // First, compare by commence_time
      if (a.commence_time < b.commence_time) {
        return -1;
      }
      if (a.commence_time > b.commence_time) {
        return 1;
      }

      // If commence_times are equal, compare by game id
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }

      // If game ids are equal, then compare by bookmaker_key
      if (a.bookmaker_key < b.bookmaker_key) {
        return -1;
      }
      if (a.bookmaker_key > b.bookmaker_key) {
        return 1;
      }

      // by period
      if (a.period < b.period) {
        return -1;
      }
      if (a.period > b.period) {
        return 1;
      }

      return 0; // if both are equal
    });

    return result;
  }
}