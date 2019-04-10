import { List }                                     from 'immutable'
import * as React                                   from 'react'
import { connect }                                  from 'react-redux'
import { Button, Container, Form, Header, Segment } from 'semantic-ui-react'
import { addAddress, recentTxsInitiated }           from '../types/actions'
import { Address, emptyAddress }                    from '../types/address'
import { UIState }                                  from '../types/state'
import { knownAddresses, name, SelectAccount }      from './select_account'

export interface IAddAccount {
    /** Callback when account-add is requested */
    add: ((a: Address) => void);
    /** Accounts which are already listed in the UI */
    displayedAddresses: List<Address>;
}

export interface IAddAccountState { optIdx: number, address: Address }
/* tslint:disable:max-classes-per-file */
class BaseComponent extends React.Component<IAddAccount, IAddAccountState>{ }

/** Form for adding an account to the side chain */
export class DumbAddAccount extends BaseComponent {
    public state: IAddAccountState = { optIdx: 0, address: emptyAddress }
    public constructor(props: IAddAccount) {
        super(props)
        this.onSubmit = this.onSubmit.bind(this)
        this.selectChange = this.selectChange.bind(this)
    }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!this.state.address.equals(emptyAddress)) {
            this.props.add(this.state.address)
            this.setState(
                this.stateForNewDisplay(this.state, this.props.displayedAddresses)
            )
        }
    }

    public render() {
        return (
            <Container
                textAlign={"center"}
                style={{marginTop: '20px', maxWidth: '500px',  width: '500px'}}
                >
                <Segment
                    raised={true}
                    basic={true}
                    >
                    <Form className="addAccountMenu" onSubmit={this.onSubmit}>
                        <Segment basic={true}>
                            <Header as="h2" content="Add Wallet" textAlign="left" />
                            <SelectAccount
                                displayedAddresses={this.props.displayedAddresses}
                                initialMessage="Please pick a wallet to display"
                                select={this.selectChange}
                                />
                            <Button primary={true} size="large" type="submit" style={{marginTop: '10px'}}>Submit</Button>
                        </Segment>
                    </Form>
                </Segment>
            </Container >
        )
    }
    private selectChange(address: Address): void {
        this.setState({ address })
    }
    /**
     * Compute what the new state should be, given that the current selection
     * will be removed on the next update. update.
     */
    private stateForNewDisplay(s: IAddAccountState, as: List<Address>
    ): IAddAccountState {
        // Note that `as` is effectively 1-indexed, since the first entry is
        // the empty address placeholder with the menu description
        if (s.optIdx === as.size) {
            return { optIdx: Math.max(0, s.optIdx - 1), address: as.get(s.optIdx) }
        }
        return { optIdx: s.optIdx, address: as.get(s.optIdx) }
    }
}

export const AddAccount = connect(
    (state: UIState) => ({
        displayedAddresses: List(
            knownAddresses.subtract(state.displayedAccountsSet).sortBy(name))
    }),
    (dispatch: (a: any) => any) => ({
        add: (a: Address) => {
            dispatch(addAddress(a, name(a)))
            dispatch(recentTxsInitiated(a))
        }
    })
)(DumbAddAccount)
