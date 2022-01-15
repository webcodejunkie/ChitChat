import React from 'react';

import { GiftedChat, Bubble } from 'react-native-gifted-chat';

import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
  }

  componentDidMount() {
    // grab name prop from navigator router
    let name = this.props.route.params.name;
    //once component has mounted, set the title at the top to the user's input
    this.props.navigation.setOptions({ title: name });
    // set static messagesto see UI elements right away
    this.setState({
      messages: [
        {
          _id: 1,
          text: `${name} has entered chat!`,
          createdAt: new Date(),
          system: true,
        },
        {
          _id: 2,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/120/120/any',
          },
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#0095ff'
          }
        }}
      />
    )
  }

  render() {
    // set the background color to selected user color from start
    let bgColor = this.props.route.params.bgColor;
    return (
      <View style={{ backgroundColor: bgColor, flex: 1 }}>
        <View style={styles.giftedChatContainer}>
          <GiftedChat
            accessible={true}
            accessibilityLabel="Chat"
            accessibilityHint="Let's you view messages"
            renderBubble={this.renderBubble.bind(this)}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 1,
            }}
          />
          {Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  giftedChatContainer: {
    flex: 1
  }
});