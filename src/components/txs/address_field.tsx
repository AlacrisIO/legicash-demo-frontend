import * as React from 'react';

// Portion of a valid Ethereum address: Up to 20 hexadecimal bytes
const partialAddressRegexp = RegExp("^0x[0-9A-Fa-f]{0,40}$");

interface IAddressField {
    /** What to do when the contents of the field change on user input */
    callback: (value: string) => void
}

/** Input field which only accepts hexadecimal values up to address length. */
export class AddressField extends React.Component<IAddressField, {}> {
    public state: { value: string }
    constructor(props: IAddressField) {
        super(props)
        this.state = { value: '0x' }
        this.handleChange = this.handleChange.bind(this)
    }
    public render() {
        return <input type="text" value={this.state.value} className="addField"
            onChange={this.handleChange} />
    }
    private handleChange(e: React.FormEvent<EventTarget>) {
        const value = (e.target as HTMLInputElement).value as string
        if (partialAddressRegexp.exec(value)) {
            this.setState({ value })
            this.props.callback(value)
        }
    }
}
