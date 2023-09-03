// DataUtility.ts
import { InputData } from './data-models/InputData'
import { FlattenedData } from './data-models/FlattenedData';

export class DataUtility {
  static flattenData(input: InputData): FlattenedData[] {
    const result: FlattenedData[] = [];
    for (const bookmaker of input.bookmakers) {
      for (const market of bookmaker.markets) {
        for (const outcome of market.outcomes) {
          result.push({
            id: input.id,
            sport_key: input.sport_key,
            sport_title: input.sport_title,
            commence_time: input.commence_time,
            home_team: input.home_team,
            away_team: input.away_team,
            bookmaker: bookmaker.key,
            market_key: market.key,
            market_last_update: market.last_update,
            outcome_name: outcome.name,
            price: outcome.price,
            point: outcome.point
          });
        }
      }
    }
    return result;
  }

  static flattenDataBulk(inputs: InputData[]): FlattenedData[] {
    const results: FlattenedData[] = [];
    for (const input of inputs) {
      const flattenedSingle = this.flattenData(input);
      results.push(...flattenedSingle);
    }
    return results;
  }
}

// Usage example can be similar:
// import { DataUtility } from './DataUtility';
// const inputDataArray: InputData[] = [/* ... array of your JSON data ... */];
// const flattenedBulk = DataUtility.flattenDataBulk(inputDataArray);
// console.log(flattenedBulk);
