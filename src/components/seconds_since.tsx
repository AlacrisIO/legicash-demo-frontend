import * as React from 'react'

// Via https://stackoverflow.com/a/39426527/1941213

export interface ISecondsSince { time: Date }

/** Renders the seconds since the date provided in the `time` prop. */
export class SecondsSince extends React.Component<ISecondsSince, {}> {
    public interval: any
    public state: { seconds: number }

    constructor(props: ISecondsSince) {
        super(props)
        this.state = { seconds: this.secondsSinceTimeProp() }
    }

    public secondsSinceTimeProp() {
        const msSince = (new Date).getTime() - this.props.time.getTime()
        return Math.round(msSince / 1000)
    }

    public recordSecondsSinceTimeProp() {
        this.setState((prevState: { seconds: number }) => ({
            seconds: this.secondsSinceTimeProp()
        }))
    }

    public componentDidMount() {
        this.interval = setInterval(() => this.recordSecondsSinceTimeProp(), 1000);
    }

    public componentWillUnmount() {
        clearInterval(this.interval)
    }

    public render() {
        return <div>{this.state.seconds}</div>
    }
}
