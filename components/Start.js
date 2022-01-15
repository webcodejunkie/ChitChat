import React from 'react';

import { StyleSheet, TouchableOpacity, View, Text, Pressable, TextInput, ImageBackground, Image } from 'react-native';

// Import vector icons from font awesome
import Icon from 'react-native-vector-icons/FontAwesome';


export default class Start extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      backgroundColor: null,
      activeColor: null,
    };
  }
  render() {

    // Array for color buttons
    const color = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

    // Background image
    const image = require('../assets/background.png');

    return (
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <Text style={styles.Title}>Chit Chat</Text>
        <View style={styles.inputBox}>
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="gray" />
            <TextInput placeholder='Your Name' style={styles.nameInput} onChangeText={(name) => this.setState({ name })} value={this.state.name} />
          </View>
          <View>
            <Text>Choose Background Color:</Text>
            <View style={{ width: '100%', height: 20, backgroundColor: this.state.activeColor }}></View>
            { /*Create a map function to map over the color array and create a list of touchable colors to save repeat code*/}
            <View style={styles.colorContainer}>
              {color.map((colors, index) => {
                return <TouchableOpacity
                  key={index}
                  onPress={() => {
                    this.setState({
                      backgroundColor: colors,
                      activeColor: colors
                    });
                  }}
                  style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: colors, margin: 10, }}
                />
              })}
            </View>
          </View>
          <View>
            <Pressable style={styles.startButtonStyle} onPress={() => this.props.navigation.navigate("Chat", { name: this.state.name, bgColor: this.state.backgroundColor })}>
              <Text style={styles.startText}>Start Chatting</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({

  image: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },

  Title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFF'
  },

  inputBox: {
    backgroundColor: '#FFF',
    padding: 20,
    justifyContent: 'space-evenly',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'gray',
    borderStyle: 'solid',
    borderRadius: 2,
    padding: 20,
  },

  nameInput: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 50,
    margin: 5,
  },

  colorContainer: {
    flexDirection: 'row',
  },

  startButtonStyle: {
    alignItems: 'center',
    backgroundColor: '#757083',
  },

  startText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    padding: 20
  }
});