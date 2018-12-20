/** Blow this file away and put "serverURL = <my URL>" */

/** The port on which the legicash server is listening */
const endpointPort = 80

/** The hostname for the faciilitator service */
// XXX: Note that this is not the mandated hostname. It is set to this to avoid
// CORS errors during testing, in /etc/hosts. A better value might be
// `window.location.hostname`?
const hostname = "alacris-client.flyingpenguin.tech"

/** URL at which the legicash server is listening */
export const serverURL =
    `${window.location.protocol}//${hostname}:${endpointPort}`
