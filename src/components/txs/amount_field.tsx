import * as React from 'react';
import {Input} from 'semantic-ui-react';
import {filterEthInput, Money} from "../../types/units";

interface IAmountFieldProps {
    callback: (value: Money) => void;
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
        const inputValueText = filterEthInput(target.value.toString());
        this.setState({value: inputValueText});

        if (inputValueText) {
            const inputValue = new Money(target.value.toString(), 10, 'eth');

            if (!inputValue.isLessThanZero()) {
                this.props.callback(inputValue);
            }
        }
    }
}

