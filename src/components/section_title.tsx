import * as React                       from 'react'
import {Accordion, Icon, SemanticICONS} from 'semantic-ui-react'

interface ISectionTitleProps {
    icon:      SemanticICONS;
    title:     string;
    expKey:    string;
    accHandle: () => void;
    isOpen:    (k:string) => boolean
}

export class SectionTitle extends React.Component<ISectionTitleProps> {
    constructor(props: ISectionTitleProps) {
        super(props)
    }

    public render() {
        return (
            <Accordion.Title
                active={this.props.isOpen(this.props.expKey)}
                index={this.props.expKey}
                onClick={this.props.accHandle}
                >
                <div className={'lrsplit'}>
                    <h3 className={'exp'}><Icon name={this.props.icon} size={"large"} /> {this.props.title}</h3>
                    <Icon size={'large'} name={this.props.isOpen(this.props.expKey) ? 'angle up' : 'angle down'} />
                </div>
            </Accordion.Title>
        )
    }
}
