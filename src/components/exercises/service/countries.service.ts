import countries_de from './countries-and-capitals-de.json';
import countries_en from './countries-and-capitals-en.json';
import countries_es from './countries-and-capitals-es.json';
import { randomElement } from 'src/util/array.utils';

export interface CountryAndCapital {
  country: string;
  capital: string;
  countryEn: string;
}

export class GeographyService {
  private getList(lang: string) {
    return lang === 'de'
      ? countries_de
      : lang === 'es'
      ? countries_es
      : countries_en;
  }

  getCountriesAndGeographies(lang: string, count: number): CountryAndCapital[] {
    const result: CountryAndCapital[] = [];
    const list = this.getList(lang);
    do {
      const randomEntry: any = randomElement(list as any);
      if (result.indexOf(randomEntry) === -1) {
        randomEntry.countryEn =
          countries_en[countries_de.indexOf(randomEntry)].country;
        result.push(randomEntry);
      }
    } while (result.length < count);
    return result;
  }

  getRandomCapital(lang: string): string {
    return randomElement(this.getList(lang)).capital;
  }

  getCapitalsByFirstLetter(lang: string, firstLetter: string): string[] {
    const list = this.getList(lang);
    return list
      .filter((c) => c.capital.startsWith(firstLetter))
      .map((c) => c.capital);
  }

  getAllCountries(lang: string): string[] {
    return countries_en.map((entry) => {
      return entry.country;
    });
  }
}
