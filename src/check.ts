// eslint-disable-next-line import/named
import axios, {AxiosError, AxiosInstance} from "axios"
import * as core from "@actions/core"

export async function check(args: {
    authHeader: string
    endpoint: string
    subgraph: boolean
    allowInsecureSubgraphs: boolean
    allowIntrospection: boolean | null
}): Promise<string[]> {
    const client = axios.create({
        baseURL: args.endpoint,
    })
    const errors: string[] = []
    const basicError = await basic(client)
    core.debug(`Basic (no auth) check returned: ${basicError}`)
    if (args.authHeader.length > 0) {
        errors.push(...(await checkAuth(client, args.authHeader, basicError)))
    } else if (basicError) {
        errors.push(`Basic check failed: ${basicError}`)
    }
    const subgraphError = await checkSubgraph(client)
    if (args.subgraph && subgraphError) {
        errors.push(`Subgraph check failed: ${subgraphError}`)
    }
    if (args.authHeader.length === 0 && !subgraphError && !args.allowInsecureSubgraphs) {
        errors.push("Insecure subgraphs are not allowed, either set `auth` or `insecure_subgraph: true`")
    }
    const allowIntrospection = args.allowIntrospection ?? !subgraphError
    if (allowIntrospection) {
        const introspectionError = await enforceNoIntrospection(client)
        if (introspectionError) {
            errors.push(`Introspection check failed: ${introspectionError}`)
        }
    }
    return [...new Set(errors)]
}

async function basic(client: AxiosInstance): Promise<string | null> {
    try {
        const response = await client.post("", {query: "query{__typename}"})
        if (response && response?.data?.data?.__typename !== "Query") {
            return `Unexpected response: ${JSON.stringify(response?.data)}`
        }
    } catch (unknownError) {
        const error = unknownError as AxiosError
        if (error.response) {
            return `HTTP ${error.response.status}: ${error.response.statusText}`
        } else if (error.request) {
            return `No response from server`
        } else {
            return error.message
        }
    }
    return null
}

async function checkAuth(client: AxiosInstance, authHeader: string, basicError: string | null): Promise<string[]> {
    const errors = []
    if (!basicError) {
        errors.push("Auth was not enforced for endpoint")
    }
    const [key, value] = authHeader.split(":").map(str => str.trim())
    if (value === undefined) {
        errors.push("Auth header was malformed, must look like `key: value`")
        return errors
    }
    client.defaults.headers.common[key] = value
    const authError = await basic(client)
    core.debug(`Auth check returned: ${authError}`)
    if (authError) {
        errors.push(`Auth failed: ${authError}`)
    }
    return errors
}

async function checkSubgraph(client: AxiosInstance): Promise<string | null> {
    try {
        const response = await client.post("", {query: "query{_service{sdl}}"})
        if (response && !response?.data?.data?._service?.sdl) {
            return "Server is not a federated subgraph"
        }
    } catch (unknownError) {
        const error = unknownError as AxiosError
        if (error.response) {
            return `HTTP ${error.response.status}: ${error.response.statusText}`
        } else if (error.request) {
            return `No response from server`
        } else {
            return error.message
        }
    }
    return null
}

async function enforceNoIntrospection(client: AxiosInstance): Promise<string | null> {
    try {
        const response = await client.post("", {query: "query{__schema{types{name}}}"})
        if (response && response?.data?.data?.__schema?.types) {
            return "Server allows introspection"
        }
    } catch (unknownError) {
        const error = unknownError as AxiosError
        if (error.response) {
            return `HTTP ${error.response.status}: ${error.response.statusText}`
        } else if (error.request) {
            return `No response from server`
        } else {
            return error.message
        }
    }
    return null
}
