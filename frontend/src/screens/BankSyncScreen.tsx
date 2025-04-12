import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');
const isLargeDevice = width >= 400;

const banks = [
  { id: '1', name: 'Chase', icon: 'bank' },
  { id: '2', name: 'Bank of America', icon: 'bank' },
  { id: '3', name: 'Wells Fargo', icon: 'bank' },
  { id: '4', name: 'Capital One', icon: 'bank' },
  { id: '5', name: 'Citibank', icon: 'bank' },
];

type BankSyncScreenProps = {
  navigation: any;
};

export default function BankSyncScreen({ navigation }: BankSyncScreenProps) {
  const [syncingBank, setSyncingBank] = useState<string | null>(null);
  const [syncComplete, setSyncComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleBankSelect = (bankId: string) => {
    setSyncingBank(bankId);
    // Simulate sync process
    setTimeout(() => {
      setSyncComplete(true);
    }, 2000);
  };

  const handleCsvUpload = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];
      setUploadedFile(file.name);

      // Create form data for upload
      const formData = new FormData();
      formData.append('csv', {
        uri: file.uri,
        name: file.name,
        type: 'text/csv',
      } as any);

      // Send to backend

      const response = await fetch('http://10.20.59.57:5001/analyze_spending', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Analysis results:', data);
      setAnalysis(data);
      
      Alert.alert(
        "Analysis Complete",
        "Transactions processed successfully!",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        "Upload Failed",
        error instanceof Error ? error.message : "Failed to process CSV",
        [{ text: "OK" }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('MainApp', { analysis});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="bank-transfer" size={40} color="#4F46E5" />
          <Text style={styles.title}>Connect Your Bank</Text>
          <Text style={styles.subtitle}>
            Securely connect your bank account to get started with Smart Finance
          </Text>
        </View>

        <View style={styles.content}>
          {!syncComplete ? (
            <>
              <Text style={styles.sectionTitle}>Select Your Bank</Text>
              <View style={styles.bankList}>
                {banks.map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    style={[
                      styles.bankItem,
                      syncingBank === bank.id && styles.bankItemSyncing,
                    ]}
                    onPress={() => handleBankSelect(bank.id)}
                    disabled={syncingBank !== null}
                  >
                    <MaterialCommunityIcons
                      name={bank.icon as any}
                      size={24}
                      color="#4F46E5"
                    />
                    <Text style={styles.bankName}>{bank.name}</Text>
                    {syncingBank === bank.id && (
                      <View style={styles.syncingIndicator}>
                        <MaterialCommunityIcons
                          name="sync"
                          size={20}
                          color="#4F46E5"
                        />
                        <Text style={styles.syncingText}>Connecting...</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={64}
                color="#059669"
              />
              <Text style={styles.successTitle}>Successfully Connected!</Text>
              <Text style={styles.successText}>
                Your bank account has been successfully connected. You can now start
                tracking your finances.
              </Text>

              {/* CSV Upload Section */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadTitle}>Import Transaction Data</Text>
                <Text style={styles.uploadInfo}>
                  Optionally, you can upload a CSV file with your transaction history.
                </Text>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleCsvUpload}
                  disabled={isUploading}
                >
                  <MaterialCommunityIcons
                    name="file-upload"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.uploadButtonText}>
                    {isUploading ? "Uploading..." : "Upload CSV File"}
                  </Text>
                </TouchableOpacity>

                {uploadedFile && (
                  <View style={styles.fileInfo}>
                    <MaterialCommunityIcons
                      name="file-check"
                      size={20}
                      color={"#059669"}
                    />
                    <Text style={styles.fileInfoText}>{uploadedFile}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: isUploading ? 'gray' : 'blue' } // change color dynamically
                ]}
                onPress={handleContinue}
                disabled={isUploading}
              >
                <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.securityInfo}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#059669" />
            <Text style={styles.securityText}>
              Your data is encrypted and secure. We use bank-level security to
              protect your information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    padding: isLargeDevice ? 32 : 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    padding: isLargeDevice ? 24 : 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  bankList: {
    gap: 12,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bankItemSyncing: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncingText: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  // New styles for CSV upload
  uploadSection: {
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  uploadInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    width: '100%',
  },
  fileInfoText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 8,
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    marginLeft: 12,
  },
});