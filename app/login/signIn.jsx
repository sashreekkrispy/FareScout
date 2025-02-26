import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, StatusBar, ToastAndroid, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/FirebaseConfig';
import { setLocalStorage } from '../../service/Storage';

export default function SignIn() {
  const router = useRouter();
  const [email,setEmail]=useState();
  const [password,setPassword]=useState();


  const OnSignInClick=()=>{
    if(!email||!password){
      Alert.alert('Please enter Email & Password');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
  .then(async(userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(user);
    await setLocalStorage('userDetail',user);
    router.push('(tabs)');
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if(errorCode=='auth/invalid-credential'){
      Alert.alert('Invalid Email or Password');
    }
  });

  }

  return (
    <View style={styles.container}>
      {/* StatusBar ensures no weird spacing on top */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND} />

      <Text style={styles.headerText}>Let's Sign You In</Text>
      <Text style={styles.subText}>Welcome Back! We've missed you.</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={Colors.GRAY}
          style={styles.textInput}
          onChangeText={(value)=>setEmail(value)}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={Colors.GRAY}
          secureTextEntry={true}
          style={styles.textInput}
          onChangeText={(value)=>setPassword(value)}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={OnSignInClick}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.push('login/signUp')}
      >
        <Text style={styles.createAccountText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND, // Updated to a better background color
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: Colors.GRAY,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.PRIMARY,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderColor: Colors.GRAY,
    borderWidth: 1,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  loginButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    color: Colors.SECONDARY,
    fontWeight: '600',
  },
  createAccountButton: {
    marginTop: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
});
