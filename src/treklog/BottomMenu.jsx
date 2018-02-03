import React, {Component} from 'react'
import AnimationMenu from './AnimationMenu';
import TrackDescriptionContainer from './TrackDescriptionContainer';

import './styles/BottomMenu.css';

export default class BottomMenu extends Component {

  render() {
      if(this.props.active) {
          return (    
            
              <div className="bottomMenu">
                  <AnimationMenu />
                  <TrackDescriptionContainer />
              </div>
            
          )
      } else {
        return null;
      }
  }
}