import { View, Text, TouchableOpacity, TextInput, StyleSheet, StatusBar, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import Colors from '../../constants/Colors';
import {auth} from './../../config/FirebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setLocalStorage } from '../../service/Storage';

export default function SignUp() {
    const router = useRouter();
    const [email,setEmail]=useState();
    const [password,setPassword]=useState();
    const [userName,setUserName]=useState();
    

    const OnCreateAccount=()=>{

      if(!email||!password||!userName){
        ToastAndroid.show('Please fill all details',ToastAndroid.BOTTOM);
        return;
      }
      
      createUserWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
    // Signed up 
    const user = userCredential.user;
    await updateProfile(user,{
        displayName:userName 
    })
    await setLocalStorage('userDetail',user);
    router.push('(tabs)');
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode);
    if(errorCode=='auth/email-already-in-use'){
      ToastAndroid.show('Email already exists',ToastAndroid.BOTTOM);
    }
    // ..
  });
    }



    return (
        <View style={styles.container}>
            {/* StatusBar ensures no weird spacing on top */}
            <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND} />

            <Text style={styles.headerText}>Create New Account</Text>
            <Text style={styles.subText}>Join us today and start your journey!</Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput placeholder="Enter your full name" style={styles.textInput} onChangeText={(value)=>setUserName(value)} />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput placeholder="Enter your email" style={styles.textInput} onChangeText={(value)=>setEmail(value)}/>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    style={styles.textInput}
                    onChangeText={(value)=>setPassword(value)}
                />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity style={styles.loginButton} onPress={OnCreateAccount}>
                <Text style={styles.loginButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => router.push('login/signIn')}
            >
                <Text style={styles.createAccountText}>Account already exists? Sign In</Text>
            </TouchableOpacity>
        </View>
    )
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
