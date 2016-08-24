/*
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Image,
  Dimensions
} from 'react-native';

import Button from './components/Button';
import NormalText from './components/NormalText';
import renderIf from './utils/renderIf'

const API_URL = 'https://master.thorhudl.com'
const KEY_TOKEN = '@Hudl:token';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

class Hudl extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      token: null,
      loggedIn: false,
      email: null,
      password: null,
      buttonText: 'LOG IN',
      userInfo: '',
      photoUri: 'blank'
    };

    // Bind event handlers, since we're using a ES2015 class.
    this._login = this._login.bind(this);
    this._authorized = this._authorized.bind(this);
  }

  componentDidMount() {
    console.log(`Height: ${height}, Width: ${width}`);
    AsyncStorage.getItem(KEY_TOKEN)
      .then((value) => {
        if (value !== null) {
          console.log(`Got stored token: ${value}`)
          this._authorized(value);
        }
      })
      .catch((error) => console.log('[componentDidMount] AsyncStorage error: ' + error.message))
      .done();
  }

  render() {
    buttonText = this.state.buttonText;
    userInfo = this.state.userInfo;

    return (
      <View>
      <Image source={require('./images/icon_hudllogo_login.png')}
               style={styles.loginLogo}
                />
      <View style={styles.container}>
        <Text style={styles.userInfo}>
          Pointing to {API_URL}
        </Text>
        {renderIf(!this.state.loggedIn)(
        <TextInput ref={"_textInputEmail"}
                   style={styles.emailInput}
                   placeholder="Email"
                   autoCorrect={false}
                   autoCapitalize="none"
                   returnKeyType="next"
                   placeholderTextColor={colors.white}
                   clearButtonMode="while-editing"
                   onSubmitEditing={(event) => this.refs._textInputPassword.focus()}
                   onChangeText={(text) => this.setState({email: text})} />
        )}
        {renderIf(!this.state.loggedIn)(
        <TextInput ref="_textInputPassword"
                   style={styles.emailInput}
                   placeholder="Password"
                   placeholderTextColor={colors.white}
                   secureTextEntry={true}
                   returnKeyType="done"
                   clearButtonMode="while-editing"
                   onSubmitEditing={(event) => this._login()}
                   onChangeText={(text) => this.setState({password: text})} />
        )}
        <Button style={styles.loginButton}
                onPress={this._login}
                disabled={this.state.loggedIn}>
          <NormalText style={styles.mainText}>
            {buttonText}
          </NormalText>
        </Button>
        <Text style={styles.userInfo}>
          {userInfo}
        </Text>
        <Image source={{uri: this.state.photoUri}}
               style={styles.photo}/>
      </View>
      </View>
    );
  }

  _login() {
    if (this.state.email === null || this.state.password === null) {
      console.warn('Email and/or password missing.');
      return;
    }

      fetch(`${API_URL}/api/v2/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.email,
          password: this.state.password
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState ({
          loggedIn: true,
          email: null,
          password: null,
          buttonText: `Welcome, ${responseJson.firstName}!`,
          photoUri: responseJson.photoUris[0],
          userInfo: (
          'Name: ' + responseJson.firstName + ' ' + responseJson.lastName + '\n' +
          'User ID: ' + responseJson.userId + '\n' +
          '# of teams: ' + responseJson.teamRoles.length)
        });
        return responseJson;
      })
      .then((responseJson) => console.log(`Login reponse: ${JSON.stringify(responseJson)}`))
      .catch((error) => console.warn(`Login error: ${error.message}`));

    console.log('Login process done.');

    this._authorized('abc123');
  }

  _authorized(token) { 
    console.log(`Authorized: ${token}`)

    AsyncStorage.setItem(KEY_TOKEN, token)
      .then(() => console.log(`Saved token to disk: ${token}`))
      .catch((error) => console.log('[_authorized] AsyncStorage error: ' + error.message))
      .done();

    this.setState({
      token: token
    });
  }
}

const baseFontSize = 18;
import colors from './styles/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    margin: 10,
  },
  loginButton : {
    backgroundColor: colors.blue,
    padding: 5,
    alignSelf: 'stretch'
  },
  mainText: {
    fontSize: baseFontSize,
    color: '#FFFFFF'
  },
  emailInput: {
    height: 40,
    alignSelf: 'stretch',
    padding: 5,
    margin: 10,
    backgroundColor: colors.gray50,
    color: colors.white
  },
  loginLogo: {
    alignSelf: "center",
    width: height * .15,
    height: height * .15,
    marginTop: height * .12,
    marginBottom: height * .06

  },
  photo: {
    alignSelf: "center",
    width: 175,
    height: 175,
    margin: 10
  },
  userInfo: {
    color: colors.hudlOrange,
    alignSelf: "center",
  }
});

export default Hudl;