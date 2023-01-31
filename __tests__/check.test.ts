import {expect, test} from "@jest/globals"
import {check} from "../src/check"

const BASE_URL = "https://graphql-test.up.railway.app"

test("basic checks happy path", async () => {
    const errors = await check(`${BASE_URL}/graphql`, "")
    expect(errors).toHaveLength(0)
})

test("bad URL", async () => {
    const errors = await check(BASE_URL.substring(BASE_URL.lastIndexOf("/")), "")
    expect(errors).toHaveLength(1)
})

test("non-JSON response", async () => {
    const errors = await check(`${BASE_URL}/no-json`, "")
    expect(errors).toHaveLength(1)
})

test("non-GraphQL response", async () => {
    const errors = await check(`${BASE_URL}/json`, "")
    expect(errors).toHaveLength(1)
})

test("invalid auth header", async () => {
    const errors = await check(`${BASE_URL}/graphql`, "notaheader")
    expect(errors).toHaveLength(1)
})

test("bad auth", async () => {
    const errors = await check(`${BASE_URL}/graphql-auth`, "Authorization: bad")
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
    const errors = await check(`${BASE_URL}/graphql-auth`, header())
    expect(errors).toHaveLength(0)
})

test("auth not enforced", async () => {
    const errors = await check(`${BASE_URL}/graphql`, header())
    expect(errors).toHaveLength(1)
})
