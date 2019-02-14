import * as React from 'react';
import { Input } from 'semantic-ui-react';

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
    public state: { value: number|string };

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
        const value = target.value;
        const parsedValue = parseInt(value, 10);

        if (isNaN(parsedValue)) {
            this.setState({ value: '' });
            this.props.callback(0);
        } else {
            this.setState({ value: parsedValue });
            this.props.callback(parsedValue);
        }
    }
}

