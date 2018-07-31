/** The port on which the legicash server is listening */
const endpointPort = 8081

/** URL at which the legicash server is listening */
export const serverURL =
    `${window.location.protocol}//${window.location.hostname}:${endpointPort}`

/** URL for given legicash endpoint */
export const endpointURL = (endpoint: string) => `${serverURL}/api/${endpoint}`

/** Post body to legicash endpoint  */
export const post = (endpoint: string, body: object): Promise<Response> =>
    fetch(endpointURL(endpoint), {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
    })

/** Post get query to legicash endpoint */
export const get = (endpoint: string, params: object): Promise<Response> => {
    const url = new URL(endpointURL(endpoint))
    /* Construct `?k=v&k'=v'&...` query from parameters */
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]))
    return fetch(url.toString())
}

/**
 * Attach handlers to a promise.
 *
 * XXX: This is probably a bad idea. Just use the Promise API directly?
 */
export const dispatchPromise = <T extends any>(
    p: Promise<T>,
    initiation: ((p: Promise<T>) => void),
    finalization: ((r: T) => void),
    error: ((e: Error) => void)): Promise<void> => {
    initiation(p)
    return p.then(finalization).catch(error)
}

export interface IThreadResponse { result: string }
/**
 * Return the thread number reported by this thread response.
 * https://gitlab.com/legicash/legicash-facts/blob/endpoints-demo/src/endpoints/endpoints.md#depositwithdrawal-threads
 */
export const readThread = (response: IThreadResponse): number => {
    // response.result should be of the form "api/thread?id=nn" 
    const assignSplit = response.result.split('=')
    if (assignSplit.length !== 2) { throw Error(`Bad thread response! ${response}`) }
    return parseInt(assignSplit[1], 10)
}
