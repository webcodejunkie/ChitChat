import React from 'react';

import { View } from 'react-native';

export default class Chat extends React.Component {

  componentDidMount() {
    // grab name prop from navigator router
    let name = this.props.route.params.name;
    //once component has mounted, set the title at the top to the user's input
    this.props.navigation.setOptions({ title: name });
  }

  render() {
    // set the background color to selected user color from start
    let bgColor = this.props.route.params.bgColor;
    return (
      <View style={{ backgroundColor: bgColor, flex: 1 }}>
      </View>
    );
  }
}