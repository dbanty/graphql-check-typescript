import {expect, test} from "@jest/globals"
import {check} from "../src/check"

const BASE_URL = "https://graphql-test.up.railway.app"

test("basic checks happy path", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql`,
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(0)
})

test("malformed URL", async () => {
    const errors = await check({
        endpoint: BASE_URL.substring(BASE_URL.lastIndexOf("/")),
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("unreachable endpoint", async () => {
    const errors = await check({
        endpoint: "https://doesntexist.dylananthony.com",
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("non-JSON response", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/no-json`,
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("non-GraphQL response", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/json`,
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("invalid auth header", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql-auth`,
        authHeader: "notaheader",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("bad auth", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql-auth`,
        authHeader: "Authorization: bad",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
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
    const errors = await check({
        endpoint: `${BASE_URL}/graphql-auth`,
        authHeader: header(),
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(0)
})

test("auth not enforced", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql`,
        authHeader: header(),
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("is subgraph", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/subgraph-auth`,
        authHeader: header(),
        subgraph: true,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(0)
})

test("is not subgraph", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql-auth`,
        authHeader: header(),
        subgraph: true,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("introspection not allowed", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql`,
        authHeader: "",
        subgraph: false,
        allowIntrospection: false,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("introspection disabled", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/graphql-no-introspection`,
        authHeader: "",
        subgraph: false,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(0)
})

test("insecure subgraph not allowed", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/subgraph`,
        authHeader: "",
        subgraph: true,
        allowIntrospection: true,
        allowInsecureSubgraphs: false,
    })
    expect(errors).toHaveLength(1)
})

test("insecure subgraph override", async () => {
    const errors = await check({
        endpoint: `${BASE_URL}/subgraph`,
        authHeader: "",
        subgraph: true,
        allowIntrospection: true,
        allowInsecureSubgraphs: true,
    })
    expect(errors).toHaveLength(0)
})
