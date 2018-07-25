/** Redux actions */

export enum Action {

    /* Actions related to waiting on a server thread */
    THREAD_RESPONSE,  // Server gives back a thread num
    CHECK_THREAD,  // Check thread for completion
    THREAD_RESULTS, // Results from thread

    /* Actions related to making a deposit. */
    ADD_ADDRESS, // Add this address to the app
    MAKE_DEPOSIT, // Deposit to this address on side chain
    DEPOSIT_VALIDATED, // Deposit has been added
    DEPOSIT_FAILED, // Deposit was not added

}
