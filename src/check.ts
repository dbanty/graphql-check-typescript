import axios, {AxiosError} from "axios"

export async function check(endpoint: string): Promise<string[]> {
    const errors: string[] = []
    try {
        const response = await axios.post(endpoint, {query: "query{__typename}"})
        if (response && response?.data?.data?.__typename !== "Query") {
            errors.push(`Unexpected response: ${JSON.stringify(response?.data)}`)
        }
    } catch (unknownError) {
        const error = unknownError as AxiosError
        if (error.response) {
            errors.push(`HTTP ${error.response.status}: ${error.response.statusText}`)
        } else if (error.request) {
            errors.push(`No response from server`)
        } else {
            errors.push(error.message)
        }
    }
    return errors
}
