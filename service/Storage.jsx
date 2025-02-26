import AsyncStorage from "@react-native-async-storage/async-storage"

export const setLocalStorage=async(key,value)=>{
    await AsyncStorage.setItem(key,JSON.stringify(value));
}

export const getLocalStorage=async(key)=>{
    const result=await AsyncStorage.getItem(key);
    return JSON.parse(result);
}

export const RemoveLocalStorage=async()=>{
    await AsyncStorage.clear();
}

export const clearLocalStorage = async () => {
    try {
      await AsyncStorage.clear(); // Clears all stored data
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

