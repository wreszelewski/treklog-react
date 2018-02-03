import React, {Component} from 'react'
import { Segment, Menu, Icon, Dropdown } from 'semantic-ui-react'
import './styles/AnimationMenu.css';

export default class AnimationMenu extends Component {

    handleItemClick() {
        return;
    }

    render() {
            console.log(this.props.actions);
            return (    
            
                <Segment id="animationMenu" inverted>
                <div className="movieMenu">
                        <Menu size="mini" inverted icon borderless className="menuButtons">
                            <Menu.Item name='play' onClick={this.props.actions.animationPlay}>
                                <Icon name='play' />
                            </Menu.Item>
                            <Menu.Item name='pause' onClick={this.props.actions.animationPause}>
                                <Icon name='pause' />
                            </Menu.Item>
                            <Menu.Item name='stop' onClick={this.props.actions.animationStop}>
                                <Icon name='stop' />
                            </Menu.Item>
                                <Dropdown icon="setting" pointing className="bottom left icon item">
                                    <Dropdown.Menu className="ui movieOptions">
                                        <Dropdown.Item className="ui inverted form">
                                            <div className="inline field">
                                                <label>Szybkość</label>
                                                <input id="speed" className="number" type="number" defaultValue="300" step="100" />
                                                <label className="unit">[x]</label>
                                            </div>
                                            <div className="field">
                                                <button id="saveSettings" className="ui mini inverted button">Zapisz</button>
                                            </div>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                        </Menu>
                <div id="animationProgress" className="ui white progress">
                        <div id="animationProgressBar" className="bar">
                                <div className="progress"></div>
                                <div id="mouseLabel"></div>
                        </div>
                    </div>
                    </div>
                    </Segment>
                    
            
            );
    }
}