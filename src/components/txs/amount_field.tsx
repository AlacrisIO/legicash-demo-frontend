import * as React from 'react';
import { Input } from 'semantic-ui-react'
const numberRe = RegExp("^[0-9]+(\\.[0-9]*)?$")  // Matches +ve decimals only.

interface IAmountFieldProps { 
    callback: (value: number) => void;
    className?: "amtField";
    placeholder? : string;
}

/** Input field which only accepts non-negative numeric values
 *
 * Final value is in this.state.value, as a string.
 */
export class AmountField extends React.Component<IAmountFieldProps, {}> {
    public state: { value: string };
    constructor(props: IAmountFieldProps) {
        super(props);
        this.state = { value: '' }
        this.handleChange = this.handleChange.bind(this)
    }
    public render() {
        return <Input 
            type="text"
            fluid={true}
            placeholder={this.props.placeholder || 'Amount to deposit'}
            value={this.state.value}
            style={{flex: 0.95}}
            className="amountField" 
            onChange={this.handleChange} />
    }
    private handleChange(event: React.FormEvent<EventTarget>): void {
        const target = event.target as HTMLInputElement;
        // Only accept input if it's a non-negative numeric value
        if (numberRe.exec(target.value) || target.value === '') {
            this.setState({ value: target.value })
            this.props.callback(parseFloat(target.value))
        }
    }
}

