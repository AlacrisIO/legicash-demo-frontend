import * as React from 'react';

// Portion of a valid Ethereum address: Up to 20 hexadecimal bytes
const partial_address_regexp = RegExp("^0x[0-9A-Fa-f]{0,40}$");

interface IAddressField {
    /** What to do when the contents of the field change on user input */
    callback: (value: string) => void
}

/** Input field which only accepts hexadecimal values up to address length. */
export class AddressField extends React.Component<IAddressField, {}> {
    state: { value: string }
    constructor(props: IAddressField) {
        super(props)
        this.state = { value: '0x' }
        this.handle_change = this.handle_change.bind(this)
    }
    handle_change(e: React.FormEvent<EventTarget>) {
        let value = (e.target as HTMLInputElement).value as string
        if (partial_address_regexp.exec(value)) {
            this.setState({ value })
            this.props.callback(value)
        }
    }
    render() {
        return <input type="text" value={this.state.value} className="addField"
            onChange={this.handle_change} />
    }
}
