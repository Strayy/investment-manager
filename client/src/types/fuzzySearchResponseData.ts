export type FuzzySearchResponse = {
    item: {
        _id: string;
        id: string;
        __v: number;
        city: string;
        country: string;
        description: string;
        exchange: string;
        industry: string;
        sector: string;
        website: string;
        name: string;
        shortDescription: string;
        socialMedia: [
            {
                name: string;
                url: string;
                _id: string;
            },
        ];
        colors: {
            [key: string]: string;
        };
        logos: {
            [key: string]: string;
        };
        currency: string;
        ticker: string;
    };
    refIndex: number;
};
