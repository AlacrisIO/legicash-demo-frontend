import * as React                                               from 'react'
import {connect}                                                from 'react-redux'
import {Accordion, Header, Icon, Segment}                       from 'semantic-ui-react'
import {addresses as allAddresses}                              from '../server/ethereum_addresses'
import {makeDeposit, makePayment, makeWithdrawal, removeWallet} from '../types/actions'
import {Address}                                                from '../types/address'
import {Guid}                                                   from '../types/guid'
import {IPendingState, UIState}                                 from '../types/state'
import {Transaction}                                            from '../types/tx'
import {Wallet as WalletType}                                   from '../types/wallet'
import {SectionTitle}                                           from './section_title'
import {TxList}                                                 from './tx_list' // Will need this later...
import {DepositDialog}                                          from './txs/deposit_dialog'
import {PayDialog}                                              from './txs/pay_dialog'
import {WithdrawDialog}                                         from './txs/withdraw_dialog'
import {OffchainBalance, OnchainBalance, WalletAddress}         from './wallet_elements'

export const addressNames: { Address: string } = {} as any
Object.keys(allAddresses).forEach(n => addressNames[allAddresses[n]] = n)

export const name = (a: Address) => addressNames[a.toString()]

interface IWallet {
    depositCallback:  (amount: number) => void
    payCallback:      (address: Address, amount: number) => void
    withdrawCallback: (amount: number) => void
    killCallback:     () => void;
    wallet:           WalletType;
    txs:              Transaction[];
    pendingStates:    IPendingState
}

export class DumbWallet extends React.Component<IWallet> {

    public state = {
        open: {
            deposit:  false,
            pay:      false,
            trans:    false,
            withdraw: false,
        }
    };

    constructor(props: IWallet) {
        super(props)
    }

    public handleAccordion = (e: any, titleProps : {index: string}) => {
        const k = titleProps.index;
        const openSwitches = this.state.open;
        if (openSwitches.hasOwnProperty(k)) {
            openSwitches[k] = !openSwitches[k];
            this.setState({ open: openSwitches})
        }
    };

    public isOpen(k: string): boolean {
        return this.state.open.hasOwnProperty(k) && this.state.open[k];
    }

    public render() {
        const ha = this.handleAccordion.bind(this);
        const open = this.isOpen.bind(this);

        return (
        <Segment>
            <div style={{textAlign: 'right'}}>
                <Icon link={true} onClick={this.props.killCallback} name="close" />
            </div>
            <Header as={'h2'} style={{marginTop: 0, padding: 0}}>
                Wallet Name: {name(this.props.wallet.address)}
            </Header>
            <Segment vertical={true} style={{margin: 0, padding: 0}}>
                <WalletAddress address={this.props.wallet.address.toString()} />
                <OffchainBalance balance={this.props.wallet.offchainBalance}
                                 pending={this.hasActionsPending()} />
                <OnchainBalance balance={this.props.wallet.onchainBalance} />
            </Segment>

            <Accordion exclusive={false} fluid={true} >
                <Segment vertical={true}>
                <SectionTitle expKey={'deposit'}
                              icon={'money bill alternate'}
                              title={'Deposit to side chain'}
                              accHandle={ha}
                              isOpen={open}
                              />
                    <Accordion.Content active={this.isOpen('deposit')}>
                        <DepositDialog from={this.props.wallet.address}
                                       loading={this.props.pendingStates.deposit}
                                       submitCallback={this.makeDeposit} />
                    </Accordion.Content>
                </Segment>

                <Segment vertical={true}>
                    <SectionTitle expKey={'withdraw'}
                                  icon={'money bill alternate outline'}
                                  title={'Withdraw to main chain'}
                                  accHandle={ha}
                                  isOpen={open}
                                  />
                    <Accordion.Content active={this.isOpen('withdraw')}>
                        <WithdrawDialog from={this.props.wallet.address}
                                        loading={this.props.pendingStates.withdrawal}
                                        submitCallback={this.makeWithdrawal} />
                    </Accordion.Content>
                </Segment>

                <Segment vertical={true}>
                    <SectionTitle expKey={'pay'}
                                  icon={'paper plane outline'}
                                  title={'Send payment'}
                                  accHandle={ha}
                                  isOpen={open}
                                  />
                    <Accordion.Content active={this.isOpen('pay')}>
                        <PayDialog from={this.props.wallet.address}
                                   loading={this.props.pendingStates.payment}
                                   submitCallback={this.makePayment} />
                    </Accordion.Content>
                </Segment>

                <Segment vertical={true}>
                    <SectionTitle expKey={'trans'}
                                  icon={'exchange'}
                                  title={'Transaction list'}
                                  accHandle={ha}
                                  isOpen={open}
                                  />
                    <Accordion.Content active={this.isOpen('trans')} >
                        <TxList owner={this.props.wallet.address}
                                txs={this.props.txs} />
                    </Accordion.Content>
                </Segment>
            </Accordion>
        </Segment>
        )
    }

    public hasActionsPending = () =>
           this.props.pendingStates.deposit
        || this.props.pendingStates.withdrawal
        || this.props.pendingStates.payment;

    public makeDeposit = (amount: number): void => {
        if (!this.props.pendingStates.deposit) {
            this.props.depositCallback(amount);
        }
    };

    public makeWithdrawal = (amount: number): void => {
        if (!this.props.pendingStates.withdrawal) {
            this.props.withdrawCallback(amount);
        }
    };

    public makePayment = (to: Address, amount: number): void => {
        if (!this.props.pendingStates.payment) {
            this.props.payCallback(to, amount);
        }
    };
}

const stateToProps = (address: Address) => (state: UIState) => {
    const wallet        = state.accounts.get(address);
    const pendingStates = state.getPendingStates(address);

    if (wallet === undefined) {
        throw Error(`Wallet for unknown address! ${address}`)
    }

    const txs: Transaction[] = wallet.txs.map(
        (g: Guid): Transaction => state.txByGUID.get(g)
    ).toArray();

    return { txs, wallet, pendingStates}
};

const dispatchToProps = (address: Address) => (dispatch: (a: any) => any) => ({
    depositCallback:  (a: number)              => dispatch(makeDeposit(address, a)),
    killCallback:     ()                       => dispatch(removeWallet(address)),
    payCallback:      (to: Address, a: number) => dispatch(makePayment(to, address, a)),
    withdrawCallback: (a: number)              => dispatch(makeWithdrawal(address, a)),
});

export const Wallet = ({ address }: { address: Address }) =>
    connect(stateToProps(address), dispatchToProps(address))(DumbWallet)
