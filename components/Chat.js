import React from 'react';
import CustomActions from './CustomActions';
// import for offline features
import NetInfo from '@react-native-community/netinfo';
// import to save messages locally
import AsyncStorage from '@react-native-async-storage/async-storage';
// import firebase to use google firebase database
import * as firebase from 'firebase';
import 'firebase/firestore';
// import gifted chat to create a chat UI
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
// import MapView for geolocation feature
import MapView from 'react-native-maps';


// Ignore log notification by message 
import { LogBox } from 'react-native';
// known bugs, non-threatening warnings, will check back
LogBox.ignoreLogs(['Setting a timer', 'AsyncStorage', 'Animated.event', 'Animated:']);


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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
      isConnected: true,
      image: null,
      location: null,
    };
    // grab the collection messages from the firestore DB
    this.referenceChatMessages = firebase.firestore().collection("messages");

    this.referenceChatMessageUser = null;
  }

  // function to get messages from local storage
  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // save messages at a current point in time to local storage
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  // delete locally stoarge messages
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    // grab name prop from navigator router
    let name = this.props.route.params.name;

    if (name === '') name = 'Anon';

    //once component has mounted, set the title at the top to the user's input
    this.props.navigation.setOptions({ title: name });


    // check to see if the user is offline or online and with that, perform these operations
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        // once component is mounted, check if the user is signed in, if not, created a user through sign in anonymously
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }

          // update user state with currently active user data
          this.setState({
            uid: user.uid,
            messages: [],
            user: {
              _id: user.uid,
              name: name,
              avatar: "https://placeimg.com/140/140/any",
            },
          });

          // listen for updates in the collection
          this.unsubscribe = this.referenceChatMessages
            .orderBy("createdAt", "desc")
            .onSnapshot(this.onCollectionUpdate);

          // created a reference to the active user's documents
          this.referenceChatMessageUser = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);
        });
      } else {
        // get saved messages from local async storage
        this.getMessages();

        // change the is connected state if the user is offline 
        this.setState({
          isConnected: false
        });
      }
    });

  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      // stop listening to authentication
      this.authUnsubscribe();
      this.unsubscribe();
    }
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
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages
    });

    // save messages locally 
    this.saveMessages();
  };

  // a function to add a message to the firestore collection
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || '',
      location: message.location || null,
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.saveMessages();
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

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }

  // function to render geolcation feature
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  // attribute for gifted chat to render Custom Actions 
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  }

  render() {
    // set the background color to selected user color from start
    let bgColor = this.props.route.params.bgColor;
    return (
      <View style={{ backgroundColor: bgColor, flex: 1 }}>
        <View style={styles.giftedChatContainer}>
          <GiftedChat
            renderActions={this.renderCustomActions}
            renderCustomView={this.renderCustomView}
            renderUsernameOnMessage={true}
            accessible={true}
            accessibilityLabel="Chat"
            accessibilityHint="Let's you view messages"
            renderInputToolbar={this.renderInputToolbar.bind(this)}
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