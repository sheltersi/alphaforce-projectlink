import { CountrySelect, GetCountries } from "react-country-state-city";
import type { Country } from "react-country-state-city/dist/esm/types";
import { useEffect, useMemo, useState } from "react";
import "react-country-state-city/dist/react-country-state-city.css";

const CITY_DATA_URL =
    "https://venkatvidyut.github.io/react-country-state-city/data/citiesminified.json";

type City = {
    id: number;
    name: string;
};

type CountryCityData = {
    id: number;
    states?: Array<{
        cities?: City[];
    }>;
};

type CountryCityFieldsProps = {
    idPrefix: string;
    city: string;
    country: string;
    onChange: (city: string, country: string) => void;
    required?: boolean;
    optional?: boolean;
    inputClassName?: string;
    wrapperClassName?: string;
};

let countriesRequest: Promise<Country[]> | undefined;
let citiesRequest: Promise<CountryCityData[]> | undefined;

function getCountries(): Promise<Country[]> {
    countriesRequest ??= GetCountries().catch((error) => {
        countriesRequest = undefined;
        throw error;
    });

    return countriesRequest;
}

function getCountryCities(countryId: number): Promise<string[]> {
    citiesRequest ??= fetch(CITY_DATA_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not load location data.");
            }

            return response.json() as Promise<CountryCityData[]>;
        })
        .catch((error) => {
            citiesRequest = undefined;
            throw error;
        });

    return citiesRequest.then((data) => {
        const country = data.find((item) => item.id === countryId);
        const names = new Set(
            country?.states?.flatMap((state) =>
                (state.cities ?? []).map((city) => city.name),
            ) ?? [],
        );

        return Array.from(names).sort((a, b) => a.localeCompare(b));
    });
}

function FieldIndicator({
    required,
    optional,
}: {
    required: boolean;
    optional: boolean;
}) {
    if (required) {
        return (
            <>
                <span aria-hidden className="text-sienna">
                    *
                </span>
                <span className="sr-only">(required)</span>
            </>
        );
    }

    return optional ? (
        <span className="ml-1.5 rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-bold text-ember-400">
            Optional
        </span>
    ) : null;
}

function CitySearch({
    idPrefix,
    city,
    cities,
    disabled,
    loading,
    className,
    onChange,
}: {
    idPrefix: string;
    city: string;
    cities: string[];
    disabled: boolean;
    loading: boolean;
    className: string;
    onChange: (city: string) => void;
}) {
    const [query, setQuery] = useState(city);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (city) setQuery(city);
    }, [city]);

    const { matchingCities, hasMoreMatches } = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const matches = cities.filter((name) =>
            normalizedQuery
                ? name.toLocaleLowerCase().includes(normalizedQuery)
                : true,
        );

        return {
            matchingCities: matches.slice(0, 50),
            hasMoreMatches: matches.length > 50,
        };
    }, [cities, query]);

    const placeholder = loading
        ? "Loading cities…"
        : disabled
          ? "Select a country first"
          : "Search or select a city";

    return (
        <div className="relative">
            <input
                type="text"
                id={`${idPrefix}-city`}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isOpen && !disabled && !loading}
                aria-controls={`${idPrefix}-city-options`}
                disabled={disabled || loading}
                className={className}
                placeholder={placeholder}
                value={query}
                autoComplete="off"
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                onChange={(event) => {
                    setQuery(event.currentTarget.value);
                    onChange("");
                    setIsOpen(true);
                }}
                onKeyDown={(event) => {
                    if (event.key === "Escape") setIsOpen(false);
                    if (event.key === "Enter" && matchingCities.length === 1) {
                        event.preventDefault();
                        const selectedCity = matchingCities[0];
                        setQuery(selectedCity);
                        onChange(selectedCity);
                        setIsOpen(false);
                    }
                }}
            />
            {isOpen && !disabled && !loading && matchingCities.length > 0 && (
                <div
                    id={`${idPrefix}-city-options`}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-harbor/15 bg-white py-1 shadow-lg"
                >
                    {matchingCities.map((name) => (
                        <button
                            type="button"
                            role="option"
                            aria-selected={name === city}
                            key={name}
                            className="block w-full px-4 py-2 text-left text-sm text-ember hover:bg-sand-100 focus:bg-sand-100 focus:outline-none"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setQuery(name);
                                onChange(name);
                                setIsOpen(false);
                            }}
                        >
                            {name}
                        </button>
                    ))}
                    {hasMoreMatches && (
                        <p className="px-4 py-2 text-xs text-ember-400">
                            Showing the first 50 matches. Keep typing to narrow
                            the list.
                        </p>
                    )}
                </div>
            )}
            {isOpen &&
                !disabled &&
                !loading &&
                matchingCities.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-harbor/15 bg-white px-4 py-3 text-sm text-ember-400 shadow-lg">
                        No matching cities found.
                    </div>
                )}
        </div>
    );
}

