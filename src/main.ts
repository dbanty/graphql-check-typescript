import * as core from "@actions/core"
import {check} from "./check"

async function run(): Promise<void> {
    try {
        const endpoint: string = core.getInput("endpoint")
        const authHeader: string = core.getInput("auth")
        core.debug(`Testing ${endpoint} ...`)

        const errors = await check(endpoint, authHeader)

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
