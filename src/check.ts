// eslint-disable-next-line import/named
import axios, {AxiosError, AxiosInstance} from "axios"
import * as core from "@actions/core"

export async function check(endpoint: string, authHeader: string): Promise<string[]> {
    const client = axios.create({
        baseURL: endpoint,
    })
    const errors: string[] = []
    const basicError = await basic(client)
    core.debug(`Basic (no auth) check returned: ${basicError}`)
    if (authHeader.length > 0) {
        const [key, value] = authHeader.split(":").map(str => str.trim())
        if (value === undefined) {
            return ["Auth header was malformed, must look like `key: value`"]
        }
        client.defaults.headers.common[key] = value
        if (!basicError) {
            errors.push("Auth was not enforced for endpoint")
        }
        const authError = await basic(client)
        core.debug(`Auth check returned: ${authError}`)
        if (authError) {
            errors.push(`Auth failed: ${authError}`)
        }
    } else if (basicError) {
        errors.push(`Basic check failed: ${basicError}`)
    }
    return errors
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
