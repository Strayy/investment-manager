export type Favourites = {
    [key: string]: {
        stockId: string;
        name: string;
        color: string;
        currentPrice: number | string;
        change: number;
        companyLogo: string;
        companyWebsite: string;
    };
};
