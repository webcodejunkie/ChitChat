import React from 'react';

// import firebase
import firebase from 'firebase/compat/app';
require('firebase/firestore');

// v9 compat packages are API compatible with v8 code
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// import gifted chat to create a chat UI
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';

// firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyAgzF-tpPzhMOMV41ScaOX21f36PmBqRRk",
    authDomain: "chit-chat-1b0ae.firebaseapp.com",
    projectId: "chit-chat-1b0ae",
    storageBucket: "chit-chat-1b0ae.appspot.com",
    messagingSenderId: "749059375112",
    appId: "1:749059375112:web:af391915b4429351d191bd",
    measurementId: "G-PD0P6GG6Z9"
};

let app;
app = firebase.initializeApp(firebaseConfig);

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
    };
    // grab the collection messages from the firestore DB
    this.referenceChatMessages = firebase.firestore().collection("messages");

    this.referenceChatMessageUser = null;
  }

  componentDidMount() {

    // grab name prop from navigator router
    let name = this.props.route.params.name;

    //once component has mounted, set the title at the top to the user's input
    this.props.navigation.setOptions({ title: name });

    // once component is mounted, check if the user is signed in, if not, created a user through sign in anonymously
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }

      // update user state with currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
      });

      // listen for updates in the collection
      console.log(this.unsubscribe);
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapShot(this.onCollectionUpdate);

      // created a reference to the active user's documents
      this.referenceChatMessageUser = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);
    });
    }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages: messages
    });
  };

  // a function to add a message to the firestore collection
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.addMessages();
      }
    );
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
              _id: this.state.user._id,
              name: this.state.name,
              avatar: this.state.avatar,
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