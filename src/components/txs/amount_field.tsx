import * as React from 'react';

const numberRe = RegExp("^[0-9]+(\\.[0-9]*)?$")  // Matches +ve decimals only.

interface IAmountFieldProps { callback: (value: number) => void; className?: "amtField" }

/** Input field which only accepts non-negative numeric values
 *
 * Final value is in this.state.value, as a string.
 */
export class AmountField extends React.Component<IAmountFieldProps, {}> {
    public state: { value: string };
    constructor(props: IAmountFieldProps) {
        super(props);
        this.state = { value: '0' }
        this.handleChange = this.handleChange.bind(this)
    }
    public render() {
        return <input type="text" value={this.state.value}
            className="amountField" onChange={this.handleChange} />
    }
    private handleChange(event: React.FormEvent<EventTarget>): void {
        const target = event.target as HTMLInputElement;
        // Only accept input if it's a non-negative numeric value
        if (numberRe.exec(target.value)) {
            this.setState({ value: target.value })
            this.props.callback(parseFloat(target.value))
        }
    }
}