export function CountryCityFields({
    idPrefix,
    city,
    country,
    onChange,
    required = false,
    optional = false,
    inputClassName = "h-12 w-full rounded-xl border border-harbor/15 bg-white px-4 text-[14.5px] font-medium text-ember placeholder:font-normal placeholder:text-ember-400/70 shadow-sm outline-none transition focus:border-sienna focus:ring-2 focus:ring-sienna/25 disabled:cursor-not-allowed disabled:bg-sand-100 disabled:opacity-70",
    wrapperClassName = "",
}: CountryCityFieldsProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(true);
    const [cities, setCities] = useState<string[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [citiesFailed, setCitiesFailed] = useState(false);

    useEffect(() => {
        let active = true;

        getCountries()
            .then((items) => {
                if (active) setCountries(items);
            })
            .catch(() => {
                if (active) setCountries([]);
            })
            .finally(() => {
                if (active) setCountriesLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const selectedCountry = countries.find(
        (item) => item.name.toLocaleLowerCase() === country.trim().toLocaleLowerCase(),
    );

    useEffect(() => {
        let active = true;

        if (!selectedCountry) {
            setCities([]);
            setCitiesLoading(false);
            setCitiesFailed(false);
            return () => {
                active = false;
            };
        }

        setCities([]);
        setCitiesLoading(true);
        setCitiesFailed(false);

        getCountryCities(selectedCountry.id)
            .then((items) => {
                if (active) setCities(items);
            })
            .catch(() => {
                if (active) setCitiesFailed(true);
            })
            .finally(() => {
                if (active) setCitiesLoading(false);
            });

        return () => {
            active = false;
        };
    }, [selectedCountry?.id]);

    const countryClassName = `${inputClassName} location-country-input`;

    return (
        <div className={`grid gap-4 sm:grid-cols-2 ${wrapperClassName}`}>
            <div className="grid gap-2">
                <label
                    htmlFor={`${idPrefix}-country`}
                    className="flex items-baseline justify-between gap-2 text-[13.5px] font-bold text-harbor"
                >
                    <span>
                        Country <FieldIndicator required={required} optional={optional} />
                    </span>
                </label>
                {countriesLoading ? (
                    <input
                        id={`${idPrefix}-country`}
                        className={inputClassName}
                        disabled
                        placeholder="Loading countries…"
                    />
                ) : (
                    <CountrySelect
                        id={`${idPrefix}-country`}
                        defaultValue={selectedCountry as never}
                        containerClassName="country-search-select"
                        inputClassName={countryClassName}
                        placeHolder="Search for a country"
                        onTextChange={() => {
                            if (country) {
                                onChange("", "");
                            }
                        }}
                        onChange={(selection) => {
                            const selected = selection as Country;
                            onChange(
                                selected.name === country ? city : "",
                                selected.name,
                            );
                        }}
                    />
                )}
            </div>

            <div className="grid gap-2">
                <label
                    htmlFor={`${idPrefix}-city`}
                    className="flex items-baseline justify-between gap-2 text-[13.5px] font-bold text-harbor"
                >
                    <span>
                        City <FieldIndicator required={required} optional={optional} />
                    </span>
                </label>
                <CitySearch
                    key={selectedCountry?.id ?? "no-country"}
                    idPrefix={idPrefix}
                    city={city}
                    cities={cities}
                    disabled={!selectedCountry}
                    loading={citiesLoading}
                    className={inputClassName}
                    onChange={(selectedCity) =>
                        onChange(selectedCity, country)
                    }
                />
                {citiesFailed && selectedCountry && (
                    <p role="alert" className="text-xs font-semibold text-sienna">
                        Could not load cities. Search for the country again to
                        retry.
                    </p>
                )}
            </div>
        </div>
    );
}
