import { serverURL } from './server_url'

/** URL for given legicash endpoint */
export const endpointURL = (endpoint: string) => `${serverURL}/api/${endpoint}`

/** Post body to legicash endpoint  */
export const post = (endpoint: string, body: object): Promise<Response | void> => {
    return fetch(endpointURL(endpoint), {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
    })
        .then(rv => rv.json())
}

/** Post get query to legicash endpoint */
export const get = (endpoint: string, params: object): Promise<Response> => {
    const url = new URL(endpointURL(endpoint))
    /* Construct `?k=v&k'=v'&...` query from parameters */
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]))
    return fetch(url.toString())
        .then(r => r.json())
}

export interface IThreadResponse { result: string | object }
/**
 * Return the thread number reported by this thread response.
 * https://gitlab.com/legicash/legicash-facts/blob/endpoints-demo/src/endpoints/endpoints.md#depositwithdrawal-threads
 */
export const readThread = (response: IThreadResponse): number => {
    // response.result should be of the form "api/thread?id=nn" 
    const assignSplit = (response.result as string).split('=')
    if (assignSplit.length !== 2) { throw Error(`Bad thread response! ${response}`) }
    return parseInt(assignSplit[1], 10)
}

export const pendingResult = { result: "The operation is pending" }
export const resultPending = (r: IThreadResponse) =>
    (typeof r.result === "string")
    && r.result.valueOf() === pendingResult.result.valueOf()
