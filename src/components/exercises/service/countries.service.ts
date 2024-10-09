import countries_de from './countries-and-capitals-de.json';
import countries_en from './countries-and-capitals-en.json';
import countries_es from './countries-and-capitals-es.json';
import { randomElement, shuffle } from 'src/util/array.utils';

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
        randomEntry.countryEn = countries_en[list.indexOf(randomEntry)].country;
        result.push(randomEntry);
      }
    } while (result.length < count);
    return result;
  }

  getRandomCapital(lang: string): string {
    return randomElement(this.getList(lang)).capital;
  }

  getRandomCapitals(lang: string, num: number): string[] {
    return shuffle(this.getList(lang).map((c) => c.capital)).splice(0, num);
  }

  getCapitalsByFirstLetter(lang: string, firstLetter: string): string[] {
    const list = this.getList(lang);
    return list
      .filter((c) => c.capital.startsWith(firstLetter))
      .map((c) => c.capital);
  }

  getAllCountries(): string[] {
    return countries_en.map((entry) => {
      return entry.country;
    });
  }
}
