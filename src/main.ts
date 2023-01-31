import * as core from "@actions/core"
import {check} from "./check"

async function run(): Promise<void> {
    try {
        const endpoint: string = core.getInput("endpoint")
        const authHeader: string = core.getInput("auth")
        const subgraphInput: string = core.getInput("subgraph")

        const errors = []

        let subgraph = false
        if (subgraphInput === "true") {
            subgraph = true
        } else if (subgraphInput !== "false") {
            errors.push("Input `subgraph` must be `true` or `false`")
        }

        core.debug(`Testing ${endpoint} ...`)

        errors.concat(await check(endpoint, authHeader, subgraph))

        if (errors.length > 0) {
            const errorMessage = errors.join(",")
            core.setOutput("error", errorMessage)
            core.setFailed(errorMessage)
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

// noinspection JSIgnoredPromiseFromCall
run()
