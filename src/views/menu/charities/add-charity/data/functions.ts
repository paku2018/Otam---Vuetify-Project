const API_URL = "https://restcountries.com/v3.1/all";

interface Country {
  name: {
    common: string;
  };
}

async function getCountries() {
  const response = await fetch(API_URL);
  const json: [] = await response.json();
  return json;
}
export async function sortCountries(): Promise<string[]> {
  const countryList = await getCountries();
  const countriesName: string[] = [];
  countryList.forEach((country: Country) => {
    const countryName: string = country.name.common;
    countriesName.push(countryName);
  });
  return countriesName.sort();
}
