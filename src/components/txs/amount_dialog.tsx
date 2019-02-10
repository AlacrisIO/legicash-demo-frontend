import * as React from 'react';
import { Button, Container } from 'semantic-ui-react'
import { AmountField } from './amount_field';

export interface IAmountDialog {
    /** Header describing the dialog */
    header: JSX.Element;
    /** What to do with the amount when "submit" is hit */
    submitCallback: (v: number) => void;
    placeholder? : string;
    loading ?: boolean
}

/** Form for specifying an amount */
export class AmountDialog extends React.Component<IAmountDialog, {}> {

    public state: { amount: number } = { amount: 0 }
    public constructor(props: IAmountDialog) {
        super(props)
        this.setAmount = this.setAmount.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    public setAmount(amount: number) { this.setState({ amount }) }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (this.state.amount > 0) {
            this.props.submitCallback(this.state.amount)
        }
    }

    public render() {
        return (<div>
            <form onSubmit={this.onSubmit}>
                <Container style={{display: 'flex', justifyContent: 'space-between'}}>
                    <AmountField callback={this.setAmount} className="amtField" placeholder={this.props.placeholder}/>
                    <Button basic={true} color={'blue'} type="submit" loading={this.props.loading} >Submit</Button>
                </Container>
            </form>
        </div>)
    }
}
