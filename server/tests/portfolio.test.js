const request = require("supertest");
const { app, server } = require("../server");

describe("GET /getTrades", () => {
    describe("Given a userId with trades", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get("/api/portfolio/getTrades?userId=TEST-USER-ID");
        });

        it("responds with status code 200", () => {
            expect(response.statusCode).toBe(200);
        });

        it("responds with json object", () => {
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });

        it("responds with list of trades", () => {
            const trades = response.body;

            trades.forEach((trade) => {
                expect(trade.userId).toBe("TEST-USER-ID");
            });
        });
    });

    describe("When given a userId without trades", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get("/api/portfolio/getTrades?userId=NO-TRADES");
        });

        it("responds with status code 200", () => {
            expect(response.statusCode).toBe(200);
        });

        it("responds with empty array", () => {
            expect(response.body).toEqual([]);
        });
    });

    describe("When no userId is given", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get("/api/portfolio/getTrades");
        });

        it("responds with status code 400", () => {
            expect(response.statusCode).toBe(400);
        });

        it("responds with json error message", () => {
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));

            expect(response.body).toEqual({
                message: "No userId specified in GET request",
            });
        });
    });

    afterAll(async () => {
        await server.close();
    });
});

describe("GET /getMostRecentTransaction", () => {
    describe("Given a userId and ticker with trades", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get(
                "/api/portfolio/getMostRecentTransaction?userId=TEST-USER-ID&stockId=ASX_CAR",
            );
        });

        it("responds with status code 200", () => {
            expect(response.statusCode).toBe(200);
        });

        it("responds with json object", () => {
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });

        it("responds with single trade", () => {
            expect(Object.values(response.body).length).toBe(1);
        });
    });

    describe("When given a userId and ticker without trades", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get(
                "/api/portfolio/getMostRecentTransaction?userId=NO-TRADES&stockId=ASX_CAR",
            );
        });

        it("responds with status code 200", () => {
            expect(response.statusCode).toBe(200);
        });

        it("responds with empty object", () => {
            expect(response.body).toEqual({});
        });
    });

    describe("When given a userId and no ticker", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get(
                "/api/portfolio/getMostRecentTransaction?userId=TEST-USER-ID",
            );
        });

        it("responds with status code 200", () => {
            expect(response.statusCode).toBe(200);
        });

        it("responds with json object", () => {
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });

        it("responds with list of most recent trade for each ticker", () => {
            Object.values(response.body).forEach((trade) => {
                expect(trade.userId).toBe("TEST-USER-ID");
            });
        });
    });

    describe("When no userId is given", () => {
        let response;

        beforeAll(async () => {
            response = await request(app).get("/api/portfolio/getMostRecentTransaction");
        });

        it("responds with status code 400", () => {
            expect(response.statusCode).toBe(400);
        });

        it("responds with json error message", () => {
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));

            expect(response.body).toEqual({
                message: "Missing userId in request",
            });
        });
    });
});
