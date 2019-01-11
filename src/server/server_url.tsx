/** Blow this file away and put "serverURL = <my URL>" */

/** The port on which the legicash server is listening */
let endpointPort = 80

/** The hostname for the faciilitator service */
// XXX: Note that this is not the mandated hostname. It is set to this to avoid
// CORS errors during testing, in /etc/hosts. A better value might be
// `window.location.hostname`?
let hostname = "alacris-client.flyingpenguin.tech"

// .env overrides
if ( process.env.REACT_APP_API_HOST ) {
    hostname = process.env.REACT_APP_API_HOST;
}

if ( process.env.REACT_APP_API_PORT ) {
    endpointPort = (process.env.REACT_APP_API_PORT as any as number);
}

 let apiUrl = `${window.location.protocol}//${hostname}`

/** URL at which the legicash server is listening */
if (endpointPort) {
     apiUrl = `${window.location.protocol}//${hostname}:${endpointPort}`
}

export const serverURL = apiUrl