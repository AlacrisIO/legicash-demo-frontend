import * as React from 'react';

var number_re = RegExp("^[0-9]+(\.[0-9]*)?$")  // Matches +ve decimals only.

interface IAmountFieldProps { callback: (value: number) => void }

/** Input field which only accepts non-negative numeric values
 *
 * Final value is in this.state.value, as a string.
 */
export class AmountField extends React.Component<IAmountFieldProps, {}> {
    state: { value: string };
    propTypes: { callback: (value: number) => void }
    constructor(props: IAmountFieldProps) {
        super(props);
        this.state = { value: '0' }
        this.handle_change = this.handle_change.bind(this)
    }

    handle_change(event: React.FormEvent<EventTarget>): void {
        // XXX: This is probably not the redux way. Come back to this when we
        // wire everything up...
        let target = event.target as HTMLInputElement;
        // Only accept input if it's a non-negative numeric value
        if (number_re.exec(target.value)) {
            this.setState({ value: target.value });
            this.props.callback(parseFloat(target.value))
        }
    }

    render() {
        return (<div> <input type="text" value={this.state.value}
            onChange={this.handle_change} /> </div>);
    }

    get_value(): number {
        return parseFloat(this.state.value)
    }
}

