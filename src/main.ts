import * as core from "@actions/core"
import {check} from "./check"

function parseBool({fieldName, errors}: {fieldName: string; errors: string[]}): boolean | null {
    const rawValue = core.getInput(fieldName)
    if (rawValue === "true") {
        return true
    } else if (rawValue === "false") {
        return false
    } else {
        errors.push(`Input \`${fieldName}\` must be \`true\` or \`false\``)
        return null
    }
}

async function run(): Promise<void> {
    try {
        const errors: string[] = []
        const endpoint: string = core.getInput("endpoint")
        const authHeader: string = core.getInput("auth")
        const subgraph = parseBool({fieldName: "subgraph", errors}) ?? false
        const allowIntrospection = parseBool({
            fieldName: "allow_introspection",
            errors,
        })
        const allowInsecureSubgraphs =
            parseBool({
                fieldName: "insecure_subgraph",
                errors,
            }) ?? false

        core.debug(`Testing ${endpoint} ...`)

        errors.push(...(await check({endpoint, authHeader, subgraph, allowIntrospection, allowInsecureSubgraphs})))

        if (errors.length > 0) {
            const errorMessage = errors.join(",")
            core.setOutput("error", errorMessage)
            core.setFailed(errorMessage)
        } else {
            core.debug("No errors detected")
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

// noinspection JSIgnoredPromiseFromCall
run()
