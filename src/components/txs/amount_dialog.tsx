import * as React from 'react';
import { Button, Container } from 'semantic-ui-react'
import {Money} from "../../types/units";
import { AmountField } from './amount_field';

export interface IAmountDialog {
    /** What to do with the amount when "submit" is hit */
    submitCallback: (v: Money) => void;
    placeholder? : string;
    loading ?: boolean
}

/** Form for specifying an amount */
export class  AmountDialog extends React.Component<IAmountDialog, {}> {

    public state: { amount: Money|null } = { amount: null };

    public constructor(props: IAmountDialog) {
        super(props)
        this.setAmount = this.setAmount.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    public setAmount(amount: Money) { this.setState({ amount }) }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.amount !== null) {
            this.props.submitCallback(this.state.amount);
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
