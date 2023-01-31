import {expect, test} from "@jest/globals"
import {check} from "../src/check"

const BASE_URL = "https://graphql-test.up.railway.app"

test("basic checks happy path", async () => {
    const errors = await check(`${BASE_URL}/graphql`)
    expect(errors).toHaveLength(0)
})

test("bad URL", async () => {
    const errors = await check(BASE_URL.substring(BASE_URL.lastIndexOf("/")))
    expect(errors).toHaveLength(1)
})

test("non-JSON response", async () => {
    const errors = await check(`${BASE_URL}/no-json`)
    expect(errors).toHaveLength(1)
})

test("non-GraphQL response", async () => {
    const errors = await check(`${BASE_URL}/json`)
    expect(errors).toHaveLength(1)
})
