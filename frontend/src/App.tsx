import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Get device dimensions to create responsive layouts
const { width, height } = Dimensions.get('window');
const isLargeDevice = width >= 400; // Check if it's a larger device like iPhone 15 Pro Max

type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
};

type Category = {
  name: string;
  budget: number;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>([
    { name: 'Housing', budget: 1000 },
    { name: 'Food', budget: 500 },
    { name: 'Transportation', budget: 300 },
    { name: 'Entertainment', budget: 200 },
  ]);
  const [newTransaction, setNewTransaction] = useState<{
    description: string;
    amount: string;
    category: string;
    type: Transaction['type'];
  }>({
    description: '',
    amount: '',
    category: 'Housing',
    type: 'expense',
  });

  // Use insets to get safe area values
  const insets = useSafeAreaInsets();

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      date: new Date().toISOString().split('T')[0],
      type: newTransaction.type,
    };
    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      description: '',
      amount: '',
      category: 'Housing',
      type: 'expense',
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[
        styles.header,
        { marginTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 50 : StatusBar.currentHeight }
      ]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="wallet" size={24} color="#4F46E5" />
          <Text style={styles.headerText}>Budget Tracker</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Balance</Text>
              <MaterialCommunityIcons name="chart-pie" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardAmount}>${balance.toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Income</Text>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#22C55E" />
            </View>
            <Text style={[styles.cardAmount, styles.incomeText]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Expenses</Text>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.cardAmount, styles.expenseText]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.transactionsList}>
              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>No transactions yet</Text>
              ) : (
                transactions.map(transaction => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionMeta}>
                        {transaction.category} • {transaction.date}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text
                        style={[
                          styles.amount,
                          transaction.type === 'income'
                            ? styles.incomeText
                            : styles.expenseText,
                        ]}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteTransaction(transaction.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons
                          name="trash-can"
                          size={20}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Transaction</Text>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.description}
                  onChangeText={text =>
                    setNewTransaction({
                      ...newTransaction,
                      description: text,
                    })
                  }
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.amount}
                  onChangeText={text =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: text,
                    })
                  }
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTransaction.category}
                    onValueChange={(value: string) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: value,
                      })
                    }
                    style={styles.picker}
                  >
                    {categories.map(category => (
                      <Picker.Item
                        key={category.name}
                        label={category.name}
                        value={category.name}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newTransaction.type === 'expense' && styles.activeTypeButton,
                    ]}
                    onPress={() =>
                      setNewTransaction({
                        ...newTransaction,
                        type: 'expense',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTransaction.type === 'expense' &&
                          styles.activeTypeButtonText,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newTransaction.type === 'income' && styles.activeTypeButton,
                    ]}
                    onPress={() =>
                      setNewTransaction({
                        ...newTransaction,
                        type: 'income',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTransaction.type === 'income' &&
                          styles.activeTypeButtonText,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={addTransaction}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Categories</Text>
            <View style={styles.categoriesList}>
              {categories.map(category => {
                const spent = transactions
                  .filter(t => t.category === category.name && t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / category.budget) * 100;

                return (
                  <View key={category.name} style={styles.categoryItem}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryAmount}>
                        ${spent.toFixed(2)} / ${category.budget}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor:
                              percentage > 100
                                ? '#DC2626'
                                : percentage > 75
                                ? '#D97706'
                                : '#059669',
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingBottom: 80, // Increased bottom padding for better scrolling experience
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: isLargeDevice ? 24 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // marginTop is now set dynamically in the component
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: isLargeDevice ? 24 : 22,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#111827',
  },
  cards: {
    padding: isLargeDevice ? 24 : 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isLargeDevice ? 20 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: isLargeDevice ? 20 : 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: isLargeDevice ? 18 : 16,
    color: '#6B7280',
  },
  cardAmount: {
    fontSize: isLargeDevice ? 32 : 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  incomeText: {
    color: '#22C55E',
  },
  expenseText: {
    color: '#EF4444',
  },
  content: {
    paddingHorizontal: isLargeDevice ? 24 : 16,
    paddingTop: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isLargeDevice ? 24 : 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: isLargeDevice ? 20 : 16,
    color: '#111827',
  },
  transactionsList: {
    gap: isLargeDevice ? 16 : 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isLargeDevice ? 16 : 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: isLargeDevice ? 14 : 13,
    color: '#6B7280',
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isLargeDevice ? 10 : 8,
  },
  amount: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
  },
  deleteButton: {
    padding: isLargeDevice ? 8 : 6,
  },
  emptyText: {
    fontSize: isLargeDevice ? 16 : 15,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  form: {
    gap: isLargeDevice ? 20 : 16,
  },
  formGroup: {
    gap: isLargeDevice ? 8 : 6,
  },
  label: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    padding: isLargeDevice ? 16 : 14,
    fontSize: isLargeDevice ? 16 : 15,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: isLargeDevice ? 54 : 48,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    height: isLargeDevice ? 54 : 48,
  },
  picker: {
    height: isLargeDevice ? 54 : 48,
    width: '100%',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: isLargeDevice ? 16 : 12,
  },
  typeButton: {
    flex: 1,
    padding: isLargeDevice ? 16 : 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    height: isLargeDevice ? 54 : 48,
    justifyContent: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#4F46E5',
  },
  typeButtonText: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isLargeDevice ? 16 : 14,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    marginTop: 12,
    height: isLargeDevice ? 56 : 50,
  },
  addButtonText: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  categoriesList: {
    gap: isLargeDevice ? 16 : 12,
  },
  categoryItem: {
    gap: isLargeDevice ? 12 : 10,
    backgroundColor: '#F9FAFB',
    padding: isLargeDevice ? 16 : 14,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? 8 : 6,
  },
  categoryName: {
    fontSize: isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#111827',
  },
  categoryAmount: {
    fontSize: isLargeDevice ? 15 : 14,
    color: '#6B7280',
  },
  progressBar: {
    height: isLargeDevice ? 8 : 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
});

export default App;