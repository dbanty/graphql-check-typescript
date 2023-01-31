import {expect, test} from "@jest/globals"
import {check} from "../src/check"

const BASE_URL = "https://graphql-test.up.railway.app"

test("basic checks happy path", async () => {
    const errors = await check(`${BASE_URL}/graphql`, "", false)
    expect(errors).toHaveLength(0)
})

test("malformed URL", async () => {
    const errors = await check(BASE_URL.substring(BASE_URL.lastIndexOf("/")), "", false)
    expect(errors).toHaveLength(1)
})

test("unreachable endpoint", async () => {
    const errors = await check("https://doesntexist.dylananthony.com", "", false)
    expect(errors).toHaveLength(1)
})

test("non-JSON response", async () => {
    const errors = await check(`${BASE_URL}/no-json`, "", false)
    expect(errors).toHaveLength(1)
})

test("non-GraphQL response", async () => {
    const errors = await check(`${BASE_URL}/json`, "", false)
    expect(errors).toHaveLength(1)
})

test("invalid auth header", async () => {
    const errors = await check(`${BASE_URL}/graphql-auth`, "notaheader", false)
    expect(errors).toHaveLength(1)
})

test("bad auth", async () => {
    const errors = await check(`${BASE_URL}/graphql-auth`, "Authorization: bad", false)
    expect(errors).toHaveLength(1)
})

function header(): string {
    const token = process.env.GRAPHQL_TOKEN
    if (token === undefined) {
        throw new Error("Missing GRAPHQL_TOKEN env var")
    }
    return `Authorization: Bearer ${token}`
}

test("happy auth", async () => {
    const errors = await check(`${BASE_URL}/graphql-auth`, header(), false)
    expect(errors).toHaveLength(0)
})

test("auth not enforced", async () => {
    const errors = await check(`${BASE_URL}/graphql`, header(), false)
    expect(errors).toHaveLength(1)
})

test("is subgraph", async () => {
    const errors = await check(`${BASE_URL}/subgraph-auth`, header(), true)
    expect(errors).toHaveLength(0)
})

test("is not subgraph", async () => {
    const errors = await check(`${BASE_URL}/graphql-auth`, header(), true)
    expect(errors).toHaveLength(1)
})
