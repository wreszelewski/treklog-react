import React, {Component} from 'react'
import AnimationMenuContainer from './AnimationMenuContainer';
import TrackDescriptionContainer from './TrackDescriptionContainer';

import './styles/BottomMenu.css';

export default class BottomMenu extends Component {

  render() {
      if(this.props.active) {
          return (    
            
              <div className="bottomMenu">
                  <AnimationMenuContainer />
                  <TrackDescriptionContainer />
              </div>
            
          )
      } else {
        return null;
      }
  }
}