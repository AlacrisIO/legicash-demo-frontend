import * as React from 'react'

// Via https://stackoverflow.com/a/39426527/1941213

export interface ISecondsSince { time: Date }

export class SecondsSince extends React.Component<ISecondsSince, {}> {
    public interval: any
    public state: { seconds: number }
    constructor(props: ISecondsSince) {
        super(props)
        this.state = { seconds: (new Date).getTime() - props.time.getTime() }
    }

    public tick() {
        this.setState((prevState: { seconds: number }) => ({
            seconds: prevState.seconds + 1
        }))
    }

    public componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    public componentWillUnmount() {
        clearInterval(this.interval)
    }

    public render() {
        return <div>{this.state.seconds}</div>
    }
}
