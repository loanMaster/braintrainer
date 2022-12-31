import countries_de from './countries-and-capitals-de.json'
import countries_en from './countries-and-capitals-en.json'
import countries_es from './countries-and-capitals-es.json'
import {randomElement} from "src/util/array.utils";

export interface CountryAndCapital {
  country: string;
  capital: string;
  countryEn: string;
}

export class GeographyService {

  getCountriesAndGeographies(lang: string, count: number): CountryAndCapital[] {
    const result: CountryAndCapital[] = []
    const list = lang === 'de' ? countries_de : lang === 'es' ? countries_es : countries_en
    do {
      const randomEntry: any = randomElement(list as any)
      if (result.indexOf(randomEntry) === -1) {
        randomEntry.countryEn = countries_en[countries_de.indexOf(randomEntry)].country
        result.push(randomEntry)
      }
    } while (result.length < count)
    return result;
  }

}
