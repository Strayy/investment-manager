export interface ICurrencyExchange {
    [key: string]: {
        date: Date;
        rate: number;
    };
}
