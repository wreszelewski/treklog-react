import React, {Component} from 'react'
import { Icon, Label, Popup } from 'semantic-ui-react'

export default class TrackDescriptionLabel extends Component {

    render() {
        if(this.props.value) {
            return (
                <Popup
                    trigger={
                        <Label className="singleStat">
                            <Icon name={this.props.icon} /><span>{this.props.value + this.props.unit}</span>
                        </Label>
                    }
                    content={this.props.description}
                    position="top center"
                />
            );
        } else {
            return null;
        }
    }
}